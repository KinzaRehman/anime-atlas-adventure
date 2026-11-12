import { useMemo } from "react";
import { Sparkles } from "lucide-react";
import type { Character } from "@/data/game";
import { PORTRAITS } from "@/data/portraits";

export function UnlockSequence({ c, onClose }: { c: Character; onClose: () => void }) {
  const bits = useMemo(() => Array.from({ length: 28 }, (_, i) => { const a = (i / 28) * Math.PI * 2; const r = 140 + (i % 4) * 40; return { dx: Math.cos(a) * r, dy: Math.sin(a) * r, d: (i % 5) * 0.05 }; }), []);
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-charcoal/85 p-6" role="dialog" aria-modal="true" aria-label={`${c.name} joined your collection`}>
      <div className="relative" style={{ perspective: 900 }}>
        {bits.map((b, i) => <span key={i} aria-hidden className="animate-burst absolute left-1/2 top-1/2 h-2.5 w-3.5 rounded-full bg-sakura" style={{ "--dx": `${b.dx}px`, "--dy": `${b.dy}px`, animationDelay: `${0.5 + b.d}s` } as React.CSSProperties} />)}
        <div className="animate-reveal relative w-64 overflow-hidden rounded-3xl bg-ivory p-2 shadow-soft ring-2 ring-gold sm:w-72">
          <img src={PORTRAITS[c.id]} alt="" className="aspect-[4/5] w-full rounded-2xl object-cover" />
          <span aria-hidden className="animate-shine pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-ivory/70 to-transparent" />
          <div className="px-2 pb-2 pt-3 text-charcoal">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">{c.rarity} · No. 001</p>
            <p className="font-display text-2xl font-bold">{c.name}</p>
            <p className="text-sm text-muted-foreground">{c.title}</p>
          </div>
        </div>
      </div>
      <div className="animate-rise mt-8 text-center text-ivory" style={{ animationDelay: "1s" }}>
        <p className="flex items-center justify-center gap-2 font-display text-xl font-bold"><Sparkles className="h-5 w-5 text-gold" /> {c.name} joined your collection</p>
        <p className="mt-1 text-sm text-ivory/70">+80 XP · Badge: New Friend</p>
        <button autoFocus onClick={onClose} className="mt-5 min-h-12 rounded-full bg-ivory px-6 font-bold text-charcoal">Back to town</button>
      </div>
    </div>
  );
}
