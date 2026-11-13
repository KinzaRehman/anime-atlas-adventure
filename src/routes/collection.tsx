import { createFileRoute } from "@tanstack/react-router";
import { COLLECTIBLES } from "@/data/game";
import { CharCard } from "@/components/CharCard";
import { useProgress } from "@/lib/progress";
import { AnimeCards } from "@/components/collection/AnimeCards";
import { AnimeDecks } from "@/components/collection/AnimeDecks";

export const Route = createFileRoute("/collection")({
  head: () => ({ meta: [
    { title: "Anime Decks & Collection — AnimeAtlas" }, { name: "description", content: "Collect town friends, browse 100 curated anime, save rated cards and find players with shared interests." },
    { property: "og:title", content: "Anime Decks & Collection — AnimeAtlas" }, { property: "og:description", content: "Your anime deck, original town friends and shared interests." },
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
      <AnimeDecks />
      <AnimeCards />
    </div>
  );
}
