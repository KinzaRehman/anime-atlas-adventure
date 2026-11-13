// Simulation engine. Every player action runs as that test account through the normal signed-in
// database rules (RLS); the service client is used only to create/remove test accounts and write sim logs.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { PERSONAS, testEmail, currentPersona, type Persona } from "./personas";
import { emptyMemory, planDialogue, rememberDialogue, type DialogueMemory } from "./dialogue";
import { freshProgress, nextStep, applyStep, claimReady, replayActivity } from "./progress-sim";
import type { Progress } from "@/lib/progress";
import { animeKey } from "@/data/anime-catalogue";
import { COLLECTIBLES } from "@/data/game";
import { chatTurn } from "@/lib/chat-core";
import { posts as postText, comment as commentText } from "./writing";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DB = SupabaseClient<any>;
export interface SimEnv { url: string; publishableKey: string; admin: DB; secret: string; }
type Ev = { kind: string; detail?: Record<string, unknown>; ok?: boolean; error?: string; at: Date };

function shim(key: string): typeof fetch {
  return (input, init) => {
    const h = new Headers(init?.headers);
    if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
    h.set("apikey", key);
    return fetch(input, { ...init, headers: h });
  };
}
export const userClient = (env: SimEnv): DB => createClient(env.url, env.publishableKey, { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: shim(env.publishableKey) } });

export async function passwordFor(env: SimEnv, email: string) {
  const k = await crypto.subtle.importKey("raw", new TextEncoder().encode(env.secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", k, new TextEncoder().encode(`animeatlas-sim:${email}`)));
  return "Sim-" + [...sig.slice(0, 18)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
// Deterministic per user/day so a rerun of the same seed behaves the same way.
export function rng(seed: string) {
  let h = 2166136261; for (const c of seed) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
  return () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 100000) / 100000; };
}
export const simDate = (epoch: string, day: number, hour: number, minute = 0) => new Date(Date.parse(`${epoch}T00:00:00Z`) + ((day - 1) * 24 + hour) * 3600_000 + minute * 60_000);

/** Whether a persona opens the app on a given simulated day. */
export function isActive(p: Persona, day: number, r: () => number) {
  if (day < p.joinedDay) return false;
  const age = day - p.joinedDay;
  if (age === 0) return true;
  switch (p.archetype) {
    case "daily": return r() < 0.9;
    case "achiever": return r() < 0.85;
    case "social": return r() < 0.7;
    case "character": return r() < 0.6;
    case "casual": return r() < 0.28;
    case "newbie": return age < 3 ? r() < 0.6 : r() < 0.06;
    case "returning": return age < 5 ? r() < 0.8 : age < 19 ? false : r() < 0.6;
  }
}

/** Signed-in client for a test account. Reuses a still-valid session like an open browser tab,
 * refreshes it when expired, and signs in with the password only when there is no session. */
export async function sessionFor(env: SimEnv, u: { user_id: string; email: string }): Promise<{ db: DB; id: string | null; via: string; error?: string }> {
  const saved = (await env.admin.from("sim_tokens").select("refresh_token, access_token, expires_at").eq("user_id", u.user_id).maybeSingle()).data;
  if (saved?.access_token && saved.expires_at && Date.parse(saved.expires_at) > Date.now() + 120_000) {
    const token = saved.access_token;
    const db = createClient(env.url, env.publishableKey, { accessToken: async () => token, global: { fetch: shim(env.publishableKey) } });
    return { db, id: u.user_id, via: "open session" };
  }
  const db = userClient(env);
  let via = "refreshed session";
  let res = saved ? await db.auth.refreshSession({ refresh_token: saved.refresh_token }) : null;
  if (!res?.data.session) { via = "password"; res = await db.auth.signInWithPassword({ email: u.email, password: await passwordFor(env, u.email) }); }
  const session = res.data.session;
  if (!session || session.user.id !== u.user_id) return { db, id: null, via, error: res.error?.message ?? "no session" };
  await env.admin.from("sim_tokens").upsert({ user_id: u.user_id, refresh_token: session.refresh_token, access_token: session.access_token, expires_at: new Date((session.expires_at ?? 0) * 1000).toISOString(), updated_at: new Date().toISOString() });
  return { db, id: session.user.id, via };
}
export async function endSession(env: SimEnv, userId: string) {
  const saved = (await env.admin.from("sim_tokens").select("access_token").eq("user_id", userId).maybeSingle()).data;
  if (saved?.access_token) await env.admin.auth.admin.signOut(saved.access_token, "local");
  await env.admin.from("sim_tokens").delete().eq("user_id", userId);
}

export async function seed(env: SimEnv) {
  const { data: existing, error } = await env.admin.from("sim_users").select("handle");
  if (error) throw new Error(error.message);
  const have = new Set((existing ?? []).map((r) => r.handle));
  let created = 0, reused = 0;
  for (const p of PERSONAS) {
    if (have.has(p.handle)) {
      const update = await env.admin.from("sim_users").update({ persona: p }).eq("handle", p.handle);
      if (update.error) throw new Error(update.error.message);
      reused++; continue;
    }
    const email = testEmail(p.handle), password = await passwordFor(env, email);
    const res = await env.admin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { display_name: p.name, test_account: true } });
    let id = res.data.user?.id;
    if (!id) {
      // Account exists from an interrupted seed: find it instead of duplicating.
      const list = await env.admin.auth.admin.listUsers({ perPage: 1000 });
      id = list.data.users.find((u) => u.email === email)?.id;
      if (!id) throw new Error(res.error?.message ?? `Could not create ${email}`);
      await env.admin.auth.admin.updateUserById(id, { password });
    }
    const ins = await env.admin.from("sim_users").upsert({ user_id: id, handle: p.handle, email, display_name: p.name, archetype: p.archetype, joined_day: p.joinedDay, persona: p, progress: { ...freshProgress(), name: p.name, avatar: p.avatar } }, { onConflict: "handle" });
    if (ins.error) throw new Error(ins.error.message);
    created++;
  }
  return { created, reused, total: PERSONAS.length };
}

