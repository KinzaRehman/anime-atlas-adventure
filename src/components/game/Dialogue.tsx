import { useEffect, useState } from "react";
import { PORTRAITS } from "@/data/portraits";

// Visual-novel style character intro: portrait + paged lines.
export function Dialogue({ who, name, role, lines, onDone, cta = "Continue" }: { who: string; name: string; role: string; lines: string[]; onDone: () => void; cta?: string }) {
  const [i, setI] = useState(0);
  const last = i === lines.length - 1;
  const next = () => (last ? onDone() : setI(i + 1));
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === "Enter" || e.key === " " || e.key.toLowerCase() === "e") { e.preventDefault(); next(); } };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  });
  return (
    <div className="fixed inset-0 z-40 flex flex-col justify-end" role="dialog" aria-modal="true" aria-label={`Conversation with ${name}`}>
      <div className="animate-fade absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/30 to-transparent" onClick={next} />
      <img src={PORTRAITS[who]} alt={name} className="animate-rise pointer-events-none relative mx-auto -mb-6 h-[42dvh] max-h-96 w-auto rounded-[2rem] object-cover shadow-soft sm:ml-[12%]" />
      <div className="glass animate-sheet relative mx-auto mb-[max(1rem,env(safe-area-inset-bottom))] w-[calc(100%-1.5rem)] max-w-2xl rounded-3xl p-5">
        <p className="font-display text-lg font-bold text-sakura">{name} <span className="text-sm font-medium text-ivory/60">· {role}</span></p>
        <p key={i} aria-live="polite" className="animate-fade mt-1 min-h-14 text-lg leading-relaxed">{lines[i]}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-ivory/50">{i + 1} / {lines.length}</span>
          <button autoFocus onClick={next} className="min-h-11 rounded-full bg-ivory px-5 font-bold text-charcoal">{last ? cta : "Next"}</button>
        </div>
      </div>
    </div>
  );
}
