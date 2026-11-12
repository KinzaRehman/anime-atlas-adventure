import { describe, expect, it } from "vitest";
import { TOWN_MAP_QUESTS } from "@/data/game";
import { _testing } from "@/lib/progress";
import { mapQuestStage } from "@/lib/town-map";

describe("town quest map", () => {
  it("includes all eight playable buildings with distinct characters", () => {
    expect(TOWN_MAP_QUESTS.map((q) => q.location)).toEqual(["library", "cafe", "arcade", "plaza", "workshop", "studio", "garden", "paper"]);
    expect(new Set(TOWN_MAP_QUESTS.map((q) => q.character)).size).toBe(8);
  });
  for (const quest of TOWN_MAP_QUESTS) {
    it(`${quest.character} is complete only after the encounter turn-in`, () => {
      const gates = quest.character === "mochi" ? [] : quest.character === "sora" ? ["mochi-turnin"] : ["mochi-turnin", "sora-turnin"];
      const progress = { ..._testing.fresh(), done: [...gates, `${quest.character}-met`, quest.location] };
      expect(mapQuestStage(progress, quest.character)).toBe("return");
      expect(mapQuestStage({ ...progress, done: [...progress.done, `${quest.character}-turnin`] }, quest.character)).toBe("done");
    });
  }
  it("shows fresh-town gates and activity progress without changing progress", () => {
    const fresh = _testing.fresh();
    expect(mapQuestStage(fresh, "mochi")).toBe("find");
    expect(mapQuestStage(fresh, "sora")).toBe("locked");
    expect(mapQuestStage(fresh, "kaito")).toBe("locked");
    expect(mapQuestStage({ ...fresh, done: ["mochi-met"] }, "mochi")).toBe("activity");
    expect(fresh.done).toEqual([]);
  });
});