import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { ArrowUp, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import mochiImg from "@/assets/char-mochi.jpg";
import soraImg from "@/assets/char-sora.jpg";
import { CHAT } from "@/data/game";
import { supabase } from "@/integrations/supabase/client";
import { sendChat } from "@/lib/chat.functions";
import { useUser } from "@/lib/session";
import { rewardFirstChat, useProgress } from "@/lib/progress";
import { SHOP_ITEMS } from "@/data/shop";
import { ChatShop } from "@/components/game/ChatShop";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/chat")({
  head: () => ({ meta: [
    { title: "Chat with Mochi and Sora | AnimeAtlas" }, { name: "description", content: "Type anything and chat with AnimeAtlas's fictional AI characters about anime, trivia and recommendations." },
    { property: "og:title", content: "Character Chat | AnimeAtlas" }, { property: "og:description", content: "Real conversations with Mochi the librarian and Sora the barista." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: Chat,
});
const IMG = { mochi: mochiImg, sora: soraImg } as const;
type Who = "mochi" | "sora";
type Msg = { id: string; role: string; content: string; created_at: string };

function Chat() {
  const [who, setWho] = useState<Who>("mochi");
  const user = useUser();
  return (
    <div className="mx-auto grid max-w-5xl gap-4 pb-28 md:grid-cols-[240px_1fr]">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Character Chat</p>
        <h1 className="mb-3 font-display text-3xl font-bold">Talk with friends</h1>
        <div role="tablist" aria-label="Choose a friend" className="flex gap-2 md:flex-col">
          {(["mochi", "sora"] as const).map((k) => (
            <button key={k} role="tab" aria-selected={who === k} onClick={() => setWho(k)} className={`paper flex flex-1 items-center gap-3 rounded-2xl p-2 text-left transition ${who === k ? "ring-2 ring-primary" : "opacity-80 hover:opacity-100"}`}>
              <img src={IMG[k]} alt="" width={816} height={816} loading="lazy" className="h-12 w-12 rounded-full object-cover" />
              <span><span className="block font-display font-bold">{CHAT[k].name}</span><span className="text-xs text-muted-foreground">{CHAT[k].role}</span></span>
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">Mochi and Sora are fictional AI characters, not real people. Replies are AI-generated.</p>
        <div className="mt-4"><ChatShop /></div>
      </div>
      {user ? <Conversation key={`${user.id}:${who}`} who={who} uid={user.id} /> : (
        <section className="paper grid place-items-center rounded-3xl p-10 text-center">
          <div><img src={IMG[who]} alt="" width={816} height={816} className="mx-auto h-24 w-24 rounded-full object-cover" />
            <p className="mt-3 font-display text-xl font-bold">Sign in to chat with {CHAT[who].name}</p>
            <p className="text-sm text-muted-foreground">Your conversations are saved to your account.</p>
            <Link to="/auth" search={{ redirect: "/chat" }} className="btn-primary mt-4 inline-flex min-h-12 items-center">Sign in</Link></div>
        </section>
      )}
    </div>
  );
}

const time = (d: string) => new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

function Conversation({ who, uid }: { who: Who; uid: string }) {
  const qc = useQueryClient();
  const send = useServerFn(sendChat);
  const key = ["chat", uid, who];
  const hist = useQuery({ queryKey: key, queryFn: async () => {
    const r = await supabase.from("chat_messages").select("id, role, content, created_at").eq("user_id", uid).eq("character", who).order("created_at", { ascending: false }).limit(200);
    if (r.error) throw new Error(r.error.message); return [...r.data].reverse() as Msg[];
  } });
  const [text, setText] = useState(""); const [pending, setPending] = useState<string | null>(null); const [err, setErr] = useState("");
  const input = useRef<HTMLTextAreaElement>(null); const end = useRef<HTMLDivElement>(null);
  useEffect(() => { end.current?.scrollIntoView({ block: "end", behavior: "smooth" }); }, [hist.data, pending]);
  useEffect(() => { input.current?.focus(); }, [pending]);

  const go = async () => {
    const t = text.trim(); if (!t || pending) return;
    setText(""); setErr(""); setPending(t);
    try {
      const r = await send({ data: { character: who, text: t } });
      if (!r.ok) setErr(r.error);
      const earned = rewardFirstChat(who, r.ok);
      if (earned) toast.success(`+${earned} XP · First chat with ${CHAT[who].name}`);
    } catch { setErr("Couldn't send. Please try again."); setText((draft) => draft || t); }
    finally {
      try { await qc.invalidateQueries({ queryKey: key }); }
      finally { setPending(null); }
    }
  };
  const clear = async () => { if (!confirm(`Clear your chat with ${CHAT[who].name}?`)) return; await supabase.from("chat_messages").delete().eq("character", who); void qc.invalidateQueries({ queryKey: key }); };
  const msgs = hist.data ?? [];

  return (
    <section className="paper flex h-[min(70dvh,640px)] flex-col rounded-3xl" aria-label={`Conversation with ${CHAT[who].name}`}>
      <header className="flex items-center gap-3 border-b border-border p-3">
        <img src={IMG[who]} alt="" width={816} height={816} className="h-10 w-10 rounded-full object-cover" />
        <div className="flex-1"><p className="font-display font-bold">{CHAT[who].name}</p><p className="text-xs text-muted-foreground">{pending ? "typing…" : "Fictional AI character"}</p></div>
        {msgs.length > 0 && <Button type="button" variant="ghost" disabled={!!pending} onClick={clear} aria-label="Clear conversation" className="h-11 w-11 rounded-full text-muted-foreground hover:text-foreground"><Trash2 className="h-4 w-4" /></Button>}
      </header>
      <div className="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
        {hist.isLoading && <p className="text-center text-sm text-muted-foreground">Loading your conversation…</p>}
        {hist.error && <p role="alert" className="text-center text-sm text-destructive">Couldn't load history.</p>}
        {hist.data && msgs.length === 0 && !pending && <div className="grid place-items-center py-8"><img src={IMG[who]} alt={CHAT[who].name} className="h-20 w-20 rounded-full object-cover" /></div>}
        {msgs.map((m) => <Bubble key={m.id} m={m} who={who} />)}
        {pending && <>
          <Bubble m={{ id: "p", role: "user", content: pending, created_at: new Date().toISOString() }} who={who} />
          <div className="flex items-center gap-2"><img src={IMG[who]} alt="" className="h-8 w-8 rounded-full object-cover" /><span className="flex gap-1 rounded-2xl bg-muted px-4 py-3" aria-label={`${CHAT[who].name} is typing`}>{[0, 1, 2].map((i) => <span key={i} className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: `${i * 150}ms` }} />)}</span></div>
        </>}
        {err && <p role="alert" className="text-center text-sm font-semibold text-destructive">{err}</p>}
        <div ref={end} />
      </div>
      <form onSubmit={(e) => { e.preventDefault(); void go(); }} className="flex items-end gap-2 border-t border-border p-3">
        <label htmlFor="chat-input" className="sr-only">Message {CHAT[who].name}</label>
        <textarea id="chat-input" ref={input} rows={1} maxLength={1000} value={text} onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void go(); } }}
          placeholder={`Message ${CHAT[who].name}…`} className="max-h-32 min-h-12 flex-1 resize-none rounded-2xl border border-border bg-card px-4 py-3 focus:outline-none focus:ring-2 focus:ring-ring" />
        <Button type="submit" aria-label="Send" disabled={!text.trim() || !!pending} className="h-12 w-12 shrink-0 rounded-full disabled:opacity-40">
          {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowUp className="h-5 w-5" />}</Button>
      </form>
    </section>
  );
}

function Bubble({ m, who }: { m: Msg; who: Who }) {
  const me = m.role === "user";
  const p = useProgress();
  const pin = SHOP_ITEMS.find((item) => item.id === p.equippedItem);
  return (
    <div className={`animate-rise flex items-end gap-2 ${me ? "justify-end" : ""}`}>
      {!me && <img src={IMG[who]} alt="" className="h-8 w-8 rounded-full object-cover" />}
      <div className={`max-w-[80%] ${me ? "text-right" : ""}`}>
        {me && pin && <p className={`mb-1 text-xs font-semibold ${pin.tone}`}>{pin.title}</p>}
        <p className={`whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-left leading-relaxed ${me ? "bg-charcoal text-ivory" : "bg-muted"}`}>{m.content}</p>
        <time className="mt-0.5 block px-1 text-[11px] text-muted-foreground" dateTime={m.created_at}>{time(m.created_at)}</time>
      </div>
    </div>
  );
}
