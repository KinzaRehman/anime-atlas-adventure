import { Link, useLocation } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { BookOpen, Compass, Layers, MessageCircle, UsersRound, UserRound } from "lucide-react";
import { level, popUnlock, useProgress, useUnlock } from "@/lib/progress";

const NAV = [
  { to: "/explore", label: "Explore", Icon: Compass },
  { to: "/collection", label: "Collection", Icon: Layers },
  { to: "/chat", label: "Chat", Icon: MessageCircle },
  { to: "/recommend", label: "Picks", Icon: BookOpen },
  { to: "/fandoms", label: "Community", Icon: UsersRound },
  { to: "/profile", label: "Profile", Icon: UserRound },
] as const;

function Nav({ floating }: { floating: boolean }) {
  return (
    <nav aria-label="Main" className={`glass [[data-game-overlay]_&]:hidden fixed bottom-[max(.75rem,env(safe-area-inset-bottom))] left-1/2 z-30 flex -translate-x-1/2 gap-1 rounded-full p-1.5 ${floating ? "" : "md:hidden"}`}>
      {NAV.map(({ to, label, Icon }) => (
        <Link key={to} to={to} aria-label={label} className="flex min-h-12 min-w-12 items-center justify-center gap-2 rounded-full px-3 text-ivory/70 transition hover:text-ivory" activeProps={{ className: "bg-ivory !text-charcoal" }}>
          <Icon className="h-5 w-5" aria-hidden /><span className="hidden text-sm font-semibold lg:inline">{label}</span>
        </Link>
      ))}
    </nav>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const p = useProgress();
  const unlock = useUnlock();
  useEffect(() => { if (!unlock) return; const t = setTimeout(() => popUnlock(), 2600); return () => clearTimeout(t); }, [unlock]);
  const toast = unlock && !(pathname === "/explore" && unlock.kind === "char") && <UnlockToast u={unlock} />;
  if (pathname === "/") return <>{children}{toast}</>;
  if (pathname === "/explore") return <>{children}<Nav floating />{toast}</>;
  return (
    <div className="min-h-dvh bg-background pb-28 md:pb-10">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 z-50 rounded-full bg-card px-4 py-2">Skip to content</a>
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-6 px-5 py-3">
          <Link to="/" className="font-display text-xl font-black tracking-tight">Anime<span className="text-primary">Atlas</span></Link>
          <nav aria-label="Main" className="hidden gap-1 md:flex">
            {NAV.map(({ to, label }) => <Link key={to} to={to} className="rounded-full px-3 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground" activeProps={{ className: "bg-charcoal !text-ivory" }}>{label}</Link>)}
          </nav>
          <span className="ml-auto rounded-full bg-muted px-3 py-1 text-sm font-semibold tabular-nums">Lv {level(p.xp)} · {p.xp} XP</span>
        </div>
      </header>
      <main id="main" className="mx-auto max-w-6xl px-5 py-6">{children}</main>
      <Nav floating={false} />
      {toast}
    </div>
  );
}

function UnlockToast({ u }: { u: { kind: string; label: string } }) {
  return (
    <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 top-[max(1rem,env(safe-area-inset-top))] z-50 flex justify-center px-4">
      <button onClick={() => popUnlock()} key={u.label} className="glass animate-rise pointer-events-auto rounded-full px-5 py-2.5 text-left">
        <span className="mr-2 text-xs font-bold uppercase tracking-[0.16em] text-gold">{u.kind === "char" ? "New friend" : u.kind === "badge" ? "Badge" : "Level up"}</span>
        <span className="font-display font-bold">{u.label}</span>
      </button>
    </div>
  );
}
