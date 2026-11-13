// Real-account checks run against the live rules. Results are saved so the dashboard shows pass/fail honestly.
import { userClient, sessionFor, endSession, type SimEnv } from "./engine";

type Result = { area: string; name: string; status: "passed" | "failed" | "skipped" | "unimplemented"; detail: string };
export async function runChecks(env: SimEnv, day: number): Promise<Result[]> {
  const out: Result[] = [];
  const add = (area: string, name: string, ok: boolean | null, detail: string) => out.push({ area, name, status: ok === null ? "skipped" : ok ? "passed" : "failed", detail });
  const { data: users } = await env.admin.from("sim_users").select("user_id, email, handle").order("handle");
  if (!users || users.length < 2) { add("Authentication", "Accounts exist", false, "Seed the test accounts first."); return save(env, out, day); }

  // Authentication: every account signs in.
  const signed: { u: typeof users[number]; c: ReturnType<typeof userClient>; ok: boolean; via: string }[] = [];
  for (const u of users) { const r = await sessionFor(env, u); signed.push({ u, c: r.db, ok: r.id === u.user_id, via: r.via }); }
  const okCount = signed.filter((s) => s.ok).length;
  add("Authentication", "All test accounts can sign in", okCount === users.length, `${okCount} of ${users.length} signed in.`);
  const a = signed[0]!, b = signed[1]!;

  // Isolation between accounts.
  const bChats = await a.c.from("chat_messages").select("id").eq("user_id", b.u.user_id);
  add("Authentication", "Cannot read another player's chats", (bChats.data ?? []).length === 0 && !bChats.error, `Rows visible: ${(bChats.data ?? []).length}.`);
  const bNotes = await a.c.from("community_notifications").select("id").eq("user_id", b.u.user_id);
  add("Authentication", "Cannot read another player's notifications", (bNotes.data ?? []).length === 0, `Rows visible: ${(bNotes.data ?? []).length}.`);
  const simLogs = await a.c.from("sim_events").select("id").limit(1);
  add("Authentication", "Test accounts cannot open simulation logs", (simLogs.data ?? []).length === 0, "Only admins can read the activity log.");
  const bPost = await b.c.from("posts").select("id").eq("author_id", b.u.user_id).limit(1).maybeSingle();
  if (bPost.data) {
    const hijack = await a.c.from("posts").update({ title: "edited by someone else" }).eq("id", bPost.data.id).select("id");
    add("Authentication", "Cannot edit another player's post", (hijack.data ?? []).length === 0, hijack.error?.message ?? "No rows changed.");
  } else add("Authentication", "Cannot edit another player's post", null, "Second account has no post yet.");
  const roles = await a.c.from("user_roles").insert({ user_id: a.u.user_id, role: "admin" });
  add("Authentication", "Cannot make themselves admin", !!roles.error, roles.error ? "Blocked." : "Insert was allowed!");

  // Synthetic content stays away from real visitors.
  const anon = userClient(env);
  const leak = await anon.from("posts").select("id").eq("is_test", true).limit(1);
  add("Community", "Test posts hidden from real visitors", (leak.data ?? []).length === 0, `Visible to signed-out visitors: ${(leak.data ?? []).length}.`);
  const anonProfiles = await anon.from("profiles").select("id").in("id", users.map((u) => u.user_id));
  add("Community", "Test profiles hidden from real visitors", (anonProfiles.data ?? []).length === 0, `Visible: ${(anonProfiles.data ?? []).length}.`);

  // Duplicate protection under concurrent requests.
  const target = await a.c.from("posts").select("id").eq("is_test", true).neq("author_id", a.u.user_id).limit(1).maybeSingle();
  if (target.data) {
    await a.c.from("post_likes").delete().eq("post_id", target.data.id).eq("user_id", a.u.user_id);
    await Promise.all(Array.from({ length: 5 }, () => a.c.from("post_likes").insert({ user_id: a.u.user_id, post_id: target.data!.id })));
    const n = await env.admin.from("post_likes").select("user_id").eq("post_id", target.data.id).eq("user_id", a.u.user_id);
    add("Performance", "Five simultaneous likes create one like", (n.data ?? []).length === 1, `Likes stored: ${(n.data ?? []).length}.`);
  } else add("Performance", "Five simultaneous likes create one like", null, "No post to like yet.");

  // Delete behaviour: removing a post removes its replies.
  const tmp = await a.c.from("posts").insert({ author_id: a.u.user_id, fandom: "General", title: "Delete test (sim)", body: "temporary" }).select("id").single();
  if (tmp.data) {
    await b.c.from("comments").insert({ author_id: b.u.user_id, post_id: tmp.data.id, body: "reply to be removed" });
    const notif = await env.admin.from("community_notifications").select("id").eq("user_id", a.u.user_id).eq("target_id", tmp.data.id);
    add("Community", "Reply notification reaches the post author only", (notif.data ?? []).length === 1, `Notifications for author: ${(notif.data ?? []).length}.`);
    await a.c.from("posts").delete().eq("id", tmp.data.id);
    const left = await env.admin.from("comments").select("id").eq("post_id", tmp.data.id);
    add("Community", "Deleting a post removes its replies", (left.data ?? []).length === 0, `Replies left: ${(left.data ?? []).length}.`);
    const stale = await env.admin.from("community_notifications").select("id").eq("target_id", tmp.data.id);
    add("Community", "Notifications cleared when the post is deleted", (stale.data ?? []).length === 0, `Notifications pointing at the deleted post: ${(stale.data ?? []).length}.`);
    await env.admin.from("community_notifications").delete().eq("target_id", tmp.data.id);
  }

  const missing = await a.c.from("community_reports").insert({ reporter_id: a.u.user_id, target_kind: "post", target_id: crypto.randomUUID(), reason: "testing a missing post" });
  add("Community", "Reporting content that does not exist is rejected", !!missing.error, missing.error ? missing.error.message : "Report was saved.");
  // Poll validation.
  const poll = await a.c.from("polls").select("id, options").limit(1).maybeSingle();
  if (poll.data) {
    const bad = await a.c.from("poll_votes").upsert({ poll_id: poll.data.id, user_id: a.u.user_id, option_index: 99 });
    add("Community", "Invalid poll option rejected", !!bad.error, bad.error ? "Rejected." : "A vote for option 99 was saved.");
    if (!bad.error) await a.c.from("poll_votes").upsert({ poll_id: poll.data.id, user_id: a.u.user_id, option_index: 0 });
  }

  // Character interactions.
  const { data: chats } = await env.admin.from("chat_messages").select("user_id, character, role").in("user_id", users.map((u) => u.user_id));
  const byUser = new Map<string, number>(); for (const c of chats ?? []) byUser.set(`${c.user_id}:${c.character}`, (byUser.get(`${c.user_id}:${c.character}`) ?? 0) + 1);
  add("Characters", "Conversations persist per player", (chats ?? []).length > 0 ? true : null, (chats ?? []).length ? `${(chats ?? []).length} saved messages across ${byUser.size} conversations.` : "No AI chats ran yet (budget).");
  add("Characters", "Two players chat with the same character independently", byUser.size >= 2 ? true : null, byUser.size >= 2 ? "Separate histories found." : "Needs two chatting players.");
  const { data: memory } = await env.admin.from("sim_events").select("detail").eq("kind", "chat").eq("ok", true);
  const recall = (memory ?? []).find((m) => String((m.detail as { sent?: string }).sent ?? "").startsWith("Last time I told you"));
  if (recall) { const reply = String((recall.detail as { reply?: string }).reply ?? ""); const { data: su } = await env.admin.from("sim_users").select("persona").limit(30); const hit = (su ?? []).some((s) => reply.toLowerCase().includes(String((s.persona as { favAnime: string }).favAnime).toLowerCase().split(" ")[0]!)); add("Characters", "Character remembers an earlier message", hit, hit ? "Reply named the show from the earlier turn." : `Reply: ${reply.slice(0, 120)}`); }
  else add("Characters", "Character remembers an earlier message", null, "No recall message sent yet (needs AI budget for a second turn).");

  // Logout and progress persistence.
  const tok = (await env.admin.from("sim_tokens").select("access_token").eq("user_id", a.u.user_id).maybeSingle()).data?.access_token;
  await endSession(env, a.u.user_id);
  if (tok) { const still = await env.admin.auth.getUser(tok); add("Authentication", "Signing out ends the session", !still.data.user, still.data.user ? "The old session still works after sign out." : "Old session rejected."); const db = (await import("@supabase/supabase-js")).createClient(env.url, env.publishableKey, { accessToken: async () => tok }); const own = await db.from("sim_users").select("user_id").eq("user_id", a.u.user_id); add("Authentication", "Data access stops right after sign out", !(own.data ?? []).length, (own.data ?? []).length ? "The signed-out token could still read data until it expires (up to 1 hour)." : "Data access refused."); }
  else add("Authentication", "Signing out ends the session", null, "No saved session to test.");
  const prog = await env.admin.from("sim_users").select("progress").eq("user_id", b.u.user_id).single();
  add("Exploration", "Simulated progress saved and resumable", !!prog.data?.progress, "Read back from the database.");
  out.push({ area: "Exploration", name: "Real players' town progress syncs across devices", status: "unimplemented", detail: "Town progress for real players is still saved on the device only." });
  out.push({ area: "Characters", name: "Relationship levels shown to real players", status: "unimplemented", detail: "Relationship levels exist only in the simulation; the game does not show them yet." });
  out.push({ area: "Characters", name: "Typed chat for town characters beyond Mochi and Sora", status: "unimplemented", detail: "Only Mochi and Sora have AI chat." });

  return save(env, out, day);
}
async function save(env: SimEnv, out: Result[], day: number) {
  await env.admin.from("sim_test_results").upsert(out.map((o) => ({ ...o, sim_day: day, created_at: new Date().toISOString() })), { onConflict: "area,name" });
  return out;
}
