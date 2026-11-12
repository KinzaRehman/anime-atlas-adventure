import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import mochiImg from "@/assets/char-mochi.jpg";
import soraImg from "@/assets/char-sora.jpg";
import { CHAT } from "@/data/game";
import { addXp, useProgress } from "@/lib/progress";

export const Route = createFileRoute("/chat")({
  head: () => ({ meta: [
    { title: "Character Café Chat — AnimeAtlas" }, { name: "description", content: "Friendly branching chats with Mochi and Sora about anime, trivia and recommendations." },
    { property: "og:title", content: "Character Café Chat — AnimeAtlas" }, { property: "og:description", content: "Chat with café friends Mochi and Sora." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: Chat,
});
const IMG = { mochi: mochiImg, sora: soraImg } as const;

function Chat() {
  const [who, setWho] = useState<"mochi" | "sora">("mochi");
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Character Café</h1>
      <div role="tablist" aria-label="Choose a friend" className="flex gap-3">
        {(["mochi", "sora"] as const).map((k) => (
          <button key={k} role="tab" aria-selected={who === k} onClick={() => setWho(k)} className={`card-game flex flex-1 items-center gap-3 p-2 ${who === k ? "bg-pink-soft" : ""}`}>
            <img src={IMG[k]} alt="" width={816} height={816} loading="lazy" className="h-14 w-14 rounded-full object-cover" />
            <span className="text-left"><span className="block font-display text-lg font-bold">{CHAT[k].name}</span><span className="text-sm text-muted-foreground">{CHAT[k].role}</span></span>
          </button>
        ))}
      </div>
      <Conversation key={who} who={who} />
    </div>
  );
}

function Conversation({ who }: { who: "mochi" | "sora" }) {
  const p = useProgress();
  const c = CHAT[who];
  const [log, setLog] = useState<{ from: "them" | "me"; text: string }[]>([{ from: "them", text: c.nodes.start.text }]);
  const [node, setNode] = useState("start");
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => { end.current?.scrollIntoView({ block: "nearest" }); }, [log]);
  const choose = (o: { label: string; next: string }) => {
    setLog((l) => [...l, { from: "me", text: o.label }, { from: "them", text: c.nodes[o.next].text }]);
    setNode(o.next);
    if (!p.chatted.includes(who)) addXp(25, (s) => ({ chatted: [...s.chatted, who] }));
  };
  return (
    <section className="card-game p-4" aria-label={`Conversation with ${c.name}`}>
      <div className="max-h-[50vh] space-y-2 overflow-y-auto" aria-live="polite">
        {log.map((m, i) => (
          <div key={i} className={`flex items-end gap-2 animate-rise ${m.from === "me" ? "justify-end" : ""}`}>
            {m.from === "them" && <img src={IMG[who]} alt="" width={816} height={816} loading="lazy" className="h-9 w-9 rounded-full object-cover" />}
            <p className={`max-w-[80%] rounded-3xl px-4 py-2 font-semibold ${m.from === "me" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>{m.text}</p>
          </div>
        ))}
        <div ref={end} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {c.nodes[node].options.map((o) => <button key={o.label} className="btn-soft" onClick={() => choose(o)}>{o.label}</button>)}
      </div>
    </section>
  );
}
