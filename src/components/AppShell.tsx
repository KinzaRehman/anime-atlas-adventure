import { Link, useLocation } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { level, popUnlock, useProgress, useUnlock } from "@/lib/progress";
import { XP_PER_LEVEL } from "@/data/game";

const NAV = [
  { to: "/explore", label: "Explore", icon: "🗺️" },
  { to: "/collection", label: "Collection", icon: "🎴" },
  { to: "/chat", label: "Chat", icon: "💬" },
  { to: "/fandoms", label: "Fandoms", icon: "🌸" },
  { to: "/profile", label: "Profile", icon: "⭐" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const p = useProgress();
  const unlock = useUnlock();
  useEffect(() => { if (!unlock) return; const t = setTimeout(() => popUnlock(), 2600); return () => clearTimeout(t); }, [unlock]);
  if (pathname === "/") return <>{children}{unlock && <UnlockToast u={unlock} />}</>;
  const pct = ((p.xp % XP_PER_LEVEL) / XP_PER_LEVEL) * 100;
  return (
    <div className="min-h-screen bg-sky pb-24 md:pb-8">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 btn-soft z-50">Skip to content</a>
      <header className="sticky top-0 z-30 border-b-[3px] border-border bg-card/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-2">
          <Link to="/" className="font-display text-xl font-bold text-primary">AnimeAtlas</Link>
          <nav aria-label="Main" className="ml-4 hidden gap-1 md:flex">
            {NAV.map((n) => <Link key={n.to} to={n.to} className="rounded-full px-3 py-2 font-bold text-muted-foreground hover:bg-muted" activeProps={{ className: "bg-pink-soft text-primary" }}>{n.icon} {n.label}</Link>)}
          </nav>
          <div className="ml-auto flex items-center gap-2" aria-label={`Level ${level(p.xp)}, ${p.xp} XP`}>
            <span className="rounded-full bg-gold px-2.5 py-1 font-display text-sm font-bold">Lv {level(p.xp)}</span>
            <div className="h-3 w-20 overflow-hidden rounded-full bg-muted sm:w-32" aria-hidden><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} /></div>
            <span className="text-xs font-bold text-muted-foreground">{p.xp} XP</span>
          </div>
        </div>
      </header>
      <main id="main" className="mx-auto max-w-5xl px-4 py-5">{children}</main>
      <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-30 flex justify-around border-t-[3px] border-border bg-card px-1 py-1 md:hidden">
        {NAV.map((n) => <Link key={n.to} to={n.to} className="flex min-h-14 min-w-14 flex-col items-center justify-center rounded-2xl px-2 text-xs font-bold text-muted-foreground" activeProps={{ className: "bg-pink-soft text-primary" }}><span className="text-xl" aria-hidden>{n.icon}</span>{n.label}</Link>)}
      </nav>
      {unlock && <UnlockToast u={unlock} />}
    </div>
  );
}

function UnlockToast({ u }: { u: { kind: string; label: string; emoji: string } }) {
  return (
    <div role="status" aria-live="polite" className="fixed inset-x-0 top-20 z-50 flex justify-center px-4">
      <button onClick={() => popUnlock()} key={u.label} className="card-game animate-pop flex items-center gap-3 px-5 py-3 text-left">
        <span className="animate-bob grid h-12 w-12 place-items-center rounded-full bg-gold text-2xl">{u.emoji}</span>
        <span><span className="block text-xs font-extrabold uppercase tracking-wider text-primary">{u.kind === "char" ? "New friend unlocked!" : u.kind === "badge" ? "Badge earned!" : "Level up!"}</span><span className="font-display text-lg font-bold">{u.label}</span></span>
      </button>
    </div>
  );
}
