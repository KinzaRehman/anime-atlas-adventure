import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { BookOpen, Hand, MessageCircle } from "lucide-react";
import { GameCanvas } from "@/components/game/GameCanvas";
import { Joystick } from "@/components/game/Joystick";
import { Minimap } from "@/components/game/Minimap";
import { TownMap } from "@/components/game/TownMap";
import { Sheet } from "@/components/game/Sheet";
import { Dialogue } from "@/components/game/Dialogue";
import { GenreMatch } from "@/components/game/GenreMatch";
import { CafeQuiz } from "@/components/game/CafeQuiz";
import { Missions } from "@/components/game/Missions";
import { Award } from "lucide-react";
import { QuestChallenge } from "@/components/game/QuestChallenge";
import { Button } from "@/components/ui/button";
import { UnlockSequence } from "@/components/game/UnlockSequence";
import { bus, type Target } from "@/game/bus";
import { MOCHI, SORA, TETSU, YUZU, REN, HANA, KAITO, NAMI } from "@/game/world";
import type { TownScene } from "@/game/TownScene";
import { COLLECTIBLES, MOCHI_LINES, SORA_LINES, TOWN_QUESTS, TOWN_FRIENDS, XP_PER_LEVEL, type TownFriend } from "@/data/game";
import { addXp, level, questStage, soraStage, townQuestStage, useProgress, recordMission } from "@/lib/progress";
import { SHOP_ITEMS } from "@/data/shop";
import { DEFAULT_AVATAR, isSparkly } from "@/data/avatar";
import { renderAvatarArt } from "@/lib/avatar-art";

