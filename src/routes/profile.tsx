import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { simIsAdmin } from "@/lib/sim.functions";
import { useAuthReady, useUser } from "@/lib/session";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { BADGES, COLLECTIBLES } from "@/data/game";
import { level, reset, update, useProgress } from "@/lib/progress";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [
    { title: "Your Profile — AnimeAtlas" }, { name: "description", content: "Track your level, XP, badges and share your collection summary." },
    { property: "og:title", content: "Your Profile — AnimeAtlas" }, { property: "og:description", content: "Your AnimeAtlas progress." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: Profile,
});

function Profile() {
  const p = useProgress();
  const nav = useNavigate();
  const user = useUser();
  const ready = useAuthReady();
  const qc = useQueryClient();
  const [accountError, setAccountError] = useState("");
  const [signingOut, setSigningOut] = useState(false);
  const signOut = async () => {
    setSigningOut(true); setAccountError("");
    try {
      await qc.cancelQueries(); qc.clear();
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      await nav({ to: "/auth", replace: true });
    } catch { setAccountError("Couldn't sign out. Please try again."); }
    finally { setSigningOut(false); }
  };
  const [copied, setCopied] = useState("");
  const [fallback, setFallback] = useState("");
  const summary = `🗺️ My AnimeAtlas journey — ${p.name}\nLevel ${level(p.xp)} · ${p.xp} XP\nFriends (${p.chars.length}/${COLLECTIBLES.length}): ${COLLECTIBLES.filter((c) => p.chars.includes(c.id)).map((c) => c.name).join(", ") || "none yet"}\nBadges (${p.badges.length}/${BADGES.length}): ${BADGES.filter((b) => p.badges.includes(b.id)).map((b) => b.name).join(", ") || "none yet"}`;
  const copy = async () => {
    try { await navigator.clipboard.writeText(summary); setCopied("Copied to clipboard! ✨"); setFallback(""); }
    catch { setFallback(summary); setCopied("Couldn't copy automatically — select the text below."); }
  };
  return (
    <div className="space-y-5">
      <section className="border-b border-border pb-5" aria-labelledby="account-heading">
        <h1 id="account-heading" className="font-display text-2xl font-bold">Your account</h1>
        {!ready ? <p role="status">Checking your account…</p> : user ? <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div><p className="font-semibold">Signed in as {user.user_metadata?.["display_name"] || "Explorer"}</p><p className="break-all text-sm text-muted-foreground">{user.email}</p><p className="mt-1 text-sm text-muted-foreground">Chat history and Community posts are saved to this account.</p></div>
          <Button variant="outline" disabled={signingOut} onClick={signOut}>{signingOut ? "Signing out…" : "Sign out"}</Button>
          <AdminLink userId={user.id} />
        </div> : <div className="mt-3 space-y-3"><p className="text-sm text-muted-foreground">Sign in with the same account on each device to access your chats and Community posts.</p><Button asChild><Link to="/auth" search={{ redirect: "/profile" }}>Sign in</Link></Button></div>}
        {accountError && <p role="alert" className="mt-2 text-sm text-destructive">{accountError}</p>}
        <p className="mt-3 text-xs text-muted-foreground">Town progress and collectibles are saved on this device.</p>
      </section>
      <section className="card-game p-5">
        <label htmlFor="nm" className="text-sm font-bold text-muted-foreground">Explorer name</label>
        <input id="nm" value={p.name} maxLength={20} onChange={(e) => update(() => ({ name: e.target.value }))} className="mt-1 block w-full rounded-2xl border-[3px] border-border bg-muted px-4 py-3 font-display text-2xl font-bold" />
        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
          {[["Level", level(p.xp)], ["XP", p.xp], ["Friends", `${p.chars.length}/${COLLECTIBLES.length}`]].map(([k, v]) => (
            <div key={k} className="rounded-2xl bg-pink-soft p-3"><p className="font-display text-2xl font-bold">{v}</p><p className="text-xs font-bold uppercase">{k}</p></div>
          ))}
        </div>
      </section>
      <section className="card-game p-5" aria-labelledby="bd">
        <h2 id="bd" className="text-2xl font-bold">Badges</h2>
        <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {BADGES.map((b) => { const has = p.badges.includes(b.id); return (
            <li key={b.id} className={`rounded-2xl border-[3px] border-border p-3 ${has ? "animate-pop bg-sage" : "bg-muted opacity-70"}`}>
              <span className={`text-3xl ${has ? "" : "grayscale"}`} aria-hidden>{b.emoji}</span>
              <p className="font-bold">{b.name}{has ? "" : " 🔒"}</p><p className="text-xs text-muted-foreground">{b.how}</p>
            </li>); })}
        </ul>
      </section>
      <section className="card-game space-y-3 p-5">
        <div className="flex flex-wrap gap-2">
          <button className="btn-game" onClick={copy}>📋 Copy Collection Summary</button>
          <button className="btn-soft" onClick={() => { if (confirm("Reset all demo progress?")) { reset(); nav({ to: "/" }); } }}>🔄 Play Again / Reset Demo</button>
        </div>
        <p role="status" className="font-bold text-primary">{copied}</p>
        {fallback && <textarea readOnly value={fallback} rows={6} onFocus={(e) => e.currentTarget.select()} autoFocus aria-label="Collection summary" className="w-full rounded-2xl border-[3px] border-border bg-muted p-3" />}
      </section>
    </div>
  );
}

function AdminLink({ userId }: { userId: string }) {
  const check = useServerFn(simIsAdmin);
  const q = useQuery({ queryKey: ["sim-admin", userId], queryFn: () => check() });
  return q.data?.admin ? <Button asChild variant="secondary"><Link to="/sim">Simulation dashboard</Link></Button> : null;
}
