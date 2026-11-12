import { TOWN_FRIENDS, type TownFriend } from "@/data/game";
import { questStage, soraStage, townQuestStage, type Progress } from "@/lib/progress";

export type MapQuestStage = "locked" | "find" | "activity" | "return" | "done";
export function mapQuestStage(progress: Progress, character: string): MapQuestStage {
  if (character === "mochi" || character === "sora") {
    const stage = character === "mochi" ? questStage(progress) : soraStage(progress);
    return stage === "library" ? "activity" : stage;
  }
  if (TOWN_FRIENDS.includes(character as TownFriend)) return townQuestStage(progress, character as TownFriend);
  return "locked";
}