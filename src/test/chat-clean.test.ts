import { describe, expect, it } from "vitest";
import { cleanReply } from "@/lib/chat.functions";
describe("cleanReply", () => {
  it("removes markdown asterisks from character replies", () => {
    expect(cleanReply("Try **Ao Ashi** and *Haikyu!!* next.")).toBe("Try Ao Ashi and Haikyu!! next.");
    expect(cleanReply("- one\n- two")).toBe("one\ntwo");
  });
});
