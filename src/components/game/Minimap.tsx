import { useEffect, useState } from "react";
import ground from "@/assets/world/ground.webp";
import { bus } from "@/game/bus";
import { ARCADE, CAFE, LIBRARY, MOCHI, PLAZA, SORA, TETSU, WORLD, YUZU } from "@/game/world";

export function Minimap({ met, soraOpen, tetsuOpen, yuzuOpen }: { met: boolean; soraOpen: boolean; tetsuOpen: boolean; yuzuOpen: boolean }) {
  const [p, setP] = useState({ x: 0, y: 0 });
  useEffect(() => { const off = bus.on("pos", setP); return () => { off(); }; }, []);
  const pc = (v: number, m: number) => `${(v / m) * 100}%`;
  return (
    <div className="glass relative h-24 w-24 overflow-hidden rounded-2xl p-1 sm:h-32 sm:w-32" aria-label="Minimap">
      <div className="relative h-full w-full overflow-hidden rounded-xl">
        <img src={ground} alt="" className="h-full w-full object-cover opacity-80" />
        <span className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-sm bg-matcha ring-2 ring-ivory" style={{ left: pc(LIBRARY.door.x, WORLD.w), top: pc(LIBRARY.door.y, WORLD.h) }} />
        <span className={`absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-ivory ${met ? "bg-lavender" : "bg-sakura animate-pulse"}`} style={{ left: pc(MOCHI.x, WORLD.w), top: pc(MOCHI.y, WORLD.h) }} />
        <span className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-sm bg-peach ring-2 ring-ivory" style={{ left: pc(CAFE.door.x, WORLD.w), top: pc(CAFE.door.y, WORLD.h) }} />
        <span className={`absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-ivory ${soraOpen ? "bg-sakura animate-pulse" : "bg-lavender"}`} style={{ left: pc(SORA.x, WORLD.w), top: pc(SORA.y, WORLD.h) }} />
        <span className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold ring-2 ring-charcoal" style={{ left: pc(p.x, WORLD.w), top: pc(p.y, WORLD.h) }} />
        {[ARCADE, PLAZA].map((spot, i) => <span key={i} className="absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-sm bg-matcha ring-1 ring-ivory" style={{ left: pc(spot.door.x, WORLD.w), top: pc(spot.door.y, WORLD.h) }} />)}
        {([{ spot: TETSU, open: tetsuOpen }, { spot: YUZU, open: yuzuOpen }]).map(({ spot, open }, i) => <span key={i} className={`absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full ring-1 ring-ivory ${open ? "animate-pulse bg-sakura" : "bg-lavender"}`} style={{ left: pc(spot.x, WORLD.w), top: pc(spot.y, WORLD.h) }} />)}
      </div>
    </div>
  );
}
