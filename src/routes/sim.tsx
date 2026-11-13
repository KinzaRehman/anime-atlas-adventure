import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Activity, Download, Pause, Play, RotateCcw, ShieldCheck, Users, FlaskConical } from "lucide-react";
import { useAuthReady, useUser } from "@/lib/session";
import { simControl, simExport, simIsAdmin, simOverview, simUserDetail } from "@/lib/sim.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ARCHETYPE_LABEL, type Archetype } from "@/lib/sim/personas";

export const Route = createFileRoute("/sim")({
  head: () => ({ meta: [
    { title: "Simulation dashboard (admin) | AnimeAtlas" }, { name: "description", content: "Private admin view of AnimeAtlas test-account simulations." },
    { property: "og:title", content: "Simulation dashboard | AnimeAtlas" }, { property: "og:description", content: "Private admin tools." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" },
  ] }),
  component: SimPage,
});

const simClock = (epoch: string, day: number) => day < 1 ? "Not started" : new Date(Date.parse(`${epoch}T00:00:00Z`) + (day - 1) * 86400000).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

function SimPage() {
  const user = useUser(), ready = useAuthReady();
  const isAdmin = useServerFn(simIsAdmin);
  const adm = useQuery({ queryKey: ["sim-admin", user?.id], queryFn: () => isAdmin(), enabled: !!user });
  if (!ready || (user && adm.isLoading)) return <Shell><p className="text-muted-foreground">Checking access…</p></Shell>;
  if (!user) return <Shell><p>This page is for admins. <Link to="/auth" className="underline">Sign in</Link> first.</p></Shell>;
  if (!adm.data?.admin) return <Shell><p className="text-muted-foreground">Admins only. Your account does not have access.</p></Shell>;
  return <Dashboard />;
}
function Shell({ children }: { children: React.ReactNode }) {
  return <main className="mx-auto max-w-6xl space-y-6 px-4 py-8"><h1 className="font-display text-3xl">Simulation dashboard</h1>{children}</main>;
}

function Dashboard() {
  const qc = useQueryClient();
  const overview = useServerFn(simOverview), control = useServerFn(simControl), exp = useServerFn(simExport);
  const q = useQuery({ queryKey: ["sim-overview"], queryFn: () => overview() });
  const [busy, setBusy] = useState(""); const [msg, setMsg] = useState(""); const [sel, setSel] = useState<string | null>(null);
  const [budget, setBudget] = useState("");
  const refresh = () => qc.invalidateQueries({ queryKey: ["sim-overview"] });
  const act = async (label: string, fn: () => Promise<unknown>) => {
    setBusy(label); setMsg("");
    try { const r = await fn(); setMsg(`${label}: ${JSON.stringify(r)}`); } catch (e) { setMsg(`${label} failed: ${e instanceof Error ? e.message : e}`); }
    setBusy(""); void refresh();
  };
  const runDays = (n: number) => act(`Run ${n} day${n > 1 ? "s" : ""}`, async () => {
    let done = 0;
    for (let i = 0; i < n; i++) {
      const r = await control({ data: { action: "day" } });
      if (!("ran" in r) || !r.ran) return { done, stopped: "reason" in r ? r.reason : "stopped" };
      done++; setMsg(`Simulated day ${r.day}: ${r.active} active players`); void refresh();
    }
    return { done };
  });
  const download = async (kind: "json" | "csv") => {
    const rows = await exp();
    const text = kind === "json" ? JSON.stringify(rows, null, 2) : ["handle,sim_day,sim_at,kind,ok,error,detail", ...rows.map((r) => [r.handle, r.sim_day, r.sim_at, r.kind, r.ok, r.error ?? "", JSON.stringify(r.detail)].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))].join("\n");
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text], { type: kind === "json" ? "application/json" : "text/csv" })); a.download = `animeatlas-sim-log.${kind}`; a.click();
  };
  if (q.isLoading) return <Shell><p>Loading…</p></Shell>;
  if (q.error || !q.data) return <Shell><p className="text-destructive">{String(q.error)}</p></Shell>;
  const { state, stats, users, tests } = q.data;
  const S: [string, string | number][] = [["Test accounts", stats.accounts], ["Daily active", stats.dau], ["Weekly active", stats.wau], ["Monthly active", stats.mau], ["Sessions", stats.sessions], ["Avg session", `${Math.round(stats.avgSession / 60)} min`], ["Conversations", stats.conversations], ["Posts", stats.posts], ["Comments", stats.comments], ["Likes", stats.likes], ["Missions done", stats.missions], ["Cards unlocked", stats.collectibles], ["Returns", stats.returning], ["Inactive 7+ days", stats.inactive], ["Failed actions", stats.failed]];
  return (
    <Shell>
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-4">
        <Badge variant="secondary">Test data only</Badge>
        <div><div className="text-xs uppercase tracking-wide text-muted-foreground">Simulated clock</div><div className="font-display text-xl">Day {state.sim_day} · {simClock(state.epoch, state.sim_day)}</div></div>
        <div className="text-sm text-muted-foreground">{state.paused ? "Paused" : "Ready"} · AI messages {state.ai_used} / {state.ai_budget}</div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button disabled={!!busy} onClick={() => act("Seed 30 users", () => control({ data: { action: "seed" } }))}><Users className="h-4 w-4" />Seed 30 users</Button>
        <Button disabled={!!busy} variant="secondary" onClick={() => runDays(1)}><Play className="h-4 w-4" />Run 1 day</Button>
        <Button disabled={!!busy} variant="secondary" onClick={() => runDays(7)}>Run 7 days</Button>
        <Button disabled={!!busy} variant="secondary" onClick={() => runDays(30)}>Run 30 days</Button>
        <Button disabled={!!busy && busy !== "x"} variant="outline" onClick={() => act(state.paused ? "Resume" : "Pause", () => control({ data: { action: state.paused ? "resume" : "pause" } }))}><Pause className="h-4 w-4" />{state.paused ? "Resume" : "Pause"}</Button>
        <Button disabled={!!busy} variant="outline" onClick={() => act("Run checks", () => control({ data: { action: "checks" } }))}><FlaskConical className="h-4 w-4" />Run checks</Button>
        <Button variant="outline" onClick={() => download("csv")}><Download className="h-4 w-4" />CSV</Button>
        <Button variant="outline" onClick={() => download("json")}><Download className="h-4 w-4" />JSON</Button>
        <Button disabled={!!busy} variant="destructive" onClick={() => { if (confirm("Delete all test accounts and everything they created? Real players are not affected.")) void act("Reset", () => control({ data: { action: "reset" } })); }}><RotateCcw className="h-4 w-4" />Reset test data</Button>
        <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); void act("Set AI budget", () => control({ data: { action: "budget", budget: Number(budget) } })); }}>
          <Input className="w-28" inputMode="numeric" placeholder="AI budget" value={budget} onChange={(e) => setBudget(e.target.value)} aria-label="AI message budget" /><Button variant="outline" type="submit">Set</Button>
        </form>
      </div>
      {(busy || msg) && <p className="text-sm text-muted-foreground" role="status">{busy ? `${busy}… ` : ""}{msg}</p>}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">{S.map(([k, v]) => <div key={k} className="rounded-lg border border-border bg-card p-3"><div className="text-xs text-muted-foreground">{k}</div><div className="font-display text-2xl">{v}</div></div>)}</section>
      <section className="space-y-2"><h2 className="flex items-center gap-2 font-display text-xl"><ShieldCheck className="h-5 w-5" />Test results</h2>
        {tests.length ? <div className="divide-y divide-border rounded-lg border border-border bg-card">{tests.map((t) => <div key={t.area + t.name} className="flex flex-wrap items-baseline gap-2 p-3 text-sm"><Badge variant={t.status === "failed" ? "destructive" : t.status === "passed" ? "default" : "outline"}>{t.status}</Badge><span className="text-muted-foreground">{t.area}</span><span className="font-medium">{t.name}</span><span className="text-muted-foreground">{t.detail}</span></div>)}</div> : <p className="text-sm text-muted-foreground">No checks run yet.</p>}
      </section>
      <section className="space-y-2"><h2 className="flex items-center gap-2 font-display text-xl"><Activity className="h-5 w-5" />Test accounts</h2>
        <div className="overflow-x-auto rounded-lg border border-border bg-card"><table className="w-full text-sm"><thead className="text-left text-muted-foreground"><tr><th className="p-2">Player</th><th className="p-2">Type</th><th className="p-2">Joined</th><th className="p-2">Last seen</th><th className="p-2">XP</th><th className="p-2">Cards</th></tr></thead>
          <tbody>{users.map((u) => <tr key={u.user_id} className="cursor-pointer border-t border-border hover:bg-muted" onClick={() => setSel(u.user_id)}><td className="p-2 font-medium">{u.display_name}</td><td className="p-2">{ARCHETYPE_LABEL[u.archetype as Archetype]}</td><td className="p-2">Day {u.joined_day}</td><td className="p-2">{u.last_active_day ? `Day ${u.last_active_day}` : "Never"}</td><td className="p-2">{u.xp}</td><td className="p-2">{u.cards}</td></tr>)}</tbody></table></div>
      </section>
      {sel && <UserPanel id={sel} epoch={state.epoch} onClose={() => setSel(null)} />}
    </Shell>
  );
}

