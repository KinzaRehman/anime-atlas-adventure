import { useMemo, useState } from "react";
import { Check } from "lucide-react";
import { GENRE_MATCH } from "@/data/game";

export function GenreMatch({ onComplete }: { onComplete: () => void }) {
  const hooks = useMemo(() => [GENRE_MATCH[2]!, GENRE_MATCH[0]!, GENRE_MATCH[3]!, GENRE_MATCH[1]!], []);
  const [pick, setPick] = useState<string | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const [msg, setMsg] = useState("Choose a genre, then the story that belongs to it.");
  const choose = (g: string) => {
    if (!pick) return setMsg("Pick a genre shelf first.");
    if (pick !== g) return setMsg("Hmm, that story belongs on another shelf. Try again!");
    const m = [...matched, g]; setMatched(m); setPick(null);
    setMsg(m.length === hooks.length ? "Every shelf sorted!" : "Shelved perfectly.");
    if (m.length === hooks.length) setTimeout(onComplete, 700);
  };
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Genre shelves</p>
      <div className="grid grid-cols-2 gap-2">
        {GENRE_MATCH.map((g) => { const done = matched.includes(g.genre); return (
          <button key={g.genre} disabled={done} aria-pressed={pick === g.genre} onClick={() => setPick(g.genre)}
            className={`flex min-h-12 items-center justify-between rounded-xl border px-3 font-semibold transition ${done ? "border-matcha bg-matcha/25 text-secondary-foreground" : pick === g.genre ? "border-charcoal bg-charcoal text-ivory" : "border-border bg-card hover:border-charcoal"}`}>
            {g.genre}{done && <Check className="h-4 w-4" />}
          </button>); })}
      </div>
      <p className="mb-2 mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">New arrivals</p>
      <div className="space-y-2">
        {hooks.map((h) => { const done = matched.includes(h.genre); return (
          <button key={h.hook} disabled={done} onClick={() => choose(h.genre)}
            className={`block min-h-12 w-full rounded-xl border p-3 text-left transition ${done ? "border-transparent bg-muted text-muted-foreground line-through" : "border-border bg-card hover:-translate-y-0.5 hover:shadow-soft"}`}>{h.hook}</button>); })}
      </div>
      <p role="status" className="mt-4 text-sm font-semibold text-primary">{msg}</p>
    </div>
  );
}
