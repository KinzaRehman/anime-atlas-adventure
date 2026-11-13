import { describe, it, expect, vi } from "vitest";
vi.mock("@/integrations/supabase/client", () => ({ supabase: {} }));
import { ANIME_CATALOGUE, ANIME_GENRES, filterAnime } from "@/data/anime-catalogue";
import { groupSharedPlayers, validateDeckCard } from "@/lib/anime-decks";
describe("anime decks", () => {
  it("prelists 100 distinct anime cards", () => {
    expect(ANIME_CATALOGUE).toHaveLength(100);
    expect(new Set(ANIME_CATALOGUE.map((a) => a.key)).size).toBe(100);
  });
  it("covers the five requested discovery categories", () => {
    expect(ANIME_GENRES).toEqual(["Action", "Comedy", "Slice of Life", "Shounen", "Mystery"]);
    for (const genre of ANIME_GENRES) expect(filterAnime("", genre).length).toBeGreaterThan(0);
    expect(filterAnime("haikyu", "Mystery")).toEqual([]);
  });
  it("accepts only whole ratings from 1 through 5", () => {
    const card = { title: "Haikyu!!", description: "", character: "", rewatch: true, shared: false };
    for (const rating of [0, 6, 2.5]) expect(() => validateDeckCard({ ...card, rating })).toThrow();
    for (const rating of [1, 5]) expect(() => validateDeckCard({ ...card, rating })).not.toThrow();
  });
  it("ranks players by distinct shared anime rather than duplicate rows", () => {
    const rows = [
      { user_id: "a", title: "Haikyu!!", profiles: { display_name: "A" } },
      { user_id: "a", title: "Haikyu!!", profiles: { display_name: "A" } },
      { user_id: "b", title: "Haikyu!!", profiles: { display_name: "B" } },
      { user_id: "b", title: "Barakamon", profiles: { display_name: "B" } },
    ];
    expect(groupSharedPlayers(rows).map((p) => [p.id, p.titles.length])).toEqual([["b", 2], ["a", 1]]);
  });
});