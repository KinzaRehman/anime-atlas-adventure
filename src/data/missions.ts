export const MISSIONS = [
  { id: "daily-reading", period: "daily", title: "Library to café", steps: ["library", "cafe"], labels: ["Sort Mochi's shelves", "Complete Sora's café quiz"], xp: 50, badge: "daily-explorer" },
  { id: "weekly-town", period: "weekly", title: "Around Sakuragaoka", steps: ["library", "cafe", "arcade", "plaza", "workshop", "studio"], labels: ["Mochi's library", "Sora's café", "Tetsu's arcade", "Yuzu's pavilion", "Ren's workshop", "Hana's studio"], xp: 200, badge: "weekly-explorer" },
] as const;
export type MissionState = { period: string; steps: string[]; claimed: boolean };
export function missionPeriod(period: string, now = new Date()) {
  const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  if (period === "weekly") date.setUTCDate(date.getUTCDate() - (date.getUTCDay() + 6) % 7);
  return date.toISOString().slice(0, 10);
}
export function advanceMission(mission: typeof MISSIONS[number], previous: MissionState | undefined, event: string, now = new Date()): MissionState {
  const period = missionPeriod(mission.period, now);
  const state = previous?.period === period ? previous : { period, steps: [], claimed: false };
  if (state.claimed || mission.steps[state.steps.length] !== event) return state;
  return { ...state, steps: [...state.steps, event] };
}