export const Route = createFileRoute("/explore")({
  head: () => ({ meta: [
    { title: "Explore Sakuragaoka | AnimeAtlas" }, { name: "description", content: "Explore eight town locations, help original characters, complete daily and weekly missions, and earn collectible cards." },
    { property: "og:title", content: "Explore Sakuragaoka | AnimeAtlas" }, { property: "og:description", content: "A playable anime neighborhood." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: Explore,
});

const OBJECTIVE = { find: "Meet Mochi outside the Manga Library", library: "Sort the shelves at the Manga Library", return: "Return to Mochi" };
const SORA_OBJ = { find: "Say hello to Sora outside the café", library: "Win Sora's Café Quiz", return: "Return to Sora", done: "", locked: "" };
type Overlay = null | "dialogue" | "sora" | "library" | "cafe" | "unlock" | "unlock-sora" | "fade" | TownFriend | "arcade" | "plaza" | "workshop" | "studio" | "garden" | "paper" | `unlock-${TownFriend}` | "missions" | "map";

function Explore() {
  const p = useProgress();
  const pin = SHOP_ITEMS.find((item) => item.id === p.equippedItem);
  const stage = questStage(p);
  const sStage = soraStage(p);
  const tStage = townQuestStage(p, "tetsu"), yStage = townQuestStage(p, "yuzu");
  const rStage = townQuestStage(p, "ren"), hStage = townQuestStage(p, "hana");
  const nextFriend = TOWN_FRIENDS.find((id) => townQuestStage(p, id) !== "done");
  const objective = stage !== "done" ? OBJECTIVE[stage] : sStage !== "done" ? SORA_OBJ[sStage] : nextFriend ? TOWN_QUESTS[nextFriend].objective[townQuestStage(p, nextFriend)] : `All ${COLLECTIBLES.length} friends collected. Enjoy the town!`;
  const [near, setNear] = useState<Target>(null);
  const [ready, setReady] = useState(false);
  const [overlay, setOverlay] = useState<Overlay>(null);
  const scene = useRef<TownScene | null>(null);
  const onScene = useCallback((s: TownScene) => { scene.current = s; }, []);
  useEffect(() => { const a = bus.on("near", setNear), b = bus.on("ready", () => setReady(true)); return () => { a(); b(); }; }, []);
  useEffect(() => { bus.paused = overlay !== null; document.body.toggleAttribute("data-game-overlay", overlay !== null); return () => { bus.paused = false; document.body.removeAttribute("data-game-overlay"); }; }, [overlay]);
  useEffect(() => { scene.current?.setMarker("mochi", stage !== "done" && stage !== "library"); scene.current?.setMarker("sora", sStage === "find" || sStage === "return"); scene.current?.setMarker("tetsu", tStage === "find" || tStage === "return"); scene.current?.setMarker("yuzu", yStage === "find" || yStage === "return"); scene.current?.setMarker("ren", rStage === "find" || rStage === "return"); scene.current?.setMarker("hana", hStage === "find" || hStage === "return"); }, [stage, sStage, tStage, yStage, rStage, hStage, ready]);
  useEffect(() => { for (const id of ["kaito", "nami"] as const) { const q = townQuestStage(p, id); scene.current?.setMarker(id, q === "find" || q === "return"); } }, [p, ready]);

  useEffect(() => {
    if (!ready) return;
    let active = true;
    const avatar = { ...DEFAULT_AVATAR, ...p.avatar };
    renderAvatarArt(avatar).then((url) => { if (active) bus.emit("avatar", { url, sparkly: isSparkly(avatar) }); }).catch(() => {});
    return () => { active = false; };
  }, [p.avatar, ready]);

  const interact = useCallback(() => {
    if (!near || overlay) return;
    if (near.id === "mochi") setOverlay("dialogue");
    else if (near.id === "sora") setOverlay("sora");
    else if (near.id === "tetsu" || near.id === "yuzu" || near.id === "ren" || near.id === "hana" || near.id === "kaito" || near.id === "nami") setOverlay(near.id);
    else if (near.id === "arcade" || near.id === "plaza" || near.id === "workshop" || near.id === "studio" || near.id === "garden" || near.id === "paper") {
      const id = near.id === "arcade" ? "tetsu" : near.id === "plaza" ? "yuzu" : near.id === "workshop" ? "ren" : near.id === "studio" ? "hana" : near.id === "garden" ? "kaito" : "nami";
      const qStage = townQuestStage(p, id);
      if (qStage === "locked" || qStage === "find") { setOverlay(id); return; }
      const building = near.id;
      setOverlay("fade"); setTimeout(() => setOverlay(building), 350);
      if (!p.visited.includes(building)) addXp(20, (s) => ({ visited: [...s.visited, building] }));
    }
    else if (near.id === "cafe") {
      if (sStage === "locked" || sStage === "find") { setOverlay("sora"); return; }
      setOverlay("fade"); setTimeout(() => setOverlay("cafe"), 350); if (!p.visited.includes("cafe")) addXp(20, (s) => ({ visited: [...s.visited, "cafe"] }));
    } else { setOverlay("fade"); setTimeout(() => setOverlay("library"), 350); if (!p.visited.includes("library")) addXp(20, (s) => ({ visited: [...s.visited, "library"] })); }
  }, [near, overlay, p, sStage]);
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
  const cafeDone = () => { recordMission("cafe"); if (!p.done.includes("cafe")) addXp(60, (s) => ({ done: [...s.done, "cafe"] })); setOverlay(null); };
  const libraryDone = () => { recordMission("library"); if (!p.done.includes("library")) addXp(60, (s) => ({ done: [...s.done, "library"] })); setOverlay(null); };
  const mochi = COLLECTIBLES.find((c) => c.id === "mochi"), sora = COLLECTIBLES.find((c) => c.id === "sora");
  const endTownDialogue = (id: TownFriend) => {
    const qStage = townQuestStage(p, id);
    if (qStage === "find") addXp(10, (s) => ({ done: [...s.done, `${id}-met`] }));
    if (qStage === "return") {
      addXp(80, (s) => ({ done: [...s.done, `${id}-turnin`] }));
      const spot = { tetsu: TETSU, yuzu: YUZU, ren: REN, hana: HANA, kaito: KAITO, nami: NAMI }[id];
      scene.current?.celebrate(spot.x, spot.y - 100);
      setOverlay(`unlock-${id}`); return;
    }
    setOverlay(null);
  };
  const townChallengeDone = (id: TownFriend) => {
    const location = TOWN_QUESTS[id].location;
    recordMission(location);
    if (!p.done.includes(location)) addXp(60, (s) => ({ done: [...s.done, location] }));
    setOverlay(null);
  };
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
            <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{p.name}</p>{pin && <p className="text-xs text-sakura">{pin.title}</p>}<div className="mt-1 h-1.5 overflow-hidden rounded-full bg-ivory/15"><div className="h-full rounded-full bg-sakura transition-all duration-700" style={{ width: `${pct}%` }} /></div></div>
            <span className="text-xs tabular-nums text-ivory/70">{p.xp} XP</span>
          </div>
          <p className="mt-3 border-t border-ivory/10 pt-2 text-xs uppercase tracking-[0.16em] text-ivory/50">Objective</p>
          <p className="text-sm font-semibold" aria-live="polite">{objective}</p>
        </div>
        <Button variant="ghost" aria-label="Open town map" title="Town map & quest progress" onClick={() => setOverlay("map")} className="pointer-events-auto h-auto rounded-2xl p-0"><Minimap met={stage !== "find"} soraOpen={sStage === "find" || sStage === "return"} tetsuOpen={tStage === "find" || tStage === "return"} yuzuOpen={yStage === "find" || yStage === "return"} /></Button>
      </div>

      <Button variant="ghost" title="Daily and weekly missions" aria-label="Open missions" onClick={() => setOverlay("missions")} className="glass absolute right-3 top-40 h-12 w-12 rounded-full"><Award className="h-5 w-5" /></Button>
      {overlay === "missions" && <Sheet kicker="Town challenges" title="Daily & weekly missions" onClose={() => setOverlay(null)}><Missions /></Sheet>}
      {overlay === "map" && <TownMap onClose={() => setOverlay(null)} />}
      {/* Controls */}
      <div className="pointer-events-none absolute inset-x-0 bottom-24 flex items-end justify-between px-5 md:bottom-8">
        <div className="pointer-events-auto md:hidden"><Joystick /></div>
        <p className="glass hidden rounded-full px-4 py-2 text-xs text-ivory/80 md:block">Move <kbd className="font-bold">WASD</kbd> / arrows · Interact <kbd className="font-bold">E</kbd></p>
        <Button variant="ghost" onClick={interact} disabled={!near} aria-label={near?.label ?? "Nothing nearby to interact with"}
          className={`pointer-events-auto flex min-h-16 items-center gap-2 rounded-full px-5 font-display text-lg font-bold shadow-soft transition-all duration-300 ${near ? "translate-y-0 bg-ivory text-charcoal opacity-100" : "translate-y-4 opacity-0"}`}>
          {near && ["mochi", "sora", ...TOWN_FRIENDS].includes(near.id) ? <MessageCircle className="h-5 w-5" /> : near ? <BookOpen className="h-5 w-5" /> : <Hand className="h-5 w-5" />}
          {near?.label ?? ""}<kbd className="ml-1 hidden rounded bg-charcoal px-1.5 text-xs text-ivory md:inline">E</kbd>
        </Button>
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
      {TOWN_FRIENDS.map((id) => {
        const quest = TOWN_QUESTS[id], qStage = townQuestStage(p, id);
        const character = COLLECTIBLES.find((c) => c.id === id);
        if (!character) return null;
        const lines = quest.lines[qStage === "activity" ? "waiting" : qStage === "return" ? "thanks" : qStage === "done" ? "after" : qStage === "locked" ? "locked" : "intro"];
        return <div key={id}>
          {overlay === id && <Dialogue key={id} who={id} name={character.name} role={character.title} lines={lines} onDone={() => endTownDialogue(id)} cta={qStage === "find" ? "I'll help!" : qStage === "return" ? "Accept card" : "See you!"} />}
          {overlay === quest.location && <Sheet kicker={quest.building} title={quest.title} onClose={() => setOverlay(null)}><QuestChallenge questions={quest.questions} onComplete={() => townChallengeDone(id)} /></Sheet>}
          {overlay === `unlock-${id}` && <UnlockSequence c={character} reward="+80 XP · Quest complete" onClose={() => setOverlay(null)} />}
        </div>;
      })}
      {overlay === "unlock-sora" && sora && <UnlockSequence c={sora} reward="+80 XP · Badge: Trivia Star" onClose={() => setOverlay(null)} />}
      {overlay === "unlock" && mochi && <UnlockSequence c={mochi} onClose={() => setOverlay(null)} />}
    </div>
  );
}
