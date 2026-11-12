import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import town from "@/assets/town-map.jpg";
import { LOCATIONS, TRIVIA, GENRE_MATCH } from "@/data/game";
import { addXp, update, useProgress } from "@/lib/progress";

export const Route = createFileRoute("/explore")({
  head: () => ({ meta: [
    { title: "Explore the Town — AnimeAtlas" }, { name: "description", content: "Wander the illustrated town map and open each location's activity." },
    { property: "og:title", content: "Explore the Town — AnimeAtlas" }, { property: "og:description", content: "An interactive 2D anime town map." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: Explore,
});

function Explore() {
  const p = useProgress();
  const [open, setOpen] = useState<string | null>(null);
  const visit = (id: string) => { setOpen(id); if (!p.visited.includes(id)) addXp(20, (s) => ({ visited: [...s.visited, id] })); };
  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-bold">Town Map</h1>
      <div className="card-game relative overflow-hidden p-0">
        <img src={town} alt="Illustrated town with a library, café, arcade and plaza" width={1024} height={1024} className="aspect-square w-full object-cover md:aspect-[16/10]" />
        {LOCATIONS.map((l) => (
          <button key={l.id} onClick={() => visit(l.id)} style={{ left: `${l.x}%`, top: `${l.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex min-h-12 items-center gap-1 rounded-full border-[3px] border-card bg-primary px-3 py-2 font-display text-sm font-bold text-primary-foreground shadow-pop transition hover:scale-110"
            aria-label={`Open ${l.name}${p.visited.includes(l.id) ? " (visited)" : ""}`}>
            <span aria-hidden>{l.emoji}</span><span className="hidden sm:inline">{l.name}</span>{p.visited.includes(l.id) && <span aria-hidden>✓</span>}
          </button>
        ))}
      </div>
      {open && <Activity id={open} onClose={() => setOpen(null)} />}
      <GpsMode />
    </div>
  );
}

function Activity({ id, onClose }: { id: string; onClose: () => void }) {
  const l = LOCATIONS.find((x) => x.id === id)!;
  return (
    <section aria-labelledby="act-title" className="card-game animate-rise p-5">
      <div className="flex items-start justify-between gap-3">
        <div><h2 id="act-title" className="text-2xl font-bold">{l.emoji} {l.name}</h2><p className="text-muted-foreground">{l.blurb}</p></div>
        <button onClick={onClose} className="btn-soft" aria-label="Close activity">✕</button>
      </div>
      <div className="mt-4">
        {id === "library" && <GenreMatch />}
        {id === "arcade" && <Trivia />}
        {id === "cafe" && <Link to="/chat" className="btn-game">Sit down for a chat ☕</Link>}
        {id === "plaza" && <Link to="/fandoms" className="btn-game">Join the plaza ⛲</Link>}
      </div>
    </section>
  );
}

function GenreMatch() {
  const p = useProgress();
  const [pick, setPick] = useState<string | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const [msg, setMsg] = useState("");
  const done = p.done.includes("library");
  const choose = (hookGenre: string) => {
    if (!pick) { setMsg("Pick a genre first!"); return; }
    if (pick === hookGenre) {
      const m = [...matched, pick]; setMatched(m); setPick(null); setMsg("Perfect match! 📚");
      if (m.length === GENRE_MATCH.length && !done) addXp(60, (s) => ({ done: [...s.done, "library"] }));
    } else setMsg("Not quite — try another!");
  };
  return (
    <div>
      {done && matched.length === 0 && <p className="mb-2 font-bold text-secondary-foreground">✓ Completed! Replay anytime.</p>}
      <p className="mb-2 text-sm font-bold">1. Pick a genre</p>
      <div className="flex flex-wrap gap-2">
        {GENRE_MATCH.map((g) => <button key={g.genre} disabled={matched.includes(g.genre)} aria-pressed={pick === g.genre} onClick={() => setPick(g.genre)}
          className={`btn-soft disabled:opacity-40 ${pick === g.genre ? "bg-pink-soft" : ""}`}>{g.genre}</button>)}
      </div>
      <p className="mb-2 mt-4 text-sm font-bold">2. Match its story hook</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {[...GENRE_MATCH].reverse().map((g) => <button key={g.hook} disabled={matched.includes(g.genre)} onClick={() => choose(g.genre)}
          className="min-h-12 rounded-2xl border-[3px] border-border bg-muted p-3 text-left font-semibold disabled:bg-sage disabled:line-through">{g.hook}</button>)}
      </div>
      <p role="status" className="mt-3 font-bold text-primary">{msg}</p>
    </div>
  );
}

function Trivia() {
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const over = i >= TRIVIA.length;
  const answer = (k: number) => { if (picked !== null) return; setPicked(k); if (k === TRIVIA[i].c) setScore((s) => s + 1); };
  const next = () => {
    const n = i + 1; setI(n); setPicked(null);
    if (n >= TRIVIA.length) addXp(score * 10, (s) => ({ done: [...new Set([...s.done, ...(score >= 4 ? ["trivia4"] : []), ...(score === 5 ? ["trivia5"] : [])])] }));
  };
  if (over) return (
    <div className="text-center"><p className="animate-pop text-5xl">{score >= 4 ? "🏆" : "🎮"}</p><p className="font-display text-2xl font-bold">{score} / {TRIVIA.length}</p><p className="text-muted-foreground">+{score * 10} XP {score < 4 && "— score 4+ to unlock a rare friend!"}</p>
      <button className="btn-game mt-3" onClick={() => { setI(0); setScore(0); }}>Play again</button></div>
  );
  const t = TRIVIA[i];
  return (
    <div>
      <p className="text-sm font-bold text-muted-foreground">Question {i + 1} of {TRIVIA.length} · Score {score}</p>
      <p className="mt-1 text-xl font-bold">{t.q}</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {t.a.map((a, k) => <button key={a} onClick={() => answer(k)} className={`min-h-12 rounded-2xl border-[3px] p-3 text-left font-bold ${picked === null ? "border-border bg-muted hover:bg-pink-soft" : k === t.c ? "border-secondary-foreground bg-sage" : k === picked ? "border-destructive bg-pink-soft" : "border-border bg-muted opacity-60"}`}>{a}</button>)}
      </div>
      <p role="status" className="mt-2 font-bold">{picked !== null && (picked === t.c ? "Correct! ✨" : "Good try — the right answer is highlighted.")}</p>
      {picked !== null && <button className="btn-game mt-2" onClick={next}>{i === TRIVIA.length - 1 ? "See results" : "Next"}</button>}
    </div>
  );
}

const SPOTS = ["a public library", "a park bench", "a community bookstore", "a café patio", "a public garden"];
function GpsMode() {
  const p = useProgress();
  const [status, setStatus] = useState("");
  const gps = () => {
    if (!("geolocation" in navigator)) { setStatus("GPS isn't available on this device — virtual walks work great!"); return; }
    setStatus("Asking your browser for permission…");
    navigator.geolocation.getCurrentPosition(
      () => { // Coordinates are used only on this device, never stored or shared.
        setStatus("📍 Discovery made nearby! Coordinates were not saved.");
        if (!p.done.includes("gps")) addXp(40, (s) => ({ done: [...s.done, "gps"] }));
      },
      () => setStatus("No problem! Permission wasn't given — try a virtual walk instead."),
      { enableHighAccuracy: false, timeout: 10000 },
    );
  };
  const walk = () => { setStatus(`🚶 You strolled past ${SPOTS[p.walks % SPOTS.length]} and found a friendly sticker! +15 XP`); update((s) => ({ walks: s.walks + 1, xp: s.xp + 15 })); };
  return (
    <section aria-labelledby="disc" className="card-game p-5">
      <h2 id="disc" className="text-2xl font-bold">🧭 Discovery Walks</h2>
      <p className="text-muted-foreground">Take a virtual walk anytime, or opt in to GPS mode. Your location stays on your device and is never shown to anyone. Only explore safe, public places with a trusted adult if needed.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button className="btn-game" onClick={walk}>Take a virtual walk</button>
        <button className="btn-soft" onClick={gps}>Use GPS (optional)</button>
      </div>
      <p role="status" className="mt-3 font-bold">{status}</p>
      <p className="text-sm text-muted-foreground">Walks taken: {p.walks}{p.walks < 3 && !p.done.includes("gps") && " · 3 walks unlock a legendary friend"}</p>
    </section>
  );
}
