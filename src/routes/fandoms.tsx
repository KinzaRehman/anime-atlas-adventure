import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { DISCUSSIONS, POLL } from "@/data/game";
import { addXp, useProgress } from "@/lib/progress";

export const Route = createFileRoute("/fandoms")({
  head: () => ({ meta: [
    { title: "Fandom Plaza — AnimeAtlas" }, { name: "description", content: "Wholesome anime discussions with spoiler tags and a community poll." },
    { property: "og:title", content: "Fandom Plaza — AnimeAtlas" }, { property: "og:description", content: "Discuss, vote and share with fellow fans." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: Fandoms,
});

function Fandoms() {
  const p = useProgress();
  const [liked, setLiked] = useState<string[]>([]);
  const [shown, setShown] = useState<string[]>([]);
  const votes = POLL.base.map((v, i) => v + (p.vote === i ? 1 : 0));
  const total = votes.reduce((a, b) => a + b, 0);
  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-bold">Community Plaza</h1>
      <section className="card-game p-5" aria-labelledby="poll">
        <h2 id="poll" className="text-xl font-bold">🗳️ {POLL.q}</h2>
        <div className="mt-3 space-y-2">
          {POLL.options.map((o, i) => (
            <button key={o} onClick={() => p.vote === null && addXp(20, () => ({ vote: i }))} aria-pressed={p.vote === i} disabled={p.vote !== null && p.vote !== i}
              className="relative block min-h-12 w-full overflow-hidden rounded-2xl border-[3px] border-border bg-muted text-left font-bold">
              {p.vote !== null && <span className="absolute inset-y-0 left-0 bg-lavender transition-all" style={{ width: `${(votes[i] / total) * 100}%` }} aria-hidden />}
              <span className="relative flex justify-between px-4 py-3"><span>{o} {p.vote === i && "✓"}</span>{p.vote !== null && <span>{Math.round((votes[i] / total) * 100)}%</span>}</span>
            </button>
          ))}
        </div>
      </section>
      {DISCUSSIONS.map((d) => (
        <article key={d.id} className="card-game p-5">
          <p className="text-sm font-bold text-muted-foreground"><span aria-hidden>{d.avatar}</span> @{d.author}</p>
          <h2 className="text-xl font-bold">{d.title}</h2>
          <p className="mt-1">{d.body}</p>
          {d.spoiler && (shown.includes(d.id)
            ? <p className="mt-2 rounded-2xl bg-lavender p-3 font-semibold">{d.spoiler}</p>
            : <button className="mt-2 min-h-12 w-full rounded-2xl bg-foreground/85 px-4 font-bold text-background" onClick={() => setShown([...shown, d.id])}>⚠️ Spoiler — tap to reveal</button>)}
          <button className="btn-soft mt-3" aria-pressed={liked.includes(d.id)} onClick={() => setLiked(liked.includes(d.id) ? liked.filter((x) => x !== d.id) : [...liked, d.id])}>
            {liked.includes(d.id) ? "💖" : "🤍"} {d.likes + (liked.includes(d.id) ? 1 : 0)}
          </button>
        </article>
      ))}
      <p className="text-center text-sm text-muted-foreground">Plaza rules: be kind, tag spoilers, share original art only.</p>
    </div>
  );
}
