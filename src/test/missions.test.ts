import { describe, expect, it } from "vitest";
import { MISSIONS, advanceMission, missionPeriod } from "@/data/missions";
import { _testing, claimMission, recordMission, reset, useProgress } from "@/lib/progress";
import { renderHook, act } from "@testing-library/react";

describe("town missions", () => {
  it("daily requires library then café, not repeated café completions", () => {
    const m = MISSIONS[0];
    expect(advanceMission(m, undefined, "cafe").steps).toEqual([]);
    const first = advanceMission(m, undefined, "library");
    expect(advanceMission(m, first, "library").steps).toEqual(["library"]);
    expect(advanceMission(m, first, "cafe").steps).toEqual(["library", "cafe"]);
  });
  it("weekly spans all six buildings in order", () => {
    expect(MISSIONS[1].steps).toEqual(["library", "cafe", "arcade", "plaza", "workshop", "studio"]);
  });
  it("resets daily at UTC midnight and weekly on Monday", () => {
    expect(missionPeriod("daily", new Date("2026-11-12T23:59:59Z"))).toBe("2026-11-12");
    expect(missionPeriod("daily", new Date("2026-11-13T00:00:00Z"))).toBe("2026-11-13");
    expect(missionPeriod("weekly", new Date("2026-11-15T23:59:59Z"))).toBe("2026-11-09");
    expect(missionPeriod("weekly", new Date("2026-11-16T00:00:00Z"))).toBe("2026-11-16");
  });
  it("daily reward is 50 XP and one badge, claimable only once", () => {
    reset(); const { result } = renderHook(() => useProgress());
    act(() => { claimMission("daily-reading"); });
    expect(result.current.xp).toBe(0);
    act(() => { recordMission("library"); recordMission("cafe"); claimMission("daily-reading"); claimMission("daily-reading"); });
    expect(result.current.xp).toBe(50);
    expect(result.current.badges).toContain("daily-explorer");
    expect(_testing.fresh().missions).toEqual({});
  });
  it("weekly reward is 200 XP and a weekly badge", () => {
    reset(); const { result } = renderHook(() => useProgress());
    act(() => { for (const event of MISSIONS[1].steps) recordMission(event); claimMission("weekly-town"); claimMission("weekly-town"); });
    expect(result.current.xp).toBe(200);
    expect(result.current.badges).toContain("weekly-explorer");
  });
});