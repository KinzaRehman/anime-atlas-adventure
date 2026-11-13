// Applies the real quest, badge and mission rules from the progress store to a simulated player's saved progress.
import { _testing, questStage, soraStage, townQuestStage, type Progress } from "@/lib/progress";
import { TOWN_FRIENDS, TOWN_QUESTS } from "@/data/game";
import { MISSIONS, advanceMission, missionPeriod } from "@/data/missions";

export const freshProgress = (): Progress => _testing.fresh();
export function withRules(s: Progress): Progress {
  let next = s;
  for (let i = 0; i < 4; i++) {
    const r = _testing.rules(next);
    const b = r.badges.filter((x) => !next.badges.includes(x)), c = r.chars.filter((x) => !next.chars.includes(x));
    if (!b.length && !c.length) return next;
    next = { ...next, badges: [...next.badges, ...b], chars: [...next.chars, ...c] };
  }
  return next;
}
export type Step = { kind: "meet" | "activity" | "turnin"; character: string; marker: string; location: string };
/** The next quest step a player can take, using the same stage helpers as the town. */
export function nextStep(s: Progress): Step | null {
  const q = questStage(s);
  if (q !== "done") return q === "find" ? { kind: "meet", character: "mochi", marker: "mochi-met", location: "library" } : q === "library" ? { kind: "activity", character: "mochi", marker: "library", location: "library" } : { kind: "turnin", character: "mochi", marker: "mochi-turnin", location: "library" };
  const so = soraStage(s);
  if (so !== "done" && so !== "locked") return so === "find" ? { kind: "meet", character: "sora", marker: "sora-met", location: "cafe" } : so === "library" ? { kind: "activity", character: "sora", marker: "cafe", location: "cafe" } : { kind: "turnin", character: "sora", marker: "sora-turnin", location: "cafe" };
  for (const id of TOWN_FRIENDS) {
    const st = townQuestStage(s, id), loc = TOWN_QUESTS[id].location;
    if (st === "find") return { kind: "meet", character: id, marker: `${id}-met`, location: loc };
    if (st === "activity") return { kind: "activity", character: id, marker: loc, location: loc };
    if (st === "return") return { kind: "turnin", character: id, marker: `${id}-turnin`, location: loc };
  }
  return null;
}
/** Same XP values the explore page awards. */
export function applyStep(s: Progress, step: Step, now: Date): { state: Progress; xp: number; mission?: string } {
  let xp = step.kind === "meet" ? 10 : step.kind === "turnin" ? 80 : 60;
  let next: Progress = { ...s, done: [...s.done, step.marker] };
  if (!next.visited.includes(step.location)) { next = { ...next, visited: [...next.visited, step.location] }; xp += 20; }
  next = { ...next, xp: next.xp + xp, walks: next.walks + 1 };
  if (step.kind === "activity") next = { ...next, missions: Object.fromEntries(MISSIONS.map((m) => [m.id, advanceMission(m, next.missions[m.id], step.location, now)])) };
  return { state: withRules(next), xp, ...(step.kind === "activity" ? { mission: step.location } : {}) };
}
/** Claims any complete, unclaimed mission for the current period; mirrors claimMission. */
export function claimReady(s: Progress, now: Date): { state: Progress; claimed: string[] } {
  let next = s; const claimed: string[] = [];
  for (const m of MISSIONS) {
    const saved = next.missions[m.id];
    if (!saved || saved.claimed || saved.period !== missionPeriod(m.period, now) || saved.steps.length !== m.steps.length) continue;
    next = { ...next, xp: next.xp + m.xp, badges: [...new Set([...next.badges, m.badge])], missions: { ...next.missions, [m.id]: { ...saved, claimed: true } } };
    claimed.push(m.id);
  }
  return { state: withRules(next), claimed };
}
/** Replaying a finished activity still counts toward missions, with no repeat XP (same as the town). */
export function replayActivity(s: Progress, location: string, now: Date): Progress {
  return { ...s, walks: s.walks + 1, missions: Object.fromEntries(MISSIONS.map((m) => [m.id, advanceMission(m, s.missions[m.id], location, now)])) };
}
