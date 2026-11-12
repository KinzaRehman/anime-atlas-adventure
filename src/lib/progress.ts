// Progress store backed by localStorage. Swap load/save for API calls later.
import { useSyncExternalStore } from "react";
import { COLLECTIBLES, BADGES, XP_PER_LEVEL, TOWN_FRIENDS, TOWN_QUESTS, type TownFriend } from "@/data/game";
import { MISSIONS, advanceMission, missionPeriod, type MissionState } from "@/data/missions";
import { SHOP_ITEMS } from "@/data/shop";
import { AVATAR_OPTIONS, DEFAULT_AVATAR, type AvatarConfig } from "@/data/avatar";

export interface Progress { name: string; xp: number; badges: string[]; chars: string[]; visited: string[]; done: string[]; vote: number | null; walks: number; chatted: string[]; missions: Record<string, MissionState>; spentXp: number; items: string[]; equippedItem: string | null; anime: AnimeCard[]; avatar: AvatarConfig; wardrobe: string[]; }
export interface AnimeCard { id: string; title: string; rating: number; description: string; rewatch: boolean; character: string; addedAt: number; }
const KEY = "animeatlas-progress-v1";
const fresh = (): Progress => ({ name: "Traveler", xp: 0, badges: [], chars: [], visited: [], done: [], vote: null, walks: 0, chatted: [], missions: {}, spentXp: 0, items: [], equippedItem: null, anime: [], avatar: DEFAULT_AVATAR, wardrobe: [] });
let state: Progress = fresh();
let loaded = false;
const subs = new Set<() => void>();
type Unlock = { kind: "badge" | "char" | "level"; label: string; emoji: string };
let unlockQueue: Unlock[] = [];

function load() { if (loaded || typeof window === "undefined") return; loaded = true; try { const r = localStorage.getItem(KEY); if (r) state = { ...fresh(), ...JSON.parse(r) }; } catch {} }
function emit() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {} subs.forEach((f) => f()); }
export const level = (xp: number) => Math.floor(xp / XP_PER_LEVEL) + 1;
export const availableXp = (s: Progress) => Math.max(0, s.xp - s.spentXp);
export function buyItem(id: string): "bought" | "owned" | "insufficient" | "unknown" {
  const item = SHOP_ITEMS.find((i) => i.id === id);
  if (!item) return "unknown";
  let result: "bought" | "owned" | "insufficient" = "insufficient";
  update((s) => {
    if (s.items.includes(id)) { result = "owned"; return {}; }
    if (availableXp(s) < item.price) return {};
    result = "bought";
    return { spentXp: s.spentXp + item.price, items: [...s.items, id], equippedItem: id };
  });
  return result;
}
export function equipItem(id: string | null) {
  update((s) => id === null || s.items.includes(id) ? { equippedItem: id } : {});
}

function rules(s: Progress): { badges: string[]; chars: string[] } {
  const b: string[] = [], c: string[] = [];
  if (s.visited.length >= 1) b.push("first-steps");
  if (s.done.includes("library")) b.push("bookworm");
  if (s.chatted.length >= 2) b.push("friendly");
  if (s.done.includes("trivia5") || s.done.includes("cafe")) b.push("trivia-star");
  if (s.done.includes("sora-turnin")) c.push("sora");
  for (const id of TOWN_FRIENDS) {
    const activity = TOWN_QUESTS[id].location;
    if (s.done.includes("sora-turnin") && s.done.includes(`${id}-met`) && s.done.includes(activity) && s.done.includes(`${id}-turnin`)) c.push(id);
  }
  if (s.vote !== null) b.push("voice");
  if (s.done.includes("mochi-turnin")) { c.push("mochi"); b.push("explorer"); }
  return { badges: b, chars: c };
}

