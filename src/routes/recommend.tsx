import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { BookOpen, Loader2 } from "lucide-react";
import mochiImg from "@/assets/char-mochi.jpg";
import { recommendAnime, type Rec } from "@/lib/recommend.functions";

export const Route = createFileRoute("/recommend")({
  head: () => ({ meta: [
    { title: "Anime Picks from the Manga Library | AnimeAtlas" },
    { name: "description", content: "Describe anime you love and get spoiler-free series recommendations." },
    { property: "og:title", content: "Anime Picks | AnimeAtlas" }, { property: "og:description", content: "Spoiler-free anime recommendations tailored to your taste." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: Recommend,
});

const EXAMPLES = ["Cozy slice-of-life with food and friendship", "Sports stories about teamwork and hard work", "I loved Haikyu!! and Spy x Family"];

function Recommend() {
  const ask = useServerFn(recommendAnime);
  const [likes, setLikes] = useState("");
  const [recs, setRecs] = useState<Rec[]>([]);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const go = async (e?: React.FormEvent) => {
    e?.preventDefault(); if (busy || likes.trim().length < 3) return;
    setBusy(true); setErr("");
    try { const r = await ask({ data: { likes } }); setRecs(r.recs); setErr(r.error ?? ""); }
    catch { setErr("Couldn't reach the library. Please try again."); }
    finally { setBusy(false); }
  };
  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-28">
      <header className="flex items-center gap-4">
        <img src={mochiImg} alt="" width={816} height={816} className="h-16 w-16 rounded-full object-cover ring-2 ring-primary" />
        <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Manga Library</p><h1 className="font-display text-3xl font-bold">Mochi's Picks</h1>
          <p className="text-sm text-muted-foreground">Tell Mochi what you enjoy. Her AI-assisted shelf finds series to match, with no spoilers.</p></div>
      </header>
      <form onSubmit={go} className="paper space-y-3 rounded-3xl p-4">
        <label htmlFor="likes" className="font-semibold">What anime do you enjoy, and why?</label>
        <textarea id="likes" value={likes} onChange={(e) => setLikes(e.target.value)} maxLength={600} rows={3}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void go(); } }}
          placeholder="e.g. Heartfelt stories about found family, with great art…" className="w-full resize-none rounded-2xl border border-border bg-card p-3 focus:outline-none focus:ring-2 focus:ring-ring" />
        <div className="flex flex-wrap gap-2">{EXAMPLES.map((x) => <button type="button" key={x} onClick={() => setLikes(x)} className="min-h-10 rounded-full border border-border px-3 text-sm hover:bg-muted">{x}</button>)}</div>
        <button disabled={busy || likes.trim().length < 3} className="btn-primary inline-flex min-h-12 items-center gap-2 disabled:opacity-50">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <BookOpen className="h-4 w-4" />}{busy ? "Mochi is browsing the shelves…" : "Find my next series"}
        </button>
      </form>
      <div aria-live="polite">
        {err && <p role="alert" className="rounded-2xl bg-destructive/10 p-3 font-semibold text-destructive">{err}</p>}
        <ul className="grid gap-3 sm:grid-cols-2">
          {recs.map((r, i) => (
            <li key={r.title} className="paper animate-rise rounded-3xl p-4" style={{ animationDelay: `${i * 80}ms` }}>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">{r.vibe}</p>
              <h2 className="font-display text-xl font-bold">{r.title}</h2>
              <p className="mt-1 text-sm leading-relaxed">{r.why}</p>
            </li>
          ))}
        </ul>
        {recs.length > 0 && <p className="mt-3 text-xs text-muted-foreground">Picks are AI-generated and spoiler-free. Check age ratings with your family before watching.</p>}
      </div>
    </div>
  );
}
