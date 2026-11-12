import { useEffect, useState } from "react";
import { Check, Circle, Flag, Lock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { COLLECTIBLES, TOWN_MAP_QUESTS } from "@/data/game";
import { PORTRAITS } from "@/data/portraits";
import { useProgress } from "@/lib/progress";
import { mapQuestStage, type MapQuestStage } from "@/lib/town-map";
import { bus } from "@/game/bus";
import { ARCADE, CAFE, GARDEN, LIBRARY, PAPER, PLAZA, SPAWN, STUDIO, WORKSHOP, WORLD } from "@/game/world";
import ground from "@/assets/world/ground.webp";
import library from "@/assets/world/library.webp";
import cafe from "@/assets/world/cafe.webp";
import arcade from "@/assets/world/arcade.webp";
import plaza from "@/assets/world/plaza.webp";
import workshop from "@/assets/world/workshop.webp";
import studio from "@/assets/world/studio.webp";
import garden from "@/assets/world/garden.webp";
import paper from "@/assets/world/paper.webp";

const BUILDINGS = { library: { ...LIBRARY, image: library }, cafe: { ...CAFE, image: cafe }, arcade: { ...ARCADE, image: arcade }, plaza: { ...PLAZA, image: plaza }, workshop: { ...WORKSHOP, image: workshop }, studio: { ...STUDIO, image: studio }, garden: { ...GARDEN, image: garden }, paper: { ...PAPER, image: paper } };
const STATUS: Record<MapQuestStage, string> = { locked: "Locked", find: "Meet character", activity: "Quest in progress", return: "Return for card", done: "Completed" };
const pc = (value: number) => `${value / WORLD.w * 100}%`;

export function TownMap({ onClose }: { onClose: () => void }) {
  const progress = useProgress();
  const [position, setPosition] = useState(SPAWN);
  const [selected, setSelected] = useState(TOWN_MAP_QUESTS.find((q) => mapQuestStage(progress, q.character) !== "done")?.character ?? "mochi");
  useEffect(() => { const off = bus.on("pos", setPosition); return () => { off(); }; }, []);
  const completed = TOWN_MAP_QUESTS.filter((q) => mapQuestStage(progress, q.character) === "done").length;
  const quest = TOWN_MAP_QUESTS.find((q) => q.character === selected) ?? TOWN_MAP_QUESTS[0];
  if (!quest) return null;
  const character = COLLECTIBLES.find((c) => c.id === quest.character);
  const stage = mapQuestStage(progress, quest.character);
  const next = stage === "locked" ? (quest.character === "sora" ? "Complete Mochi's quest first." : "Complete Sora's Café Quiz and collect her card first.") : stage === "find" ? `Meet ${character?.name} in town to begin.` : stage === "activity" ? `Complete the challenge at ${quest.building}.` : stage === "return" ? `Return to ${character?.name} to collect their card.` : `${character?.name}'s card collected.`;

  return <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
    <DialogContent className="max-h-[90dvh] w-[calc(100%-1.5rem)] max-w-5xl overflow-y-auto rounded-2xl bg-card p-4 sm:p-6">
      <header className="pr-7">
        <p className="text-xs font-semibold uppercase text-primary">Sakuragaoka</p>
        <DialogTitle className="mt-1 font-display text-2xl">Town map</DialogTitle>
        <DialogDescription className="mt-2">{completed} / {TOWN_MAP_QUESTS.length} quests completed</DialogDescription>
      </header>
      <div className="grid gap-5 md:grid-cols-[1.2fr_1fr]">
        <div className="min-w-0">
          <div className="relative isolate aspect-square overflow-hidden rounded-xl border border-border bg-matcha" aria-label="Sakuragaoka buildings">
            <img src={ground} alt="Sakuragaoka town streets, fountain, and river" className="absolute inset-0 h-full w-full object-cover" />
            {TOWN_MAP_QUESTS.map((q, index) => {
              const building = BUILDINGS[q.location as keyof typeof BUILDINGS];
              const status = mapQuestStage(progress, q.character);
              const active = selected === q.character;
              return <div key={q.character}>
                <img src={building.image} alt="" className="pointer-events-none absolute -translate-x-1/2" style={{ left: pc(building.x), bottom: pc(WORLD.h - building.y), width: pc(building.w) }} />
                <Button variant="ghost" onClick={() => setSelected(q.character)} aria-label={`${q.building}: ${STATUS[status]}`} aria-pressed={active} title={q.building} className={`absolute z-10 h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 p-0 shadow-soft ${active ? "border-ivory bg-charcoal text-ivory ring-2 ring-primary" : status === "done" ? "border-ivory bg-secondary text-secondary-foreground" : status === "locked" ? "border-border bg-card text-muted-foreground" : "border-ivory bg-primary text-primary-foreground"}`} style={{ left: pc(building.door.x), top: pc(Math.min(building.door.y, WORLD.h - 80)) }}>
                  {status === "done" ? <Check /> : status === "locked" ? <Lock /> : index + 1}
                </Button>
              </div>;
            })}
            <span title="You are here" aria-label="You are here" className="pointer-events-none absolute z-20 grid h-5 w-5 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-charcoal bg-gold shadow-soft" style={{ left: pc(position.x), top: pc(position.y) }}><span className="h-1.5 w-1.5 rounded-full bg-charcoal" /></span>
          </div>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-primary" />Available</span>
            <span className="flex items-center gap-1"><Check className="h-3.5 w-3.5 text-secondary-foreground" />Completed</span>
            <span className="flex items-center gap-1"><Lock className="h-3.5 w-3.5" />Locked</span>
            <span className="flex items-center gap-1"><Circle className="h-3.5 w-3.5 fill-gold text-charcoal" />You</span>
          </div>
        </div>
        <div className="min-w-0">
          <div className="mb-3 flex items-center gap-3 border-b border-border pb-4" aria-live="polite">
            <img src={PORTRAITS[quest.character]} alt={character?.name ?? quest.character} className="h-16 w-16 shrink-0 rounded-lg object-cover" />
            <div className="min-w-0"><h3 className="font-display text-lg font-bold">{quest.title}</h3><p className="mt-1 text-sm text-muted-foreground">{next}</p></div>
          </div>
          <ol className="divide-y divide-border">
            {TOWN_MAP_QUESTS.map((q, index) => {
              const status = mapQuestStage(progress, q.character);
              return <li key={q.character}><Button variant="ghost" onClick={() => setSelected(q.character)} aria-pressed={selected === q.character} className={`h-auto min-h-14 w-full justify-start whitespace-normal rounded-lg px-2 py-2 text-left ${selected === q.character ? "bg-muted" : ""}`}>
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-background text-muted-foreground">{status === "done" ? <Check className="text-secondary-foreground" /> : status === "locked" ? <Lock /> : index + 1}</span>
                <span className="min-w-0 flex-1"><span className="block font-semibold">{q.building}</span><span className="block text-xs text-muted-foreground">{q.title}</span></span>
                <span className={`max-w-20 shrink-0 text-right text-xs ${status === "done" ? "text-secondary-foreground" : "text-muted-foreground"}`}>{status === "return" ? <span className="flex items-center gap-1"><Flag className="shrink-0" />{STATUS[status]}</span> : STATUS[status]}</span>
              </Button></li>;
            })}
          </ol>
        </div>
      </div>
    </DialogContent>
  </Dialog>;
}