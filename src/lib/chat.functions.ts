import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export { cleanReply } from "./chat-core";

export const sendChat = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { character: "mochi" | "sora"; text: string }) => {
    if (d?.character !== "mochi" && d?.character !== "sora") throw new Error("Unknown character");
    const text = String(d.text ?? "").trim().slice(0, 1000);
    if (!text) throw new Error("Message is empty");
    return { character: d.character, text };
  })
  .handler(async ({ data, context }) => {
    const { chatTurn } = await import("./chat-core");
    return chatTurn(context.supabase, context.userId, data.character, data.text);
  });
