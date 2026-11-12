import { Lock } from "lucide-react";
import type { Character } from "@/data/game";
import { PORTRAITS } from "@/data/portraits";

export function CharCard({ c, unlocked, n }: { c: Character; unlocked: boolean; n: number }) {
  const img = PORTRAITS[c.id];
  return (
    <article className="paper group overflow-hidden rounded-2xl p-1.5" aria-label={unlocked ? `${c.name}, collected` : "Undiscovered character"}>
      <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-charcoal">
        {img && <img src={img} alt="" loading="lazy" className={`h-full w-full object-cover transition duration-500 ${unlocked ? "group-hover:scale-105" : "scale-110 opacity-25 blur-md grayscale"}`} />}
        {!unlocked && <div className="absolute inset-0 grid place-items-center text-ivory/70"><Lock className="h-7 w-7" aria-hidden /></div>}
        <span className="absolute left-2 top-2 rounded-full bg-charcoal/70 px-2 py-0.5 text-[10px] font-bold tracking-[0.15em] text-ivory backdrop-blur">No. {String(n).padStart(3, "0")}</span>
      </div>
      <div className="px-2 pb-2 pt-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">{c.rarity}</p>
        <h3 className="font-display text-lg font-bold">{unlocked ? c.name : "Undiscovered"}</h3>
        <p className="text-sm text-muted-foreground">{unlocked ? c.title : c.how}</p>
      </div>
    </article>
  );
}
