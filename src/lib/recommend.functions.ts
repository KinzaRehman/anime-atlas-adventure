import { createServerFn } from "@tanstack/react-start";

export type Rec = { title: string; why: string; vibe: string; watch?: string[] };
const SYSTEM = `You are the Manga Library recommender in AnimeAtlas, a family-friendly anime app.
Recommend 4 real, existing anime series that fit the player's description.
Rules: strictly spoiler-free (no plot twists, deaths, endings or late reveals; describe only the premise and feel).
Keep picks family-friendly: avoid series centred on magic/spellcasting, fortune-telling, astrology, gambling, romance-focused plots, or sexual content.
Never recommend something the player said they already watched.
Understand free-form descriptions: favourite titles, moods, genres, characters, or themes.
For each pick list 1-4 legal official streaming services where it is commonly available (e.g. Crunchyroll, Netflix, Hulu, Disney+, Amazon Prime Video, HIDIVE, official YouTube channels). Only legal services, never piracy sites.
Reply ONLY with JSON: {"recs":[{"title":"...","why":"one or two sentences linking it to what they enjoy","vibe":"2-4 word mood","watch":["Crunchyroll"]}]}`;

export const recommendAnime = createServerFn({ method: "POST" })
  .inputValidator((d: { likes: string }) => {
    const likes = String(d?.likes ?? "").trim().slice(0, 600);
    if (likes.length < 3) throw new Error("Tell us a little about what you enjoy.");
    return { likes };
  })
  .handler(async ({ data }): Promise<{ recs: Rec[]; error?: string }> => {
    const { generateResponse, GatewayError } = await import("@lovable.dev/ai-gateway");
    try {
      const res = await generateResponse({ model: "openai/gpt-6-astra", instructions: SYSTEM, input: data.likes });
      const text = res.output.flatMap((o) => (o.type === "message" ? o.content : [])).map((c) => (c.type === "output_text" ? c.text : "")).join("");
      const json = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1)) as { recs?: Rec[] };
      const recs = (json.recs ?? []).filter((r) => r?.title && r?.why).slice(0, 5).map((r) => ({ ...r, watch: Array.isArray(r.watch) ? r.watch.filter((w) => typeof w === "string").slice(0, 4) : [] }));
      return recs.length ? { recs } : { recs: [], error: "Mochi couldn't find a match. Try describing it differently." };
    } catch (e) {
      console.error("recommendAnime", e);
      if (e instanceof GatewayError && e.httpStatus === 429) return { recs: [], error: "Lots of readers right now. Please try again in a minute." };
      if (e instanceof GatewayError && e.httpStatus === 402) return { recs: [], error: "Recommendations are paused (AI credits ran out)." };
      return { recs: [], error: "Something went wrong fetching picks. Please try again." };
    }
  });
