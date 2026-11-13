// Admin-only simulation controls. Each handler verifies the caller's admin role through RLS before
// touching the service client, which is loaded inside the handler so it never reaches the browser.
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function requireAdmin(context: { supabase: any }) {
  const { data, error } = await context.supabase.rpc("is_sim_admin");
  if (error || !data) throw new Error("Admins only");
}
async function env() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return { url: process.env["SUPABASE_URL"]!, publishableKey: process.env["SUPABASE_PUBLISHABLE_KEY"]!, admin: supabaseAdmin, secret: process.env["SUPABASE_SERVICE_ROLE_KEY"]! };
}

export const simIsAdmin = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data } = await context.supabase.rpc("is_sim_admin");
  return { admin: !!data };
});

export const simOverview = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  await requireAdmin(context);
  const sb = context.supabase;
  const [state, users, sessions, events, tests, posts, comments, chats] = await Promise.all([
    sb.from("sim_state").select("*").eq("id", 1).single(),
    sb.from("sim_users").select("user_id, handle, display_name, archetype, joined_day, last_active_day, progress, relationships").order("handle"),
    sb.from("sim_sessions").select("user_id, sim_day, duration_s").limit(5000),
    Promise.all(["community_like", "mission_claimed", "collectible_unlocked", "returned"].map((k) => sb.from("sim_events").select("id", { count: "exact", head: true }).eq("kind", k).eq("ok", true).then((r) => [k, r.count ?? 0] as const))).then((pairs) => ({ data: { counts: Object.fromEntries(pairs) as Record<string, number> }, error: null })),
    sb.from("sim_test_results").select("area, name, status, detail, sim_day").order("area"),
    sb.from("posts").select("id", { count: "exact", head: true }).eq("is_test", true),
    sb.from("comments").select("id", { count: "exact", head: true }).eq("is_test", true),
    sb.from("chat_messages").select("user_id, character").limit(5000),
  ]);
  for (const r of [state, users, sessions]) if (r.error) throw new Error(r.error.message);
  const failed = await sb.from("sim_events").select("id", { count: "exact", head: true }).eq("ok", false);
  const day = state.data!.sim_day;
  const ses = sessions.data ?? [];
  const activeIn = (n: number) => new Set(ses.filter((s) => s.sim_day > day - n).map((s) => s.user_id)).size;
  const count = (k: string) => events.data.counts[k] ?? 0;
  const simIds = new Set((users.data ?? []).map((u) => u.user_id));
  const convs = new Set((chats.data ?? []).filter((c) => simIds.has(c.user_id)).map((c) => `${c.user_id}:${c.character}`)).size;
  return {
    state: state.data!,
    users: (users.data ?? []).map((u) => ({ ...u, cards: ((u.progress as { chars?: string[] }).chars ?? []).length, xp: (u.progress as { xp?: number }).xp ?? 0 })),
    stats: {
      accounts: users.data?.length ?? 0, dau: activeIn(1), wau: activeIn(7), mau: activeIn(30), sessions: ses.length,
      avgSession: ses.length ? Math.round(ses.reduce((a, s) => a + s.duration_s, 0) / ses.length) : 0,
      conversations: convs, posts: posts.count ?? 0, comments: comments.count ?? 0, likes: count("community_like"),
      missions: count("mission_claimed"), collectibles: count("collectible_unlocked"), returning: count("returned"),
      inactive: (users.data ?? []).filter((u) => u.last_active_day == null || day - u.last_active_day >= 7).length,
      failed: failed.count ?? 0,
    },
    tests: tests.data ?? [],
  };
});

export const simUserDetail = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string }) => { if (!/^[0-9a-f-]{36}$/.test(d?.userId ?? "")) throw new Error("Bad id"); return d; })
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const sb = context.supabase;
    const [user, events, sessions, chats, posts, comments] = await Promise.all([
      sb.from("sim_users").select("*").eq("user_id", data.userId).single(),
      sb.from("sim_events").select("sim_day, sim_at, kind, detail, ok, error").eq("user_id", data.userId).order("sim_at").limit(1000),
      sb.from("sim_sessions").select("sim_day, started_at, duration_s, actions").eq("user_id", data.userId).order("sim_day"),
      sb.from("chat_messages").select("character, role, content, created_at").eq("user_id", data.userId).order("created_at"),
      sb.from("posts").select("id, title, body, created_at").eq("author_id", data.userId).order("created_at"),
      sb.from("comments").select("id, body, created_at, posts(title)").eq("author_id", data.userId).order("created_at"),
    ]);
    if (user.error) throw new Error(user.error.message);
    return { user: user.data, events: events.data ?? [], sessions: sessions.data ?? [], chats: chats.data ?? [], posts: posts.data ?? [], comments: comments.data ?? [] };
  });

type Action = { action: "seed" | "day" | "pause" | "resume" | "reset" | "checks" | "budget"; budget?: number };
export const simControl = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((d: Action) => {
    if (!["seed", "day", "pause", "resume", "reset", "checks", "budget"].includes(d?.action)) throw new Error("Unknown action");
    return { action: d.action, budget: Math.max(0, Math.min(500, Math.floor(Number(d.budget ?? 0)))) };
  })
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const e = await env();
    const sim = await import("@/lib/sim/engine");
    if (data.action === "seed") return sim.seed(e);
    if (data.action === "day") return sim.runDay(e);
    if (data.action === "reset") return sim.resetSim(e);
    if (data.action === "checks") { const { runChecks } = await import("@/lib/sim/checks"); const st = await e.admin.from("sim_state").select("sim_day").single(); return { results: (await runChecks(e, st.data?.sim_day ?? 0)).length }; }
    if (data.action === "budget") { await e.admin.from("sim_state").update({ ai_budget: data.budget }).eq("id", 1); return { budget: data.budget }; }
    await e.admin.from("sim_state").update({ paused: data.action === "pause" }).eq("id", 1);
    return { paused: data.action === "pause" };
  });

export const simExport = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  await requireAdmin(context);
  const [ev, users] = await Promise.all([
    context.supabase.from("sim_events").select("user_id, sim_day, sim_at, kind, ok, error, detail").order("sim_at").limit(20000),
    context.supabase.from("sim_users").select("user_id, handle"),
  ]);
  const h = new Map((users.data ?? []).map((u) => [u.user_id, u.handle]));
  return (ev.data ?? []).map((e) => ({ ...e, handle: h.get(e.user_id) ?? "" }));
});
