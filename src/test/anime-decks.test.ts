import { describe, it, expect, vi } from "vitest";
const { from } = vi.hoisted(() => ({ from: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { from } }));
import { ANIME_CATALOGUE, ANIME_GENRES, filterAnime } from "@/data/anime-catalogue";
import { groupSharedPlayers, sharedPlayers, validateDeckCard } from "@/lib/anime-decks";
describe("anime decks", () => {
  it("prelists 100 distinct anime cards", () => {
    expect(ANIME_CATALOGUE).toHaveLength(100);
    expect(new Set(ANIME_CATALOGUE.map((a) => a.key)).size).toBe(100);
  });
  it("covers the five requested discovery categories", () => {
    expect(ANIME_GENRES).toEqual(expect.arrayContaining(["Action", "Comedy", "Slice of Life", "Mystery"]));
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
  it("matches three catalogue decks using only other players' opted-in matching cards", async () => {
    const titles = ["Haikyu!!", "Naruto", "One Piece"];
    const keys = titles.map((title) => ANIME_CATALOGUE.find((a) => a.title === title)?.key ?? "missing");
    const rows = [
      { user_id: "me", anime_key: keys[0], title: titles[0], shared: true, profiles: { display_name: "Me" } },
      { user_id: "sports", anime_key: keys[0], title: titles[0], shared: true, profiles: { display_name: "Sports player" } },
      { user_id: "mixed", anime_key: keys[0], title: titles[0], shared: true, profiles: { display_name: "Mixed player" } },
      { user_id: "mixed", anime_key: keys[1], title: titles[1], shared: true, profiles: { display_name: "Mixed player" } },
      { user_id: "private", anime_key: keys[2], title: titles[2], shared: false, profiles: { display_name: "Private player" } },
      { user_id: "unrelated", anime_key: "sherlock-hound", title: "Sherlock Hound", shared: true, profiles: { display_name: "Mystery player" } },
    ];
    let result = rows;
    const chain = {
      select: vi.fn(() => chain),
      eq: vi.fn((field, value) => { result = result.filter((r) => r[field as keyof typeof r] === value); return chain; }),
      neq: vi.fn((field, value) => { result = result.filter((r) => r[field as keyof typeof r] !== value); return chain; }),
      in: vi.fn((_field, values) => { result = result.filter((r) => values.includes(r.anime_key)); return chain; }),
      limit: vi.fn(async () => ({ data: result, error: null })),
    };
    from.mockReturnValue(chain);
    expect(keys).not.toContain("missing");
    expect(await sharedPlayers("me", keys)).toEqual([
      { id: "mixed", name: "Mixed player", titles: ["Haikyu!!", "Naruto"] },
      { id: "sports", name: "Sports player", titles: ["Haikyu!!"] },
    ]);
    expect(chain.eq).toHaveBeenCalledWith("shared", true);
    expect(chain.neq).toHaveBeenCalledWith("user_id", "me");
  });
});