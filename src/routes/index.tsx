import { createFileRoute, Link } from "@tanstack/react-router";
import town from "@/assets/town-map.jpg";
import mochi from "@/assets/char-mochi.jpg";
import sora from "@/assets/char-sora.jpg";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "AnimeAtlas — Explore a cozy anime town" },
    { name: "description", content: "Discover original characters, play trivia, collect friends and join a wholesome anime fan community." },
    { property: "og:title", content: "AnimeAtlas — Explore a cozy anime town" },
    { property: "og:description", content: "Discover original characters, play trivia and collect friends." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Welcome,
});

function Welcome() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-sky">
      <img src={town} alt="" width={1024} height={1024} className="absolute inset-0 h-full w-full object-cover opacity-50" />
      <div className="relative mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-6 py-10 text-center">
        <div className="mb-4 flex -space-x-6">
          <img src={mochi} alt="Mochi the librarian" width={816} height={816} className="animate-bob h-28 w-28 rounded-full border-4 border-card object-cover shadow-card" />
          <img src={sora} alt="Sora the barista" width={816} height={816} className="animate-bob h-28 w-28 rounded-full border-4 border-card object-cover shadow-card [animation-delay:.4s]" />
        </div>
        <div className="card-game animate-rise px-6 py-8">
          <p className="text-sm font-extrabold uppercase tracking-widest text-primary">Welcome, traveler</p>
          <h1 className="mt-1 text-5xl font-bold">AnimeAtlas</h1>
          <p className="mt-3 text-lg text-muted-foreground">A cozy town full of manga, trivia, café friends and fellow fans. Explore, earn XP and collect 8 original characters.</p>
          <Link to="/explore" className="btn-game mt-6 text-lg">Start Exploring ✨</Link>
        </div>
      </div>
    </main>
  );
}
