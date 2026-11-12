import { describe, it, expect } from "vitest";
import { _testing, level, questStage, soraStage, townQuestStage } from "@/lib/progress";
import { TOWN_QUESTS } from "@/data/game";
const f = _testing.fresh;
describe("progress rules", () => {
  for (const [id, activity, count] of [["tetsu", "arcade", 5], ["yuzu", "plaza", 3], ["ren", "workshop", 3], ["hana", "studio", 3], ["kaito", "garden", 3], ["nami", "paper", 3]] as const) {
    it(`${id} has a distinct ${count}-card challenge`, () => {
      expect(TOWN_QUESTS[id].location).toBe(activity);
      expect(TOWN_QUESTS[id].questions).toHaveLength(count);
    });
    it(`${id} unlocks after Sora and requires meeting, activity, and return`, () => {
      expect(townQuestStage(f(), id)).toBe("locked");
      const base = { ...f(), done: ["sora-turnin"] };
      expect(townQuestStage(base, id)).toBe("find");
      expect(townQuestStage({ ...base, done: [...base.done, `${id}-met`] }, id)).toBe("activity");
      const completed = { ...base, done: [...base.done, `${id}-met`, activity] };
      expect(townQuestStage(completed, id)).toBe("return");
      expect(_testing.rules(completed).chars).not.toContain(id);
      const turnedIn = { ...completed, done: [...completed.done, `${id}-turnin`] };
      expect(townQuestStage(turnedIn, id)).toBe("done");
      expect(_testing.rules(turnedIn).chars).toContain(id);
      for (const required of ["sora-turnin", `${id}-met`, activity, `${id}-turnin`]) {
        expect(_testing.rules({ ...turnedIn, done: turnedIn.done.filter((x) => x !== required) }).chars).not.toContain(id);
      }
    });
  }
  it("level up every 100 XP", () => { expect(level(0)).toBe(1); expect(level(300)).toBe(4); });
  it("Mochi unlocks only after the quest is turned in", () => {
    expect(_testing.rules({ ...f(), done: ["mochi-met", "library"] }).chars).not.toContain("mochi");
    expect(_testing.rules({ ...f(), done: ["mochi-met", "library", "mochi-turnin"] }).chars).toContain("mochi");
  });
  it("quest goes find -> library -> return -> done", () => {
    expect(questStage(f())).toBe("find");
    expect(questStage({ ...f(), done: ["mochi-met"] })).toBe("library");
    expect(questStage({ ...f(), done: ["mochi-met", "library"] })).toBe("return");
    expect(questStage({ ...f(), done: ["mochi-met", "library", "mochi-turnin"] })).toBe("done");
  });
  it("Sora's quest unlocks only after Mochi and grants her card on turn-in", () => {
    const f = _testing.fresh;
    expect(soraStage(f())).toBe("locked");
    expect(soraStage({ ...f(), done: ["mochi-turnin"] })).toBe("find");
    expect(soraStage({ ...f(), done: ["mochi-turnin", "sora-met"] })).toBe("library");
    expect(soraStage({ ...f(), done: ["mochi-turnin", "sora-met", "cafe"] })).toBe("return");
    expect(_testing.rules({ ...f(), done: ["mochi-turnin", "sora-met", "cafe"] }).chars).not.toContain("sora");
    expect(_testing.rules({ ...f(), done: ["mochi-turnin", "sora-met", "cafe", "sora-turnin"] }).chars).toContain("sora");
  });
});
