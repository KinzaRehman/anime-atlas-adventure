import type { Persona } from "./personas";
import type { Progress } from "@/lib/progress";
import { COLLECTIBLES } from "@/data/game";

export interface DialogueMemory {
  turns: number;
  lastDay: number;
  lastCards: number;
  lastBranch: string;
  lastReply: string;
  discussed: string[];
}
export const emptyMemory = (): DialogueMemory => ({ turns: 0, lastDay: 0, lastCards: 0, lastBranch: "", lastReply: "", discussed: [] });

/** Branch from successful saved exchanges, never from fabricated assistant replies. */
export function planDialogue(p: Persona, s: Progress, day: number, memory: DialogueMemory) {
  let branch: string;
  let subject: string;
  if (!memory.turns) {
    branch = "introduction";
    subject = `I finished ${p.favAnime}. What stayed with me was ${p.interest}. I'd like a spoiler-free suggestion, rather than just another popular title.`;
  } else if (day - memory.lastDay >= 7 && memory.lastBranch !== "return") {
    branch = "return";
    subject = `I've been away for ${day - memory.lastDay} days. We talked about ${p.favAnime} and ${p.interest}. Can we pick that discussion up rather than start over?`;
  } else if (s.chars.length > memory.lastCards) {
    branch = "quest";
    const card = COLLECTIBLES.find((c) => c.id === s.chars.at(-1))?.name ?? "a town friend";
    subject = `Since our last conversation I earned ${card}'s card. My goal is to ${p.motivation.toLowerCase()}. How would you connect that experience to the stories we discussed?`;
  } else if (memory.lastReply.includes("?") && memory.lastBranch !== "answer") {
    branch = "answer";
    const question = memory.lastReply.match(/[^.!?]*\?/g)?.at(-1)?.trim() ?? "your last question";
    subject = `You asked: "${question.slice(0, 260)}" My answer is that I care most about ${p.interest}; I'm less keen on ${p.concern}. How does that change your suggestion?`;
  } else if (!memory.discussed.includes("reflection")) {
    branch = "reflection";
    subject = `Thinking about your earlier advice${memory.lastReply ? ` ("${memory.lastReply.slice(0, 160)}")` : ""}, I want to explore ${p.interest} more. How does that compare with ${p.favAnime}, without spoilers?`;
  } else {
    branch = memory.lastBranch === "challenge" ? "application" : "challenge";
    subject = branch === "challenge"
      ? `A concern I haven't resolved is ${p.concern}. Given what I've already told you about ${p.favAnime}, why would your advice still fit me?`
      : `Let's make your last advice practical. I currently have ${s.chars.length} town cards. What's one small next step toward my goal: ${p.motivation.toLowerCase()}?`;
  }
  const opening = memory.turns ? "" : `${p.backstory} `;
  const text = p.voice === "terse" ? subject : p.voice === "chill" ? (opening + subject).toLowerCase() : opening + subject;
  return { branch, text, context: `Synthetic test player: ${p.name}. Backstory: ${p.backstory} Goal: ${p.motivation}. Speaking style: ${p.style}. Interests: ${p.interest}. Concern: ${p.concern}. Successful past exchanges: ${memory.turns}. Last discussion: ${memory.lastBranch || "none"}. Respond as the town character, not as this player. Use actual history; never invent a previous interaction or claim a suggestion was watched.` };
}

export function rememberDialogue(memory: DialogueMemory, branch: string, reply: string, day: number, cards: number): DialogueMemory {
  return { turns: memory.turns + 1, lastDay: day, lastCards: cards, lastBranch: branch, lastReply: reply.slice(0, 4000), discussed: [...new Set([...memory.discussed, branch])] };
}