import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { BookOpen, Hand, MessageCircle } from "lucide-react";
import { GameCanvas } from "@/components/game/GameCanvas";
import { Joystick } from "@/components/game/Joystick";
import { Minimap } from "@/components/game/Minimap";
import { Sheet } from "@/components/game/Sheet";
import { Dialogue } from "@/components/game/Dialogue";
import { GenreMatch } from "@/components/game/GenreMatch";
import { CafeQuiz } from "@/components/game/CafeQuiz";
import { UnlockSequence } from "@/components/game/UnlockSequence";
import { bus, type Target } from "@/game/bus";
import { MOCHI, SORA } from "@/game/world";
import type { TownScene } from "@/game/TownScene";
import { COLLECTIBLES, MOCHI_LINES, SORA_LINES, XP_PER_LEVEL } from "@/data/game";
import { addXp, level, questStage, soraStage, useProgress } from "@/lib/progress";

export const Route = createFileRoute("/explore")({
  head: () => ({ meta: [
    { title: "Explore Sakuragaoka | AnimeAtlas" }, { name: "description", content: "Walk the streets of Sakuragaoka, meet Mochi and help at the Manga Library." },
    { property: "og:title", content: "Explore Sakuragaoka | AnimeAtlas" }, { property: "og:description", content: "A playable anime neighborhood." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: Explore,
});

const OBJECTIVE = { find: "Find someone by the fountain", library: "Sort the shelves at the Manga Library", return: "Return to Mochi" };
const SORA_OBJ = { find: "Say hello to Sora outside the café", library: "Win Sora's Café Quiz", return: "Return to Sora", done: "Neighborhood complete. More districts coming soon", locked: "" };
type Overlay = null | "dialogue" | "sora" | "library" | "cafe" | "unlock" | "unlock-sora" | "fade";

function Explore() {
  const p = useProgress();
  const stage = questStage(p);
  const sStage = soraStage(p);
  const objective = stage !== "done" ? OBJECTIVE[stage] : SORA_OBJ[sStage];
  const [near, setNear] = useState<Target>(null);
  const [ready, setReady] = useState(false);
  const [overlay, setOverlay] = useState<Overlay>(null);
  const scene = useRef<TownScene | null>(null);
  const onScene = useCallback((s: TownScene) => { scene.current = s; }, []);
  useEffect(() => { const a = bus.on("near", setNear), b = bus.on("ready", () => setReady(true)); return () => { a(); b(); }; }, []);
  useEffect(() => { bus.paused = overlay !== null; document.body.toggleAttribute("data-game-overlay", overlay !== null); return () => document.body.removeAttribute("data-game-overlay"); }, [overlay]);
  useEffect(() => { scene.current?.setMarker("mochi", stage !== "done" && stage !== "library"); scene.current?.setMarker("sora", sStage === "find" || sStage === "return"); }, [stage, sStage, ready]);

  const interact = useCallback(() => {
    if (!near || overlay) return;
    if (near.id === "mochi") setOverlay("dialogue");
    else if (near.id === "sora") setOverlay("sora");
    else if (near.id === "cafe") {
      if (sStage === "locked" || sStage === "find") { setOverlay("sora"); return; }
      setOverlay("fade"); setTimeout(() => setOverlay("cafe"), 350); if (!p.visited.includes("cafe")) addXp(20, (s) => ({ visited: [...s.visited, "cafe"] }));
    } else { setOverlay("fade"); setTimeout(() => setOverlay("library"), 350); if (!p.visited.includes("library")) addXp(20, (s) => ({ visited: [...s.visited, "library"] })); }
  }, [near, overlay, p.visited, sStage]);
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (!overlay && (e.key.toLowerCase() === "e" || e.key === " ") && !(e.target instanceof HTMLInputElement)) { if (near) { e.preventDefault(); interact(); } } };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  }, [interact, near, overlay]);

  const lines = stage === "find" ? MOCHI_LINES.intro : stage === "library" ? MOCHI_LINES.waiting : stage === "return" ? MOCHI_LINES.thanks : MOCHI_LINES.after;
  const endDialogue = () => {
    if (stage === "find") addXp(10, (s) => ({ done: [...s.done, "mochi-met"] }));
    if (stage === "return") { addXp(80, (s) => ({ done: [...s.done, "mochi-turnin"] })); scene.current?.celebrate(MOCHI.x, MOCHI.y - 100); setOverlay("unlock"); return; }
    setOverlay(null);
  };
  const sLines = SORA_LINES[sStage === "library" ? "waiting" : sStage === "return" ? "thanks" : sStage === "done" ? "after" : sStage === "locked" ? "locked" : "intro"];
  const endSora = () => {
    if (sStage === "find") addXp(10, (s) => ({ done: [...s.done, "sora-met"] }));
    if (sStage === "return") { addXp(80, (s) => ({ done: [...s.done, "sora-turnin"] })); scene.current?.celebrate(SORA.x, SORA.y - 100); setOverlay("unlock-sora"); return; }
    setOverlay(null);
  };
  const cafeDone = () => { if (!p.done.includes("cafe")) addXp(60, (s) => ({ done: [...s.done, "cafe"] })); setOverlay(null); };
  const libraryDone = () => { if (!p.done.includes("library")) addXp(60, (s) => ({ done: [...s.done, "library"] })); setOverlay(null); };
  const mochi = COLLECTIBLES[0]!, sora = COLLECTIBLES[1]!;
  const pct = ((p.xp % XP_PER_LEVEL) / XP_PER_LEVEL) * 100;

  return (
    <div className="fixed inset-0 overflow-hidden bg-charcoal">
      <GameCanvas onScene={onScene} />
      {!ready && <div className="absolute inset-0 grid place-items-center bg-charcoal text-ivory" role="status"><div className="text-center"><div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-ivory/20 border-t-sakura" /><p className="mt-4 font-display text-lg">Arriving in Sakuragaoka…</p></div></div>}
      {overlay === "fade" && <div className="animate-fade absolute inset-0 z-30 bg-ivory" />}

      {/* HUD */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-3 pt-[max(.75rem,env(safe-area-inset-top))]">
        <div className="pointer-events-auto glass max-w-[62vw] rounded-2xl px-4 py-3 sm:max-w-sm">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-gold font-display font-bold text-charcoal" aria-label={`Level ${level(p.xp)}`}>{level(p.xp)}</span>
            <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{p.name}</p><div className="mt-1 h-1.5 overflow-hidden rounded-full bg-ivory/15"><div className="h-full rounded-full bg-sakura transition-all duration-700" style={{ width: `${pct}%` }} /></div></div>
            <span className="text-xs tabular-nums text-ivory/70">{p.xp} XP</span>
          </div>
          <p className="mt-3 border-t border-ivory/10 pt-2 text-xs uppercase tracking-[0.16em] text-ivory/50">Objective</p>
          <p className="text-sm font-semibold" aria-live="polite">{objective}</p>
        </div>
        <div className="pointer-events-auto"><Minimap met={stage !== "find"} soraOpen={sStage === "find" || sStage === "return"} /></div>
      </div>

      {/* Controls */}
      <div className="pointer-events-none absolute inset-x-0 bottom-24 flex items-end justify-between px-5 md:bottom-8">
        <div className="pointer-events-auto md:hidden"><Joystick /></div>
        <p className="glass hidden rounded-full px-4 py-2 text-xs text-ivory/80 md:block">Move <kbd className="font-bold">WASD</kbd> / arrows · Interact <kbd className="font-bold">E</kbd></p>
        <button onClick={interact} disabled={!near} aria-label={near?.label ?? "Nothing nearby to interact with"}
          className={`pointer-events-auto flex min-h-16 items-center gap-2 rounded-full px-5 font-display text-lg font-bold shadow-soft transition-all duration-300 ${near ? "translate-y-0 bg-ivory text-charcoal opacity-100" : "translate-y-4 opacity-0"}`}>
          {near?.id === "mochi" || near?.id === "sora" ? <MessageCircle className="h-5 w-5" /> : near ? <BookOpen className="h-5 w-5" /> : <Hand className="h-5 w-5" />}
          {near?.label ?? ""}<kbd className="ml-1 hidden rounded bg-charcoal px-1.5 text-xs text-ivory md:inline">E</kbd>
        </button>
      </div>

      {overlay === "dialogue" && <Dialogue who="mochi" name="Mochi" role="Librarian" lines={lines} onDone={endDialogue} cta={stage === "find" ? "I'll help!" : stage === "return" ? "Accept card" : "Bye for now"} />}
      {overlay === "library" && (
        <Sheet kicker="Manga Library" title={p.done.includes("library") ? "Shelves are tidy. Play again?" : "Help Mochi sort the shelves"} onClose={() => setOverlay(null)}>
          <GenreMatch onComplete={libraryDone} />
        </Sheet>
      )}
      {overlay === "sora" && <Dialogue who="sora" name="Sora" role="Barista" lines={sLines} onDone={endSora} cta={sStage === "find" ? "Quiz me!" : sStage === "return" ? "Accept card" : "See you!"} />}
      {overlay === "cafe" && (
        <Sheet kicker="Yasuragi Café" title={p.done.includes("cafe") ? "Quiz night again?" : "Sora's Café Quiz"} onClose={() => setOverlay(null)}>
          <CafeQuiz onComplete={cafeDone} />
        </Sheet>
      )}
      {overlay === "unlock-sora" && <UnlockSequence c={sora} reward="+80 XP · Badge: Trivia Star" onClose={() => setOverlay(null)} />}
      {overlay === "unlock" && <UnlockSequence c={mochi} onClose={() => setOverlay(null)} />}
    </div>
  );
}
