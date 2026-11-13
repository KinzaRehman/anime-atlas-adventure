import { useState } from "react";
import { Star, Trash2, Plus, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { addAnimeCard, removeAnimeCard, useProgress } from "@/lib/progress";

function Stars({ value, onChange }: { value: number; onChange?: (n: number) => void }) {
  return (
    <div className="flex gap-0.5" role={onChange ? "radiogroup" : undefined} aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const icon = <Star className={`h-5 w-5 ${n <= value ? "fill-primary text-primary" : "text-muted-foreground"}`} />;
        return onChange ? (
          <button key={n} type="button" role="radio" aria-checked={n === value} aria-label={`${n} star${n > 1 ? "s" : ""}`} onClick={() => onChange(n)}>{icon}</button>
        ) : <span key={n}>{icon}</span>;
      })}
    </div>
  );
}

export function AnimeCards() {
  const p = useProgress();
  const cards = p.anime ?? [];
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ title: "", rating: 0, description: "", rewatch: true, character: "" });
  const [err, setErr] = useState("");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.title.trim()) return setErr("Add the anime name.");
    if (!f.rating) return setErr("Pick a star rating.");
    addAnimeCard(f);
    setF({ title: "", rating: 0, description: "", rewatch: true, character: "" }); setErr(""); setOpen(false);
  };
  return (
    <section className="mt-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-3xl font-black">Device-only shelf</h2>
          <p className="text-muted-foreground">{cards.length} completed anime saved on this device. These cards are private and separate from your account deck.</p>
        </div>
        <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Add anime</Button>
      </div>
      {cards.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-dashed p-6 text-center text-muted-foreground">No anime cards yet — add the first series you've completed.</p>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((a) => (
            <article key={a.id} className="rounded-2xl border bg-card p-4 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-lg font-bold leading-tight">{a.title}</h3>
                <Button variant="ghost" size="icon" aria-label={`Remove ${a.title}`} onClick={() => removeAnimeCard(a.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
              <Stars value={a.rating} />
              {a.description && <p className="mt-2 text-sm">{a.description}</p>}
              <dl className="mt-3 space-y-1 text-sm">
                <div className="flex gap-1"><dt className="text-muted-foreground">Would rewatch:</dt><dd className="font-semibold">{a.rewatch ? "Yes" : "No"}</dd></div>
                {a.character && <div className="flex gap-1"><dt className="text-muted-foreground">I'd be:</dt><dd className="font-semibold">{a.character}</dd></div>}
              </dl>
            </article>
          ))}
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add a completed anime</DialogTitle></DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <label className="block text-sm font-semibold">Anime name<Input className="mt-1" maxLength={80} value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></label>
            <div className="text-sm font-semibold">Your rating<div className="mt-1"><Stars value={f.rating} onChange={(rating) => setF({ ...f, rating })} /></div></div>
            <label className="block text-sm font-semibold">Quick description<Textarea className="mt-1" maxLength={240} rows={3} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></label>
            <div className="text-sm font-semibold">Would you watch it again?
              <div className="mt-1 flex gap-2">
                <Button type="button" variant={f.rewatch ? "default" : "outline"} onClick={() => setF({ ...f, rewatch: true })}><RotateCcw className="h-4 w-4" /> Yes</Button>
                <Button type="button" variant={!f.rewatch ? "default" : "outline"} onClick={() => setF({ ...f, rewatch: false })}>No</Button>
              </div>
            </div>
            <label className="block text-sm font-semibold">Which character would you be?<Input className="mt-1" maxLength={60} value={f.character} onChange={(e) => setF({ ...f, character: e.target.value })} /></label>
            {err && <p className="text-sm text-destructive">{err}</p>}
            <Button type="submit" className="w-full">Save card</Button>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
