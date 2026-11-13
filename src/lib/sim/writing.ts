// Varied, personality-driven text for simulated players. Content is grounded in each player's real saved progress.
import type { Persona } from "./personas";
import type { Progress } from "@/lib/progress";
import { COLLECTIBLES } from "@/data/game";
import { emptyMemory, planDialogue } from "./dialogue";

const pick = <T,>(r: () => number, xs: T[]) => xs[Math.floor(r() * xs.length)]!;
const cardName = (id: string) => COLLECTIBLES.find((c) => c.id === id)?.name ?? id;
function voice(p: Persona, s: string) {
  switch (p.voice) {
    case "bubbly": return s.replace(/\.$/, "!") + (s.length % 2 ? " So happy about this!" : "");
    case "chill": return s.toLowerCase().replace(/!/g, ".");
    case "terse": return s.split(". ")[0]!.replace(/!$/, ".");
    case "dry": return s.replace(/!/g, ".") + " Not bad, I suppose.";
    case "careful": return s + " Happy to explain how if anyone is stuck.";
    default: return s;
  }
}
export function posts(p: Persona, kind: "discovery" | "question" | "opinion" | "return", s: Progress, r: () => number) {
  const last = s.chars[s.chars.length - 1];
  const fandom = p.genres.includes("Mystery") ? "Mystery" : p.genres.includes("Sports") ? "Sports" : p.genres.includes("Art") ? "Art" : "Slice of Life";
  if (kind === "question") {
    const q = pick(r, [
      ["How do you unlock Sora?", "I helped Mochi at the fountain but Sora still says to help Mochi first. What am I missing?"],
      ["Where is the greenhouse?", "Someone mentioned Kaito but I keep walking in circles near the café."],
      ["Do missions reset at midnight?", "My daily mission progress disappeared. Is that normal or did I break something?"],
      [`Is ${p.favAnime} worth adding to my deck?`, "Trying to decide which cards to share for matching."],
    ]);
    return { fandom: "General", title: q[0]!, body: voice(p, q[1]!) };
  }
  if (kind === "return") return { fandom: "General", title: "Back after a break, what changed?", body: voice(p, `I was away for a couple of weeks. I have ${s.chars.length} cards so far. Did anything new open up in town?`) };
  if (kind === "opinion") {
    const o = pick(r, [
      [`${p.favChar} is the best character in town`, `Fight me on this. ${p.favChar} has the most thoughtful lines.`],
      ["Tetsu's quiz is too easy", "Five questions and I got them all first try. Wish there was a hard mode."],
      [`Anyone else rewatching ${p.favAnime}?`, `Third time through ${p.favAnime}. Still holds up.`],
    ]);
    return { fandom, title: o[0]!, body: voice(p, o[1]!) };
  }
  const t = last ? `Just unlocked ${cardName(last)}'s card` : `First day exploring Sakuragaoka`;
  const b = last ? `That makes ${s.chars.length} cards. Level climbing slowly, ${s.xp} XP now.` : `Walked around the fountain and met Mochi. The town is really pretty.`;
  return { fandom, title: t, body: voice(p, b) };
}
export function comment(p: Persona, title: string, s: Progress, r: () => number, context?: { parent?: string; previous?: string }) {
  if (context?.parent) {
    const quote = context.parent.slice(0, 140).replace(/\s+/g, " ");
    return voice(p, `On your point "${quote}": I read that through ${p.interest}. ${context.previous ? `Earlier I said "${context.previous.slice(0, 100)}"; I'm still weighing it against ` : "My hesitation is "}${p.concern}. What made that work for you?`);
  }
  if (context?.previous) return voice(p, `Following up on "${context.previous.slice(0, 120)}": my goal is to ${p.motivation.toLowerCase()}. Has anyone tried a different approach to "${title}"?`);
  if (/unlock Sora/i.test(title)) return voice(p, s.done.includes("mochi-turnin") ? "You have to go back to Mochi after the library shelves. The turn-in is what unlocks Sora." : "Same problem here, following this.");
  if (/greenhouse/i.test(title)) return voice(p, s.chars.includes("kaito") ? "It's north of the fountain, past the blossom trees. Kaito is standing just outside." : "No idea yet, haven't found it either.");
  if (/missions reset/i.test(title)) return voice(p, "Daily missions reset at midnight UTC, weekly ones on Monday. It caught me out too.");
  if (/too easy/i.test(title)) return pick(r, ["Disagree, question four got me twice.", "Agreed, a harder round would be nice.", "Easy for you maybe."]);
  if (/best character/i.test(title)) return pick(r, [`Respectfully, it's ${p.favChar}.`, "Hard agree.", "Mochi fans are going to be upset."]);
  if (/Back after a break/i.test(title)) return voice(p, s.chars.length > 4 ? "Ren and Hana opened up in the south part of town. Worth the walk." : "Welcome back! Not sure, I'm still early too.");
  if (/Just unlocked/i.test(title)) return voice(p, `That card fits my goal to ${p.motivation.toLowerCase()}. I have ${s.chars.length} cards so far. Was ${p.concern} an issue during that quest?`);
  return voice(p, `On "${title}", ${p.favAnime} made me appreciate ${p.interest}. I wonder how that fits your experience, especially around ${p.concern}.`);
}
/** Messages for the real AI chat. Later ones deliberately test whether the character remembers earlier turns. */
export function chatLine(p: Persona, n: number, s: Progress) {
  return planDialogue(p, s, 1, { ...emptyMemory(), turns: n }).text;
}
