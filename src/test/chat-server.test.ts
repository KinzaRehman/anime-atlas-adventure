import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ generate: vi.fn() }));
vi.mock("@lovable.dev/ai-gateway", () => ({
  generateResponse: mocks.generate,
  GatewayError: class extends Error {},
}));
vi.mock("@/integrations/supabase/auth-middleware", () => ({ requireSupabaseAuth: {} }));
vi.mock("@tanstack/react-start", () => ({
  createServerFn: () => {
    const builder = {
      middleware: () => builder,
      inputValidator: () => builder,
      handler: (handler: unknown) => handler,
    };
    return builder;
  },
}));

import { sendChat } from "@/lib/chat.functions";

function conversation() {
  const rows = [
    { role: "assistant", content: "What kind of stories do you enjoy?" },
    { role: "user", content: "I enjoy sports teams and friendship." },
  ];
  const eq = vi.fn().mockReturnThis();
  const history = { eq, order: vi.fn().mockReturnThis(), limit: vi.fn().mockResolvedValue({ data: rows, error: null }) };
  const saved = { id: "reply-id", role: "assistant", content: "Try **Haikyu!!** for the team friendships.", created_at: "2026-11-12T19:37:00Z" };
  const insert = vi.fn().mockImplementation((row) => ({
    error: null,
    select: () => ({ single: async () => ({ data: { ...saved, content: row.content }, error: null }) }),
  }));
  const supabase = { from: vi.fn(() => ({ select: () => history, insert })) };
  return { supabase, eq, insert };
}

describe("server-generated character chat", () => {
  beforeEach(() => { mocks.generate.mockReset(); });

  it.each(["mochi", "sora"] as const)("generates %s's reply with their own history and saves the model output", async (character) => {
    const db = conversation();
    mocks.generate.mockResolvedValue({ output: [{ type: "message", content: [{ type: "output_text", text: "Try **Haikyu!!** for the team friendships." }] }] });
    // Invoke the handler captured above, without making an inference or using a real session.
    const handler = sendChat as unknown as (args: { data: { character: string; text: string }; context: { supabase: typeof db.supabase; userId: string } }) => Promise<{ ok: boolean; message?: { content: string } }>;
    const result = await handler({ data: { character, text: "Recommend something fitting those interests." }, context: { supabase: db.supabase, userId: "player-id" } });
    expect(db.eq).toHaveBeenCalledWith("user_id", "player-id");
    expect(db.eq).toHaveBeenCalledWith("character", character);
    expect(mocks.generate).toHaveBeenCalledTimes(1);
    expect(mocks.generate).toHaveBeenCalledWith({
      model: "openai/gpt-6-astra",
      instructions: expect.stringContaining(character === "mochi" ? "You are Mochi" : "You are Sora"),
      input: [
        { role: "user", content: "I enjoy sports teams and friendship." },
        { role: "assistant", content: "What kind of stories do you enjoy?" },
        { role: "user", content: "Recommend something fitting those interests." },
      ],
    });
    expect(db.insert).toHaveBeenLastCalledWith({ user_id: "player-id", character, role: "assistant", content: "Try Haikyu!! for the team friendships." });
    expect(result.message?.content).toBe("Try Haikyu!! for the team friendships.");
    expect(result.ok).toBe(true);
  });

  it("never saves a canned assistant reply when generation fails", async () => {
    const db = conversation();
    mocks.generate.mockRejectedValue(new Error("Service unavailable"));
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const handler = sendChat as unknown as (args: { data: { character: string; text: string }; context: { supabase: typeof db.supabase; userId: string } }) => Promise<{ ok: boolean }>;
    const result = await handler({ data: { character: "mochi", text: "What should I watch?" }, context: { supabase: db.supabase, userId: "player-id" } });
    expect(result.ok).toBe(false);
    expect(db.insert).toHaveBeenCalledTimes(1);
    expect(db.insert).toHaveBeenCalledWith(expect.objectContaining({ role: "user" }));
    log.mockRestore();
  });
});