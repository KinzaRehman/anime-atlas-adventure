import { createFileRoute } from "@tanstack/react-router";
import { COLLECTIBLES } from "@/data/game";
import { CharCard } from "@/components/CharCard";
import { useProgress } from "@/lib/progress";

export const Route = createFileRoute("/collection")({
  head: () => ({ meta: [
    { title: "Character Collection — AnimeAtlas" }, { name: "description", content: "See every original character you've befriended and how to unlock the rest." },
    { property: "og:title", content: "Character Collection — AnimeAtlas" }, { property: "og:description", content: "Your gallery of original anime-style friends." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: Collection,
});

function Collection() {
  const p = useProgress();
  return (
    <div>
      <h1 className="text-4xl font-black">Collection</h1>
      <p className="text-muted-foreground">{p.chars.length} of {COLLECTIBLES.length} friends met. Every friend is earned through a clear achievement — no random draws.</p>
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {COLLECTIBLES.map((c, i) => <CharCard key={c.id} n={i + 1} c={c} unlocked={p.chars.includes(c.id)} />)}
      </div>
    </div>
  );
}
