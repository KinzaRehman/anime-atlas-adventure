import { describe, expect, it } from "vitest";
import { PERSONAS, currentPersona } from "@/lib/sim/personas";
import { emptyMemory, planDialogue, rememberDialogue } from "@/lib/sim/dialogue";
import { freshProgress } from "@/lib/sim/progress-sim";
import { comment } from "@/lib/sim/writing";

const player = PERSONAS[10];
if (!player) throw new Error("Missing Yui fixture");

describe("synthetic conversation identities", () => {
  it("gives all 30 players unique backstories, goals and styles", () => {
    for (const field of ["backstory", "motivation", "style", "interest", "concern"] as const) {
      expect(new Set(PERSONAS.map((p) => p[field])).size).toBe(30);
      expect(PERSONAS.every((p) => p[field].length > 15)).toBe(true);
    }
    expect(new Set(PERSONAS.map((p) => planDialogue(p, freshProgress(), 1, emptyMemory()).text)).size).toBe(30);
  });
  it("upgrades existing identities by stable handle", () => {
    expect(currentPersona({ ...player, backstory: "old" }).backstory).toBe(player.backstory);
  });
  it("answers the actual last question after memory is saved and reloaded", () => {
    const saved = rememberDialogue(emptyMemory(), "introduction", "Would you prefer creative teamwork or competition?", 1, 0);
    const restored = JSON.parse(JSON.stringify(saved));
    const next = planDialogue(player, freshProgress(), 2, restored);
    expect(next.branch).toBe("answer");
    expect(next.text).toContain("Would you prefer creative teamwork or competition?");
    expect(next.text).toContain(player.interest);
    expect(saved.turns).toBe(1);
  });
  it("branches on returning after a break", () => {
    const memory = rememberDialogue(emptyMemory(), "introduction", "Try a quieter story.", 1, 0);
    expect(planDialogue(player, freshProgress(), 9, memory).branch).toBe("return");
  });
  it("branches on new completed quests before reusing a topic", () => {
    const progress = { ...freshProgress(), chars: ["mochi"] };
    const memory = rememberDialogue(emptyMemory(), "introduction", "Try a quieter story.", 1, 0);
    expect(planDialogue(player, progress, 2, memory).branch).toBe("quest");
    expect(planDialogue(player, progress, 2, memory).text).toContain("Mochi");
  });
  it("moves past answered and reflected topics rather than repeating a greeting", () => {
    let memory = rememberDialogue(emptyMemory(), "introduction", "A quiet creative story could fit.", 1, 0);
    expect(planDialogue(player, freshProgress(), 2, memory).branch).toBe("reflection");
    memory = rememberDialogue(memory, "reflection", "Look for small creative goals.", 2, 0);
    expect(planDialogue(player, freshProgress(), 3, memory).branch).toBe("challenge");
    memory = rememberDialogue(memory, "challenge", "Try one short chapter.", 3, 0);
    expect(planDialogue(player, freshProgress(), 4, memory).branch).toBe("application");
  });
  it("grounds community replies in the parent and player's prior reply", () => {
    const result = comment(player, "Creative stories", freshProgress(), () => 0, { parent: "I like teamwork more than rivalry.", previous: "I prefer quiet stories." });
    expect(result).toContain("I like teamwork more than rivalry.");
    expect(result).toContain("I prefer quiet stories.");
    expect(result).toContain(player.interest);
  });
  it("does not advance memory merely by planning a turn", () => {
    const memory = emptyMemory();
    planDialogue(player, freshProgress(), 1, memory);
    expect(memory.turns).toBe(0);
    expect(memory.discussed).toEqual([]);
  });
});