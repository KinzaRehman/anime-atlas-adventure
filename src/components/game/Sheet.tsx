import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

export function Sheet({ title, kicker, onClose, children }: { title: string; kicker?: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.focus();
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label={title}>
      <div className="animate-fade absolute inset-0 bg-charcoal/40" onClick={onClose} />
      <div ref={ref} tabIndex={-1} className="paper animate-sheet relative max-h-[85dvh] w-full overflow-y-auto rounded-t-3xl p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] outline-none sm:max-w-lg sm:rounded-3xl">
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border sm:hidden" aria-hidden />
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>{kicker && <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{kicker}</p>}<h2 className="text-2xl font-bold">{title}</h2></div>
          <button onClick={onClose} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-muted hover:bg-border" aria-label="Close"><X className="h-5 w-5" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
