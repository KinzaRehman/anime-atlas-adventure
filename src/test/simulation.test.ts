import { describe, expect, it } from "vitest";
import { PERSONAS, testEmail } from "@/lib/sim/personas";
import { isActive, rng } from "@/lib/sim/engine";
import { applyStep, claimReady, freshProgress, nextStep } from "@/lib/sim/progress-sim";

describe("simulation personas", () => {
  it("has 30 accounts in the requested mix", () => {
    const n = (a: string) => PERSONAS.filter((p) => p.archetype === a).length;
    expect(PERSONAS).toHaveLength(30);
    expect([n("daily"), n("casual"), n("character"), n("social"), n("achiever"), n("newbie"), n("returning")]).toEqual([5, 5, 5, 5, 4, 3, 3]);
  });
  it("uses unique reserved test emails", () => {
    const emails = PERSONAS.map((p) => testEmail(p.handle));
    expect(new Set(emails).size).toBe(30);
    expect(emails.every((e) => e.endsWith("@animeatlas.test"))).toBe(true);
  });
  it("returning players stay away for two weeks", () => {
    const p = PERSONAS.find((x) => x.archetype === "returning")!;
    for (let d = p.joinedDay + 5; d < p.joinedDay + 19; d++) expect(isActive(p, d, rng(`x${d}`))).toBe(false);
  });
});

describe("simulated progress uses the game rules", () => {
  it("follows Mochi then Sora, awarding the town's XP", () => {
    const now = new Date("2026-10-01T10:00:00Z");
    let s = freshProgress(); const seen: string[] = [];
    for (let i = 0; i < 6; i++) { const step = nextStep(s)!; seen.push(step.marker); s = applyStep(s, step, now).state; }
    expect(seen).toEqual(["mochi-met", "library", "mochi-turnin", "sora-met", "cafe", "sora-turnin"]);
    expect(s.chars).toEqual(["mochi", "sora"]);
    expect(s.xp).toBe(10 + 20 + 60 + 80 + 10 + 20 + 60 + 80);
  });
  it("claims the daily mission once", () => {
    const now = new Date("2026-10-01T10:00:00Z");
    let s = freshProgress();
    for (let i = 0; i < 5; i++) s = applyStep(s, nextStep(s)!, now).state;
    const first = claimReady(s, now); const again = claimReady(first.state, now);
    expect(first.claimed).toEqual(["daily-reading"]);
    expect(again.claimed).toEqual([]);
  });
});