function UserPanel({ id, onClose }: { id: string; epoch: string; onClose: () => void }) {
  const detail = useServerFn(simUserDetail);
  const q = useQuery({ queryKey: ["sim-user", id], queryFn: () => detail({ data: { userId: id } }) });
  if (!q.data) return <section className="rounded-lg border border-border bg-card p-4">Loading player…</section>;
  const { user, events, sessions, chats, posts, comments } = q.data;
  const prog = user.progress as { xp: number; chars: string[]; visited: string[]; done: string[]; badges: string[]; missions: Record<string, { steps: string[]; claimed: boolean; period: string }> };
  const persona = user.persona as { genres: string[]; favAnime: string; favChar: string; traits: string[]; voice: string };
  const rel = user.relationships as Record<string, { level: number; chats: number; quest: string; milestones: string[] }>;
  const errors = events.filter((e) => !e.ok);
  return (
    <section className="space-y-4 rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3"><div><h2 className="font-display text-2xl">{user.display_name}</h2><p className="text-sm text-muted-foreground">{ARCHETYPE_LABEL[user.archetype as Archetype]} · {user.email} · likes {persona.genres.join(", ")} · favourite anime {persona.favAnime} · traits {persona.traits.join(", ")}</p></div><Button variant="outline" onClick={onClose}>Close</Button></div>
      <div className="grid gap-4 md:grid-cols-2">
        <div><h3 className="font-medium">Progress</h3><p className="text-sm">{prog.xp} XP · cards: {prog.chars.join(", ") || "none"} · badges: {prog.badges.join(", ") || "none"}</p><p className="text-sm">Places visited: {prog.visited.join(", ") || "none"}</p>
          <p className="text-sm">Missions: {Object.entries(prog.missions ?? {}).map(([k, m]) => `${k} ${m.claimed ? "claimed" : `${m.steps.length} steps`} (${m.period})`).join("; ") || "none started"}</p></div>
        <div><h3 className="font-medium">Relationships</h3>{Object.entries(rel).map(([c, r]) => <p key={c} className="text-sm"><span className="capitalize">{c}</span>: level {r.level}, {r.quest}, {r.chats} chats{r.milestones.length ? ` · ${r.milestones.join(", ")}` : ""}</p>)}</div>
      </div>
      <div><h3 className="font-medium">Conversations ({chats.length} messages)</h3><div className="max-h-64 space-y-2 overflow-y-auto">{chats.map((c, i) => <p key={i} className="text-sm"><b className="capitalize">{c.role === "user" ? "Player" : c.character}:</b> {c.content}</p>)}{!chats.length && <p className="text-sm text-muted-foreground">No AI chats (limited by the AI budget).</p>}</div></div>
      <div><h3 className="font-medium">Community</h3>{posts.map((p) => <p key={p.id} className="text-sm">Post: <b>{p.title}</b> — {p.body}</p>)}{comments.map((c) => <p key={c.id} className="text-sm">Reply on “{(c.posts as { title: string } | null)?.title}”: {c.body}</p>)}{!posts.length && !comments.length && <p className="text-sm text-muted-foreground">No posts or replies.</p>}</div>
      <div><h3 className="font-medium">Sessions ({sessions.length})</h3><p className="text-sm text-muted-foreground">{sessions.map((s) => `Day ${s.sim_day} (${Math.round(s.duration_s / 60)} min)`).join(" · ") || "None"}</p></div>
      <div><h3 className="font-medium">Errors ({errors.length})</h3>{errors.slice(0, 20).map((e, i) => <p key={i} className="text-sm text-destructive">Day {e.sim_day} {e.kind}: {e.error}</p>)}</div>
      <div><h3 className="font-medium">Timeline</h3><div className="max-h-80 overflow-y-auto text-sm">{events.map((e, i) => <p key={i} className={e.ok ? "" : "text-destructive"}><span className="text-muted-foreground">Day {e.sim_day} {new Date(e.sim_at).toISOString().slice(11, 16)}</span> {e.kind.replace(/_/g, " ")} {summary(e.detail as Record<string, unknown>)}</p>)}</div></div>
    </section>
  );
}
const summary = (d: Record<string, unknown>) => Object.entries(d).filter(([k]) => !["reply", "sent", "body"].includes(k) && typeof d[k] !== "object").map(([k, v]) => `${k}: ${v}`).join(", ");
