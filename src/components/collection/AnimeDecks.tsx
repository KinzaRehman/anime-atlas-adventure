import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, MessageCircle, Plus, Search, Star, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ANIME_CATALOGUE, ANIME_GENRES, filterAnime } from "@/data/anime-catalogue";
import { listDeck, removeDeckCard, saveDeckCard, sharedPlayers, type CardDraft, type DeckCard } from "@/lib/anime-decks";
import { useUser } from "@/lib/session";

const blank: CardDraft = { title: "", rating: 0, description: "", character: "", rewatch: true, shared: false };
export function AnimeDecks() {
  const user = useUser(); const qc = useQueryClient();
  const [tab, setTab] = useState<"catalogue" | "deck" | "players">("catalogue");
  const [query, setQuery] = useState(""); const [genre, setGenre] = useState("All");
  const [form, setForm] = useState<CardDraft | null>(null);
  const [selected, setSelected] = useState("All");
  const deck = useQuery({ queryKey: ["anime-deck", user?.id], queryFn: () => user ? listDeck(user.id) : Promise.resolve([]), enabled: !!user });
  const keys = (deck.data ?? []).filter((a) => selected === "All" || a.anime_key === selected).map((a) => a.anime_key);
  const players = useQuery({ queryKey: ["anime-players", user?.id, keys], queryFn: () => user ? sharedPlayers(user.id, keys) : Promise.resolve([]), enabled: !!user && tab === "players" });
  const refresh = async () => { await qc.invalidateQueries({ queryKey: ["anime-deck"] }); await qc.invalidateQueries({ queryKey: ["anime-players"] }); };
  const save = useMutation({ mutationFn: async () => { if (!user || !form) throw new Error("Sign in to save your deck."); await saveDeckCard(user.id, form); }, onSuccess: async () => { await refresh(); setForm(null); } });
  const remove = useMutation({ mutationFn: removeDeckCard, onSuccess: refresh });
  const edit = (card: DeckCard) => { save.reset(); setForm({ title: card.title, rating: card.rating, description: card.description, rewatch: card.rewatch, character: card.character_name, shared: card.shared }); };
  const available = filterAnime(query, genre);
  return <section className="mt-12 border-t border-border pt-8">
    <header className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-3xl font-bold">Anime deck</h2><p className="mt-1 text-muted-foreground">{ANIME_CATALOGUE.length} curated titles · {(deck.data ?? []).length} in your deck</p></div>
      {user ? <Button onClick={() => { save.reset(); setForm({ ...blank }); }}><Plus className="h-4 w-4" />Custom card</Button> : <Button asChild><Link to="/auth" search={{ redirect: "/collection" }}>Sign in to save your deck</Link></Button>}
    </header>
    <div className="mt-5 flex flex-wrap gap-2" role="tablist" aria-label="Anime deck views">{[["catalogue", "Catalogue"], ["deck", "My deck"], ["players", "Shared interests"]].map(([value, label]) => <Button key={value} role="tab" aria-selected={tab === value} variant={tab === value ? "default" : "outline"} onClick={() => setTab(value as typeof tab)}>{label}</Button>)}</div>
    {tab === "catalogue" && <>
      <div className="mt-5 flex flex-wrap gap-3"><label className="relative min-w-0 flex-1"><span className="sr-only">Search anime</span><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input className="pl-9" placeholder="Search anime" value={query} onChange={(e) => setQuery(e.target.value)} /></label><select aria-label="Anime genre" className="rounded-md border border-input bg-background px-3" value={genre} onChange={(e) => setGenre(e.target.value)}>{["All", ...ANIME_GENRES].map((g) => <option key={g}>{g}</option>)}</select></div>
      <p className="mt-3 text-xs text-muted-foreground">Curated, not a live top-100 ranking. Seasons and films have separate cards. Check age guidance before watching.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{available.map((anime) => {
        const owned = deck.data?.find((a) => a.anime_key === anime.key);
        return <article key={anime.key} className="flex flex-col rounded-lg border border-border bg-card p-4"><p className="text-xs font-semibold text-primary">{anime.genres.join(" · ")}</p><h3 className="mt-1 text-lg font-bold">{anime.title}</h3><p className="mb-4 mt-2 text-sm text-muted-foreground">{anime.description}</p><Button className="mt-auto" variant={owned ? "secondary" : "outline"} disabled={!user} onClick={() => { if (owned) edit(owned); else { save.reset(); setForm({ ...blank, title: anime.title }); } }}>{owned ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}{owned ? "In deck · Edit" : "Add completed anime"}</Button></article>;
      })}</div>{!available.length && <p className="py-8 text-muted-foreground">No titles match your search.</p>}
    </>}
    {tab === "deck" && <div className="mt-5">{deck.isPending && user && <p>Loading your deck…</p>}{deck.error && <p role="alert" className="text-destructive">Couldn’t load your deck. <Button variant="ghost" onClick={() => deck.refetch()}>Retry</Button></p>}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{deck.data?.map((a) => <article key={a.id} className="rounded-lg border bg-card p-4"><h3 className="text-lg font-bold">{a.title}</h3><div className="mt-2 flex gap-1" aria-label={`${a.rating} out of 5 stars`}>{[1,2,3,4,5].map((n) => <Star key={n} className={`h-4 w-4 ${n <= a.rating ? "fill-primary text-primary" : "text-muted-foreground"}`} />)}</div><p className="mt-2 text-sm">{a.description}</p><p className="mt-3 text-sm text-muted-foreground">Rewatch: {a.rewatch ? "Yes" : "No"}{a.character_name && ` · I'd be ${a.character_name}`}</p><p className="mt-1 text-xs text-muted-foreground">{a.shared ? "Visible to signed-in players" : "Private card"}</p><div className="mt-3 flex gap-2"><Button variant="outline" onClick={() => edit(a)}>Edit</Button><Button variant="ghost" size="icon" disabled={remove.isPending} aria-label={`Remove ${a.title}`} onClick={() => remove.mutate(a.id)}><Trash2 className="h-4 w-4" /></Button><Button variant="ghost" size="icon" title="Find players" aria-label={`Find players who watched ${a.title}`} onClick={() => { setSelected(a.anime_key); setTab("players"); }}><Users className="h-4 w-4" /></Button></div></article>)}</div>
      {!deck.data?.length && !deck.isFetching && <p className="py-8 text-muted-foreground">Your account deck is empty.</p>}{remove.error && <p role="alert" className="text-destructive">Couldn’t remove this card. Try again.</p>}
    </div>}
    {tab === "players" && <div className="mt-5">{!user ? <p className="text-muted-foreground">Sign in and add completed anime to find shared interests.</p> : <>
      <label className="text-sm font-semibold">Shared anime<select aria-label="Match anime" value={selected} onChange={(e) => setSelected(e.target.value)} className="ml-3 max-w-full rounded-md border bg-background p-2"><option value="All">All my completed anime</option>{deck.data?.map((a) => <option key={a.anime_key} value={a.anime_key}>{a.title}</option>)}</select></label>
      {players.isFetching && <p className="mt-4">Finding players…</p>}{players.error && <p role="alert" className="mt-4 text-destructive">Couldn’t load players. <Button variant="ghost" onClick={() => players.refetch()}>Retry</Button></p>}
      {!players.isFetching && !players.error && !players.data?.length && <p className="py-8 text-muted-foreground">No shared decks match yet. Only players who choose to share a card appear here.</p>}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">{players.data?.map((player) => <article key={player.id} className="rounded-lg border bg-card p-4"><h3 className="font-bold">{player.name}</h3><p className="mt-1 text-sm text-primary">{player.titles.length} anime in common</p><ul className="mt-2 space-y-1 text-sm">{player.titles.map((title) => <li key={title}>{title}</li>)}</ul><Button asChild variant="outline" className="mt-3"><Link to="/fandoms" search={{ anime: player.titles[0] ?? "", player: player.id }}><MessageCircle className="h-4 w-4" />Discuss in Community</Link></Button></article>)}</div>
    </>}</div>}
    <Dialog open={!!form} onOpenChange={(open) => { if (!open && !save.isPending) setForm(null); }}><DialogContent className="max-h-[85dvh] overflow-y-auto"><DialogHeader><DialogTitle>Completed anime card</DialogTitle></DialogHeader>{form && <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); save.mutate(); }}>
      <label className="block text-sm font-semibold">Anime name<Input required maxLength={160} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
      <fieldset><legend className="text-sm font-semibold">Your rating</legend><div className="flex gap-1" role="radiogroup" aria-label="Your rating">{[1,2,3,4,5].map((n) => <Button key={n} type="button" variant="ghost" size="icon" role="radio" aria-checked={form.rating === n} aria-label={`${n} stars`} onClick={() => setForm({ ...form, rating: n })}><Star className={n <= form.rating ? "fill-primary text-primary" : "text-muted-foreground"} /></Button>)}</div></fieldset>
      <label className="block text-sm font-semibold">Quick spoiler-free description<Textarea maxLength={240} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
      <fieldset><legend className="mb-2 text-sm font-semibold">Would you watch it again?</legend><div className="flex gap-2">{[true,false].map((value) => <Button key={String(value)} type="button" variant={form.rewatch === value ? "default" : "outline"} onClick={() => setForm({ ...form, rewatch: value })}>{value ? "Yes" : "No"}</Button>)}</div></fieldset>
      <label className="block text-sm font-semibold">Which character would you be?<Input maxLength={60} value={form.character} onChange={(e) => setForm({ ...form, character: e.target.value })} /></label>
      <label className="flex items-start gap-3 text-sm"><Checkbox checked={form.shared} onCheckedChange={(checked) => setForm({ ...form, shared: checked === true })} /><span>Share this card with signed-in players. Your name, rating and card details will be visible.</span></label>
      {save.error && <p role="alert" className="text-sm text-destructive">{save.error.message}</p>}<Button type="submit" className="w-full" disabled={save.isPending}>{save.isPending ? "Saving…" : "Save to my deck"}</Button>
    </form>}</DialogContent></Dialog>
  </section>;
}