type SimUser = { user_id: string; handle: string; email: string; persona: Persona; progress: Progress; relationships: Record<string, Rel>; last_active_day: number | null; joined_day: number };
export type Rel = { level: number; chats: number; quest: string; milestones: string[]; lastSeenDay: number; dialogue?: DialogueMemory };

const REL_NAMES = ["Stranger", "Acquaintance", "Friend", "Good friend", "Close friend"];
export const relName = (l: number) => REL_NAMES[Math.min(l, 4)]!;

export async function runDay(env: SimEnv) {
  const st = await env.admin.from("sim_state").select("*").eq("id", 1).single();
  if (st.error) throw new Error(st.error.message);
  if (st.data.paused) return { ran: false, reason: "paused", day: st.data.sim_day };
  const day = st.data.sim_day + 1;
  if (day > 60) return { ran: false, reason: "limit", day: st.data.sim_day };
  // Claim the day atomically so two runs can never simulate the same day twice.
  const claim = await env.admin.from("sim_state").update({ sim_day: day, updated_at: new Date().toISOString() }).eq("id", 1).eq("sim_day", day - 1).select("sim_day");
  if (claim.error) throw new Error(claim.error.message);
  if (!claim.data?.length) return { ran: false, reason: "busy", day: st.data.sim_day };
  const epoch = st.data.epoch as string;
  const users = (await env.admin.from("sim_users").select("*").order("joined_day")).data as SimUser[] | null;
  if (!users?.length) return { ran: false, reason: "no users", day };
  const budget = { left: Math.max(0, st.data.ai_budget - st.data.ai_used), used: 0 };
  const active = users.filter((u) => isActive(u.persona, day, rng(`${u.handle}:${day}:active`)));
  let actions = 0, failures = 0;
  // Small batches: concurrent sessions without flooding the database.
  for (let i = 0; i < active.length; i += 5) {
    const results = await Promise.all(active.slice(i, i + 5).map((u) => simulateUser(env, u, day, epoch, budget)));
    for (const r of results) { actions += r.actions; failures += r.failures; }
  }
  if (budget.used) await env.admin.from("sim_state").update({ ai_used: st.data.ai_used + budget.used }).eq("id", 1);
  return { ran: true, day, active: active.length, actions, failures, aiUsed: budget.used };
}

