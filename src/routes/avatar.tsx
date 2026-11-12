import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Lock, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AVATAR_OPTIONS, DEFAULT_AVATAR, SLOTS, avatarDataUrl, type AvatarSlot } from "@/data/avatar";
import { availableXp, buyAvatarItem, ownsAvatarOption, setAvatarPart, useProgress } from "@/lib/progress";

export const Route = createFileRoute("/avatar")({
  head: () => ({ meta: [
    { title: "Avatar Studio — AnimeAtlas" }, { name: "description", content: "Customise your explorer's style, hair, eyes, glasses, outfit, shoes and accessories, and buy new looks with XP." },
    { property: "og:title", content: "Avatar Studio — AnimeAtlas" }, { property: "og:description", content: "Design your explorer and shop for new looks with earned XP." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: AvatarStudio,
});

function AvatarStudio() {
  const p = useProgress();
  const avatar = { ...DEFAULT_AVATAR, ...p.avatar };
  const [tab, setTab] = useState<"style" | "shop">("style");
  const [slot, setSlot] = useState<AvatarSlot>("body");
  const [preview, setPreview] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const xp = availableXp(p);
  const shown = preview ? { ...avatar, [AVATAR_OPTIONS.find((x) => x.id === preview)!.slot]: preview } : avatar;
  const options = AVATAR_OPTIONS.filter((x) => (tab === "shop" ? x.price > 0 : true) && (tab === "shop" || x.slot === slot));

  return (
    <div>
      <h1 className="text-4xl font-black">Avatar studio</h1>
      <p className="text-muted-foreground">Design how you look in Sakuragaoka. Paid looks are bought with XP you earn from quests and chats.</p>
      <div className="mt-6 grid gap-6 md:grid-cols-[260px_1fr]">
        <div className="glass flex flex-col items-center rounded-3xl p-5 md:sticky md:top-24 md:self-start">
          <img src={avatarDataUrl(shown)} alt="Your explorer avatar" className="h-72 w-auto drop-shadow-lg" />
          {preview && <p className="mt-2 text-sm font-semibold text-primary">Previewing</p>}
          <div className="mt-3 flex w-full justify-between border-t border-border pt-3 text-sm"><span>Available XP</span><strong className="tabular-nums">{xp}</strong></div>
        </div>
        <div>
          <div className="flex gap-2">
            <Button variant={tab === "style" ? "default" : "outline"} onClick={() => { setTab("style"); setPreview(null); }}>Customise</Button>
            <Button variant={tab === "shop" ? "default" : "outline"} onClick={() => { setTab("shop"); setPreview(null); }}><ShoppingBag className="h-4 w-4" />Shop</Button>
          </div>
          {tab === "style" && <div className="mt-4 flex flex-wrap gap-2">{SLOTS.map((s) => (
            <Button key={s.slot} size="sm" variant={slot === s.slot ? "secondary" : "ghost"} onClick={() => setSlot(s.slot)}>{s.label}</Button>
          ))}</div>}
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {options.map((opt) => {
              const owned = ownsAvatarOption(p, opt.id), worn = avatar[opt.slot] === opt.id;
              return (
                <article key={opt.id} className={`rounded-2xl border bg-card p-3 ${worn ? "border-primary" : "border-border"}`} onMouseEnter={() => setPreview(opt.id)} onMouseLeave={() => setPreview(null)}>
                  <div className="flex items-center gap-2">
                    {opt.colors.length > 0 ? <span className="flex">{opt.colors.slice(0, 3).map((col) => <span key={col} className="-mr-1 h-5 w-5 rounded-full border border-border" style={{ background: col }} />)}</span> : null}
                    <h3 className="text-sm font-bold">{opt.name}</h3>
                  </div>
                  {tab === "shop" && <p className="mt-1 text-xs text-muted-foreground">{SLOTS.find((s) => s.slot === opt.slot)?.label}</p>}
                  <div className="mt-3 flex gap-2">
                    {worn ? <Button size="sm" variant="outline" disabled className="w-full"><Check className="h-4 w-4" />Wearing</Button>
                      : owned ? <Button size="sm" className="w-full" onClick={() => { setAvatarPart(opt.id); setMsg(`Now wearing ${opt.name}.`); }}>Wear</Button>
                      : <Button size="sm" className="w-full" disabled={xp < opt.price} aria-label={`Buy ${opt.name} for ${opt.price} XP`} onClick={() => {
                          const r = buyAvatarItem(opt.id); setMsg(r === "bought" ? `Purchased ${opt.name} — it's on!` : "Not enough XP yet.");
                        }}>{xp < opt.price && <Lock className="h-3.5 w-3.5" />}{opt.price} XP</Button>}
                    <Button size="sm" variant="ghost" className="md:hidden" onClick={() => setPreview(preview === opt.id ? null : opt.id)}>Try</Button>
                  </div>
                </article>
              );
            })}
          </div>
          <p role="status" className="mt-3 min-h-6 text-sm text-primary">{msg}</p>
          <p className="text-xs text-muted-foreground">Spending XP never lowers your level. Your look is saved on this device and shows in Explore.</p>
        </div>
      </div>
    </div>
  );
}
