// Shared chat turn used by the Chat page and the admin simulation, so both run the same AI and saving logic.
import type { SupabaseClient } from "@supabase/supabase-js";
export type ChatCharacter = "mochi" | "sora";
const BASE = `You are a fictional AI character in AnimeAtlas, a cozy, family-friendly anime exploration game set in the town of Sakuragaoka. Always stay in character, but if asked, say honestly that you are a fictional AI character, not a real person.
Talk about anime, manga, storytelling, recommendations, trivia, hobbies, creativity and exploring the town. Respond directly to the player's latest message using the conversation history. Remember their stated preferences and follow-up context; do not repeat a stock greeting or reuse generic answers. Ask a relevant follow-up only when useful. Keep replies warm and short (1-4 sentences), conversational, and never use emoji. Write plain text only: no markdown, asterisks or bullet lists.
Boundaries: no romance or flirting (gently redirect to friendship), no sexual or violent detail, no magic/spellcasting, fortune-telling, astrology or gambling topics. Avoid spoilers unless the player explicitly asks, and warn first. Never ask for personal information or real-world location.`;
export const PERSONAS: Record<"mochi" | "sora", string> = {
  mochi: "You are Mochi, the cheerful librarian of the Sakuragaoka Manga Library. Pink hair, round glasses, endlessly curious. You love sorting shelves by genre, recommending manga, and asking players what stories make them happy.",
  sora: "You are Sora, the barista at Yasuragi Café. Lavender bob, calm and witty. You host quiz nights, know every anime opening theme, love melon bread, and enjoy sharing fun anime trivia and friendly quiz questions.",
};

// Strip markdown the model may still emit so bubbles show clean text.
export function cleanReply(t: string) {
  return t.replace(/\*\*(.+?)\*\*/g, "$1").replace(/__(.+?)__/g, "$1").replace(/(^|[\s(])[*_]([^*_\n]+)[*_](?=[\s).,!?:;]|$)/g, "$1$2")
    .replace(/^#{1,6}\s+/gm, "").replace(/^\s*[-*•]\s+/gm, "").replace(/`+/g, "").replace(/\*/g, "").replace(/\n{3,}/g, "\n\n").trim();
}


export async function chatTurn(supabase: SupabaseClient, userId: string, character: ChatCharacter, text: string, at?: string, simulationContext?: string) {
  const data = { character, text };
  const stamp = at ? { created_at: at } : {};
  const hist = await supabase.from("chat_messages").select("role, content").eq("user_id", userId).eq("character", data.character).order("created_at", { ascending: false }).limit(20);
  if (hist.error) throw new Error("Couldn't load your chat history.");
  const ins = await supabase.from("chat_messages").insert({ user_id: userId, character: data.character, role: "user", content: data.text, ...stamp });
  if (ins.error) throw new Error("Couldn't save your message.");

  const { generateResponse, GatewayError } = await import("@lovable.dev/ai-gateway");
  const input: { role: "user" | "assistant"; content: string }[] = [...hist.data].reverse().flatMap((m): { role: "user" | "assistant"; content: string }[] => {
    if (m.role !== "user" && m.role !== "assistant") return [];
    return [{ role: m.role, content: m.content }];
  });
  input.push({ role: "user", content: data.text });
  let reply = "";
  try {
    const res = await generateResponse({ model: "openai/gpt-6-astra", instructions: `${BASE}\n\n${PERSONAS[data.character]}${simulationContext ? `\n\n${simulationContext}` : ""}`, input });
    reply = res.output.flatMap((o) => (o.type === "message" ? o.content : [])).map((c) => (c.type === "output_text" ? c.text : "")).join("");
    reply = cleanReply(reply);
  } catch (e) {
    console.error("sendChat", e);
    if (e instanceof GatewayError && e.httpStatus === 429) return { ok: false as const, error: "Lots of visitors right now. Please try again in a minute." };
    if (e instanceof GatewayError && e.httpStatus === 402) return { ok: false as const, error: "Chats are paused because AI credits ran out." };
    return { ok: false as const, error: "The reply didn't come through. Please try again." };
  }
  if (!reply) return { ok: false as const, error: "No reply this time. Please try again." };
  const saved = await supabase.from("chat_messages").insert({ user_id: userId, character: data.character, role: "assistant", content: reply.slice(0, 4000), ...(at ? { created_at: new Date(new Date(at).getTime() + 20000).toISOString() } : {}) }).select("id, role, content, created_at").single();
  if (saved.error) throw new Error("Couldn't save the reply.");
  return { ok: true as const, message: saved.data };
  }