async function simulateUser(env: SimEnv, u: SimUser, day: number, epoch: string, budget: { left: number; used: number }) {
  const p = currentPersona(u.persona), r = rng(`${u.handle}:${day}`);
  const evs: Ev[] = [];
  let minute = Math.floor(r() * 40);
  const at = () => simDate(epoch, day, p.hour, (minute += 1 + Math.floor(r() * 6)));
  const log = (kind: string, detail: Record<string, unknown> = {}, ok = true, error?: string) => evs.push({ kind, detail, ok, at: at(), ...(error ? { error } : {}) });
  let prog: Progress = { ...freshProgress(), ...u.progress };
  const rel: Record<string, Rel> = { ...u.relationships };
  const touch = (c: string) => (rel[c] ??= { level: 0, chats: 0, quest: "not started", milestones: [], lastSeenDay: day });
  const first = u.last_active_day == null;
  const gap = u.last_active_day == null ? 0 : day - u.last_active_day;

  const auth = await sessionFor(env, u);
  const db = auth.db;
  if (!auth.id) {
    log("login", {}, false, auth.error ?? "no user");
    await flush(env, u, day, evs, prog, rel, 0);
    return { actions: 0, failures: 1 };
  }
  const uid = auth.id;
  log(first ? "onboarding" : gap >= 7 ? "returned" : "login", first ? { avatar: p.avatar, via: auth.via } : { daysAway: gap, via: auth.via });
  const now = () => evs[evs.length - 1]!.at;

  const explore = (steps: number, abandonChance = 0) => {
    for (let s = 0; s < steps; s++) {
      const step = nextStep(prog);
      if (!step) {
        // Finished the chain: replay the daily library-to-café loop for missions.
        for (const loc of ["library", "cafe"]) { prog = replayActivity(prog, loc, now()); log("replay_activity", { location: loc }); }
        break;
      }
      if (step.kind === "activity" && r() < abandonChance) { log("abandoned_activity", { character: step.character, location: step.location }); break; }
      const isNew = !prog.visited.includes(step.location);
      const res = applyStep(prog, step, now());
      const newChars = res.state.chars.filter((c) => !prog.chars.includes(c));
      prog = res.state;
      const re = touch(step.character); re.lastSeenDay = day;
      re.quest = step.kind === "meet" ? "met" : step.kind === "activity" ? "activity done" : "quest complete";
      if (step.kind === "meet") log("met_character", { character: step.character, location: step.location });
      else log(step.kind === "activity" ? "completed_activity" : "quest_turned_in", { character: step.character, location: step.location, xp: res.xp });
      if (isNew) log("discovered_location", { location: step.location });
      for (const c of newChars) log("collectible_unlocked", { card: c, name: COLLECTIBLES.find((x) => x.id === c)?.name });
    }
    const claim = claimReady(prog, now());
    prog = claim.state;
    for (const m of claim.claimed) log("mission_claimed", { mission: m });
  };

  const safe = async (kind: string, fn: () => Promise<Record<string, unknown> | void>) => {
    try { const d = await fn(); log(kind, d ?? {}); }
    catch (e) { log(kind, {}, false, e instanceof Error ? e.message : String(e)); }
  };
  const recentPosts = async () => {
    const res = await db.from("posts").select("id, title, author_id, created_at").eq("is_test", true).neq("author_id", uid).order("created_at", { ascending: false }).limit(12);
    if (res.error) throw new Error(res.error.message);
    return res.data ?? [];
  };
  const post = (kind: "discovery" | "question" | "opinion" | "return") => safe("community_post", async () => {
    const t = postText(p, kind, prog, r);
    // Real people don't post the same thing twice.
    const dup = await db.from("posts").select("id").eq("author_id", uid).eq("title", t.title).limit(1);
    if (dup.data?.length) return { skipped: "already posted this", title: t.title };
    const res = await db.from("posts").insert({ author_id: uid, fandom: t.fandom, title: t.title, body: t.body, spoiler: null, created_at: now().toISOString(), updated_at: now().toISOString() }).select("id").single();
    if (res.error) throw new Error(res.error.message);
    return { postId: res.data.id, title: t.title, type: kind };
  });
  const commentOn = (n: number) => safe("community_comment", async () => {
    const list = await recentPosts(); if (!list.length) return { skipped: "no posts yet" };
    const made: string[] = [];
    for (let k = 0; k < n; k++) {
      const target = list[Math.floor(r() * Math.min(list.length, 6))]!;
      const thread = await db.from("comments").select("id, author_id, body").eq("post_id", target.id).order("created_at").limit(30);
      // People rarely reply twice to the same post, and don't repeat what someone already said.
      if (thread.data?.some((c) => c.author_id === uid) && r() < 0.8) continue;
      const parentRow = thread.data?.length && r() < 0.4 ? thread.data[Math.floor(r() * thread.data.length)] : undefined;
      const parent = parentRow?.id ?? null;
      const previous = thread.data?.filter((c) => c.author_id === uid).at(-1)?.body;
      const context = { parent: parentRow?.body, previous };
      let body = commentText(p, target.title, prog, r, context);
      for (let t = 0; t < 4 && thread.data?.some((c) => c.body === body); t++) body = commentText(p, target.title, prog, r, context);
      if (thread.data?.some((c) => c.body === body)) continue;
      const res = await db.from("comments").insert({ author_id: uid, post_id: target.id, body, parent_id: parent, created_at: now().toISOString() }).select("id").single();
      if (res.error) throw new Error(res.error.message);
      made.push(res.data.id);
    }
    return { comments: made.length };
  });
  const like = (n: number) => safe("community_like", async () => {
    const list = await recentPosts(); let liked = 0, already = 0;
    for (const target of list.slice(0, n)) {
      const res = await db.from("post_likes").insert({ user_id: uid, post_id: target.id });
      if (res.error?.code === "23505") already++; else if (res.error) throw new Error(res.error.message); else liked++;
    }
    return { liked, alreadyLiked: already };
  });
  const votePoll = (option?: number) => safe("poll_vote", async () => {
    const poll = await db.from("polls").select("id, options").order("created_at").limit(1).maybeSingle();
    if (poll.error || !poll.data) throw new Error(poll.error?.message ?? "No poll");
    const pick = option ?? Math.floor(r() * poll.data.options.length);
    const res = await db.from("poll_votes").upsert({ poll_id: poll.data.id, user_id: uid, option_index: pick });
    if (res.error) throw new Error(res.error.message);
    return { option: pick, label: poll.data.options[pick] ?? "(no such option)" };
  });
  const addCard = () => safe("anime_card_added", async () => {
    const title = r() < 0.6 ? p.favAnime : ["Laid-Back Camp", "Haikyu!!", "Bocchi the Rock!", "Non Non Biyori", "Space Brothers", "Barakamon"][Math.floor(r() * 6)]!;
    const res = await db.from("anime_deck_cards").upsert({ user_id: uid, anime_key: animeKey(title), title, rating: 3 + Math.floor(r() * 3), description: `Finished it. ${p.voice === "terse" ? "Good." : "Really stayed with me."}`, rewatch: r() < 0.7, character_name: p.favChar, shared: p.archetype !== "casual" }, { onConflict: "user_id,anime_key" });
    if (res.error) throw new Error(res.error.message);
    return { title };
  });
  const discover = () => safe("viewed_shared_interests", async () => {
    const mine = await db.from("anime_deck_cards").select("anime_key").eq("user_id", uid);
    const keys = (mine.data ?? []).map((m) => m.anime_key);
    if (!keys.length) return { matches: 0, reason: "no cards yet" };
    const res = await db.from("anime_deck_cards").select("user_id, title").eq("shared", true).neq("user_id", uid).in("anime_key", keys).limit(100);
    if (res.error) throw new Error(res.error.message);
    return { matches: new Set((res.data ?? []).map((x) => x.user_id)).size };
  });
  const readInbox = () => safe("read_notifications", async () => {
    const res = await db.from("community_notifications").select("id, read_at").is("read_at", null).limit(20);
    if (res.error) throw new Error(res.error.message);
    if (res.data.length && r() < 0.7) await db.from("community_notifications").update({ read_at: now().toISOString() }).in("id", res.data.map((x) => x.id));
    return { unread: res.data.length };
  });
  const chat = async () => {
    const who = p.chatWith, re = touch(who);
    // Keep the last budgeted message for a follow-up, so memory is actually tested.
    if (budget.left <= 0 || (re.chats === 0 && budget.left === 1)) { log("chat_skipped", { character: who, reason: "AI budget reached" }); return; }
    budget.left--; budget.used++;
    let memory = re.dialogue;
    if (!memory) {
      const history = await db.from("chat_messages").select("role, content, created_at").eq("user_id", uid).eq("character", who).order("created_at");
      if (history.error) { log("chat", { character: who }, false, history.error.message); budget.left++; budget.used--; return; }
      const replies = (history.data ?? []).filter((row) => row.role === "assistant");
      const last = replies.at(-1);
      const lastDay = last ? Math.max(1, Math.floor((Date.parse(last.created_at) - Date.parse(`${epoch}T00:00:00Z`)) / 86400000) + 1) : 0;
      memory = { ...emptyMemory(), turns: replies.length, lastReply: last?.content ?? "", lastDay, lastCards: prog.chars.length };
    }
    const plan = planDialogue(p, prog, day, memory);
    const text = plan.text;
    try {
      const res = await chatTurn(db, uid, who, text, now().toISOString(), plan.context);
      if (!res.ok) { log("chat", { character: who, sent: text }, false, res.error); return; }
      re.chats++; re.lastSeenDay = day;
      re.dialogue = rememberDialogue(memory, plan.branch, res.message.content, day, prog.chars.length);
      log("chat", { character: who, branch: plan.branch, sent: text, reply: res.message.content });
    } catch (e) { log("chat", { character: who, sent: text }, false, e instanceof Error ? e.message : String(e)); }
  };

  // Behaviour per personality.
  if (first) { log("customised_avatar", { ...p.avatar }); log("entered_world", {}); }
  switch (p.archetype) {
    case "daily": explore(2 + Math.floor(r() * 3)); if (r() < 0.5) await like(2); if (r() < 0.2) await post("discovery"); if (r() < 0.3) await readInbox(); break;
    case "achiever": explore(3 + Math.floor(r() * 3)); if (r() < 0.4) await addCard(); if (r() < 0.15) await post("discovery"); if (r() < 0.2) await discover(); break;
    case "casual": explore(1, 0.45); if (r() < 0.25) await like(1); break;
    case "character": explore(1); await chat(); if (r() < 0.2) await post("opinion"); if (r() < 0.3) await addCard(); break;
    case "social": if (r() < 0.4) explore(1); if (r() < 0.45) await post(r() < 0.4 ? "question" : r() < 0.5 ? "opinion" : "discovery"); await commentOn(1 + Math.floor(r() * 2)); await like(2 + Math.floor(r() * 3)); if (r() < 0.5) await votePoll(); if (r() < 0.4) await readInbox(); if (r() < 0.3) { await addCard(); await discover(); } break;
    case "newbie": explore(1, 0.7); if (first) {
      // Genuine mistakes through real app paths: reporting something that does not exist, and a bad poll choice.
      await safe("report_attempt", async () => { const res = await db.from("community_reports").insert({ reporter_id: uid, target_kind: "post", target_id: crypto.randomUUID(), reason: "not sure what this button does" }); if (res.error) throw new Error(res.error.message); });
      if (r() < 0.5) await votePoll(7);
    } else if (r() < 0.5) await post("question"); break;
    case "returning": explore(1 + Math.floor(r() * 2)); if (gap >= 7) { await post("return"); await readInbox(); } else if (r() < 0.3) await like(1); break;
  }
  // Every identity can converse; habits affect frequency, not access to the real chat path.
  if (p.archetype !== "character" && r() < (p.archetype === "casual" ? 0.08 : p.archetype === "newbie" ? 0.3 : 0.18)) await chat();
  // Characters notice familiar players: milestone tracking per character.
  for (const [c, re] of Object.entries(rel)) {
    const level = Math.min(4, (re.quest === "met" ? 1 : re.quest === "activity done" ? 1 : re.quest === "quest complete" ? 2 : 0) + Math.floor(re.chats / 2) + (prog.chars.includes(c) ? 1 : 0));
    if (level > re.level) { re.level = level; re.milestones = [...re.milestones, `${relName(level)} on day ${day}`]; log("relationship_milestone", { character: c, level, name: relName(level) }); }
  }
  // Most people just close the app; some sign out, which ends the saved session.
  if (p.archetype === "casual" || p.archetype === "newbie" || r() < 0.15) { await endSession(env, uid); log("logout", {}); } else log("closed_app", {});
  const failures = evs.filter((e) => !e.ok).length;
  await flush(env, u, day, evs, prog, rel, Math.round((evs[evs.length - 1]!.at.getTime() - evs[0]!.at.getTime()) / 1000));
  return { actions: evs.length, failures };
}

