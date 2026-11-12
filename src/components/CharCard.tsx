import type { Collectible } from "@/data/game";
const HUE = { pink: "bg-pink-soft", sage: "bg-sage", lavender: "bg-lavender", peach: "bg-peach" } as const;
export function CharCard({ c, unlocked }: { c: Collectible; unlocked: boolean }) {
  return (
    <article className={`card-game overflow-hidden ${unlocked ? "animate-rise" : "opacity-80"}`} aria-label={unlocked ? `${c.name}, unlocked` : `Locked character`}>
      <div className={`grid aspect-square place-items-center ${unlocked ? HUE[c.hue] : "bg-muted"}`}>
        <span className={`text-6xl ${unlocked ? "animate-bob" : "grayscale opacity-40"}`} aria-hidden>{unlocked ? c.emoji : "❔"}</span>
      </div>
      <div className="p-3">
        <div className="flex items-center justify-between gap-1">
          <h3 className="text-lg font-bold">{unlocked ? c.name : "???"}</h3>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase ${c.rarity === "legendary" ? "bg-gold" : c.rarity === "rare" ? "bg-lavender" : "bg-muted"}`}>{c.rarity}</span>
        </div>
        <p className="text-sm text-muted-foreground">{unlocked ? c.title : `🔒 ${c.how}`}</p>
      </div>
    </article>
  );
}
