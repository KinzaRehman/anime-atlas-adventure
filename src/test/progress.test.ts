import { describe, it, expect } from "vitest";
import { _testing, level } from "@/lib/progress";
describe("progress rules", () => {
  it("level up every 100 XP", () => { expect(level(0)).toBe(1); expect(level(300)).toBe(4); });
  it("visiting all 4 locations unlocks Rin and Explorer", () => {
    const r = _testing.rules({ ..._testing.fresh(), visited: ["a", "b", "c", "d"] });
    expect(r.chars).toContain("rin"); expect(r.badges).toContain("explorer");
  });
  it("3 virtual walks unlock Nori without GPS", () => {
    expect(_testing.rules({ ..._testing.fresh(), walks: 3 }).chars).toContain("nori");
  });
});