async function flush(env: SimEnv, u: SimUser, day: number, evs: Ev[], prog: Progress, rel: Record<string, Rel>, duration: number) {
  if (!evs.length) return;
  const rows = evs.map((e, seq) => ({ user_id: u.user_id, sim_day: day, seq, sim_at: e.at.toISOString(), kind: e.kind, detail: e.detail ?? {}, ok: e.ok ?? true, error: e.error ?? null }));
  await env.admin.from("sim_events").upsert(rows, { onConflict: "user_id,sim_day,seq", ignoreDuplicates: true });
  await env.admin.from("sim_sessions").upsert({ user_id: u.user_id, sim_day: day, started_at: evs[0]!.at.toISOString(), duration_s: Math.max(30, duration), actions: evs.length }, { onConflict: "user_id,sim_day", ignoreDuplicates: true });
  // A failed sign-in is not a visit, so it must not count as the player's last active day.
  const visited = evs.some((e) => e.ok && e.kind !== "login") || evs.some((e) => e.kind === "login" && e.ok);
  await env.admin.from("sim_users").update({ persona: currentPersona(u.persona), progress: prog, relationships: rel, ...(visited ? { last_active_day: day } : {}) }).eq("user_id", u.user_id);
}

/** Removes only test accounts and everything they created. Real players' rows are never selected. */
export async function resetSim(env: SimEnv) {
  const { data } = await env.admin.from("sim_users").select("user_id");
  const ids = (data ?? []).map((d) => d.user_id);
  if (ids.length) {
    await env.admin.from("sim_tokens").delete().in("user_id", ids);
    for (const t of ["community_notifications", "chat_messages", "anime_deck_cards", "post_likes", "poll_votes"] as const) await env.admin.from(t).delete().in("user_id", ids);
    await env.admin.from("community_reports").delete().in("reporter_id", ids);
    await env.admin.from("comments").delete().in("author_id", ids);
    await env.admin.from("posts").delete().in("author_id", ids).eq("is_test", true);
    for (const id of ids) await env.admin.auth.admin.deleteUser(id);
  }
  for (const t of ["sim_events", "sim_sessions"] as const) await env.admin.from(t).delete().gte("sim_day", 0);
  await env.admin.from("sim_test_results").delete().gte("sim_day", 0);
  await env.admin.from("sim_users").delete().in("user_id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]);
  await env.admin.from("sim_state").update({ sim_day: 0, paused: false, ai_used: 0 }).eq("id", 1);
  return { removedAccounts: ids.length };
}
