import { describe, it, expect } from "vitest";
import { _testing, level, questStage, soraStage } from "@/lib/progress";
const f = _testing.fresh;
describe("progress rules", () => {
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