export function update(fn: (s: Progress) => Partial<Progress>) {
  load();
  const prevLvl = level(state.xp);
  let next = { ...state, ...fn(state) };
  const r = rules(next);
  const newB = r.badges.filter((x) => !next.badges.includes(x));
  const newC = r.chars.filter((x) => !next.chars.includes(x));
  next = { ...next, badges: [...next.badges, ...newB], chars: [...next.chars, ...newC] };
  // second pass in case new chars push level
  state = next;
  if (level(state.xp) > prevLvl) unlockQueue.push({ kind: "level", label: `Level ${level(state.xp)}!`, emoji: "⬆️" });
  newB.forEach((id) => { const x = BADGES.find((b) => b.id === id); if (x) unlockQueue.push({ kind: "badge", label: x.name, emoji: x.emoji }); });
  newC.forEach((id) => { const x = COLLECTIBLES.find((c) => c.id === id); if (x) unlockQueue.push({ kind: "char", label: `${x.name}, ${x.title}`, emoji: x.emoji }); });
  const again = rules(state).chars.filter((x) => !state.chars.includes(x));
  if (again.length) return update(() => ({}));
  emit();
}
export const addXp = (n: number, extra: (s: Progress) => Partial<Progress> = () => ({})) => update((s) => ({ ...extra(s), xp: s.xp + n }));
export function rewardFirstChat(character: "mochi" | "sora", successfulReply: boolean): number {
  if (!successfulReply) return 0;
  let earned = 0;
  update((s) => {
    if (s.chatted.includes(character)) return {};
    earned = 25;
    return { xp: s.xp + earned, chatted: [...s.chatted, character] };
  });
  return earned;
}
export function recordMission(event: string) {
  update((s) => ({ missions: Object.fromEntries(MISSIONS.map((mission) => [mission.id, advanceMission(mission, s.missions[mission.id], event)])) }));
}
export function claimMission(id: string) {
  const mission = MISSIONS.find((m) => m.id === id);
  if (!mission) return;
  update((s) => {
    const saved = s.missions[id];
    if (!saved || saved.claimed || saved.period !== missionPeriod(mission.period) || saved.steps.length !== mission.steps.length) return {};
    return { xp: s.xp + mission.xp, badges: [...new Set([...s.badges, mission.badge])], missions: { ...s.missions, [id]: { ...saved, claimed: true } } };
  });
}
export function reset() { state = fresh(); unlockQueue = []; emit(); }
export function popUnlock() { const u = unlockQueue.shift(); if (u) subs.forEach((f) => f()); return u; }
export const peekUnlock = () => unlockQueue[0];

const subscribe = (f: () => void) => { subs.add(f); if (!loaded) { load(); queueMicrotask(f); } return () => subs.delete(f); };
const server = fresh();
export function useProgress() { return useSyncExternalStore(subscribe, () => state, () => server); }
export function useUnlock() { return useSyncExternalStore(subscribe, () => unlockQueue[0], () => undefined); }
export const _testing = { rules, fresh };

export type QuestStage = "find" | "library" | "return" | "done";
export const questStage = (s: Progress): QuestStage =>
  s.done.includes("mochi-turnin") ? "done" : s.done.includes("library") ? (s.done.includes("mochi-met") ? "return" : "find") : s.done.includes("mochi-met") ? "library" : "find";

export const soraStage = (s: Progress): QuestStage | "locked" =>
  !s.done.includes("mochi-turnin") ? "locked" : s.done.includes("sora-turnin") ? "done" : !s.done.includes("sora-met") ? "find" : s.done.includes("cafe") ? "return" : "library";

export function townQuestStage(s: Progress, id: TownFriend): "locked" | "find" | "activity" | "return" | "done" {
  if (!s.done.includes("sora-turnin")) return "locked";
  if (!s.done.includes(`${id}-met`)) return "find";
  if (!s.done.includes(TOWN_QUESTS[id].location)) return "activity";
  return s.done.includes(`${id}-turnin`) ? "done" : "return";
}

export function addAnimeCard(c: Omit<AnimeCard, "id" | "addedAt">): boolean {
  const title = c.title.trim().slice(0, 80);
  if (!title || c.rating < 1 || c.rating > 5) return false;
  update((s) => ({ anime: [{ id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, addedAt: Date.now(), title, rating: Math.round(c.rating), description: c.description.trim().slice(0, 240), rewatch: c.rewatch, character: c.character.trim().slice(0, 60) }, ...(s.anime ?? [])] }));
  return true;
}
export function removeAnimeCard(id: string) { update((s) => ({ anime: (s.anime ?? []).filter((a) => a.id !== id) })); }

export const ownsAvatarOption = (s: Progress, id: string) => { const opt = AVATAR_OPTIONS.find((x) => x.id === id); return !!opt && (opt.price === 0 || (s.wardrobe ?? []).includes(id)); };
/** Equip an owned (or free) avatar option. */
export function setAvatarPart(id: string): boolean {
  const opt = AVATAR_OPTIONS.find((x) => x.id === id);
  if (!opt || !ownsAvatarOption(state, id)) return false;
  update((s) => ({ avatar: { ...DEFAULT_AVATAR, ...s.avatar, [opt.slot]: id } }));
  return true;
}
/** Buy a paid avatar option with available XP and wear it straight away. */
export function buyAvatarItem(id: string): "bought" | "owned" | "insufficient" | "unknown" {
  load();
  const opt = AVATAR_OPTIONS.find((x) => x.id === id);
  if (!opt) return "unknown";
  if (ownsAvatarOption(state, id)) return "owned";
  if (availableXp(state) < opt.price) return "insufficient";
  update((s) => ({ spentXp: s.spentXp + opt.price, wardrobe: [...(s.wardrobe ?? []), id], avatar: { ...DEFAULT_AVATAR, ...s.avatar, [opt.slot]: id } }));
  return "bought";
}
