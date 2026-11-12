import { useEffect, useRef, useState } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { QuestQuestion } from "@/data/game";

export function QuestChallenge({ questions, onComplete }: { questions: QuestQuestion[]; onComplete: () => void }) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const question = questions[index];
  if (!question) return null;
  const correct = picked === question.c;
  const pick = (answer: number) => {
    if (correct) return;
    setPicked(answer);
    if (answer === question.c) timer.current = setTimeout(() => {
      if (index + 1 === questions.length) onComplete();
      else { setIndex(index + 1); setPicked(null); }
    }, 650);
  };
  return <div>
    <div className="mb-5 flex gap-2" aria-label={`Card ${index + 1} of ${questions.length}`}>
      {questions.map((_, i) => <span key={i} className={`h-1.5 flex-1 rounded-full ${i < index || (i === index && correct) ? "bg-matcha" : i === index ? "bg-primary" : "bg-muted"}`} />)}
    </div>
    <h3 className="font-display text-xl font-bold">{question.q}</h3>
    <div className="mt-5 grid gap-3">
      {question.a.map((answer, i) => <Button key={answer} variant="outline" disabled={correct} onClick={() => pick(i)} className={`h-auto min-h-14 justify-between whitespace-normal px-4 py-3 text-left leading-relaxed ${picked === i ? correct ? "border-matcha bg-matcha/20" : "border-destructive bg-destructive/10" : "bg-card"}`}>
        {answer}{picked === i && (correct ? <Check /> : <X />)}
      </Button>)}
    </div>
    <p role="status" className="mt-4 min-h-6 text-sm font-semibold text-primary">{correct ? "That's it!" : picked !== null ? "Not quite — try another answer." : `Card ${index + 1} of ${questions.length}`}</p>
  </div>;
}