import { useState } from "react";
import { Check, X } from "lucide-react";
import { CAFE_QUIZ } from "@/data/game";

// Sora's quiz: every answer must be right to finish; wrong answers just retry.
export function CafeQuiz({ onComplete }: { onComplete: () => void }) {
  const [i, setI] = useState(0);
  const [wrong, setWrong] = useState<number | null>(null);
  const [right, setRight] = useState<number | null>(null);
  const q = CAFE_QUIZ[i]!;
  const pick = (k: number) => {
    if (right !== null) return;
    if (k !== q.c) return setWrong(k);
    setWrong(null); setRight(k);
    setTimeout(() => { if (i + 1 === CAFE_QUIZ.length) onComplete(); else { setI(i + 1); setRight(null); } }, 650);
  };
  return (
    <div>
      <div className="mb-4 flex gap-1.5" aria-label={`Question ${i + 1} of ${CAFE_QUIZ.length}`}>
        {CAFE_QUIZ.map((_, k) => <span key={k} className={`h-1.5 flex-1 rounded-full ${k < i || (k === i && right !== null) ? "bg-matcha" : k === i ? "bg-primary" : "bg-muted"}`} />)}
      </div>
      <p key={i} className="animate-fade font-display text-xl font-bold">{q.q}</p>
      <div className="mt-4 space-y-2">
        {q.a.map((a, k) => (
          <button key={a} onClick={() => pick(k)}
            className={`flex min-h-12 w-full items-center justify-between rounded-xl border px-4 text-left font-semibold transition ${right === k ? "border-matcha bg-matcha/25" : wrong === k ? "border-destructive bg-destructive/10" : "border-border bg-card hover:-translate-y-0.5 hover:shadow-soft"}`}>
            {a}{right === k ? <Check className="h-4 w-4" /> : wrong === k ? <X className="h-4 w-4" /> : null}
          </button>
        ))}
      </div>
      <p role="status" className="mt-4 text-sm font-semibold text-primary">{right !== null ? "Correct!" : wrong !== null ? "Not quite. Have another go!" : `Question ${i + 1} of ${CAFE_QUIZ.length}`}</p>
    </div>
  );
}
