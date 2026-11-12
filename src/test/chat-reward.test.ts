import { beforeEach, describe, expect, it, vi } from "vitest";

describe("real-chat first conversation rewards", () => {
  beforeEach(() => { localStorage.clear(); vi.resetModules(); });
  const saved = () => JSON.parse(localStorage.getItem("animeatlas-progress-v1") ?? "{}");

  it("automatically awards 25 XP for each character's first successful reply", async () => {
    const { rewardFirstChat } = await import("@/lib/progress");
    expect(rewardFirstChat("mochi", true)).toBe(25);
    expect(saved().xp).toBe(25);
    expect(rewardFirstChat("sora", true)).toBe(25);
    expect(saved().xp).toBe(50);
    expect(saved().chatted).toEqual(["mochi", "sora"]);
    expect(saved().badges).toContain("friendly");
  });
  it("does not award XP for a failed reply", async () => {
    const { rewardFirstChat } = await import("@/lib/progress");
    expect(rewardFirstChat("mochi", false)).toBe(0);
    expect(rewardFirstChat("mochi", true)).toBe(25);
    expect(saved().xp).toBe(25);
  });
  it("does not reward follow-ups, repeated callbacks, or a reloaded conversation", async () => {
    const first = await import("@/lib/progress");
    first.rewardFirstChat("mochi", true);
    expect(first.rewardFirstChat("mochi", true)).toBe(0);
    vi.resetModules();
    const reloaded = await import("@/lib/progress");
    expect(reloaded.rewardFirstChat("mochi", true)).toBe(0);
    expect(saved().xp).toBe(25);
  });
});