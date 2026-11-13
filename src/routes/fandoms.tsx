import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { EyeOff, Heart, MessageSquare, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@/lib/session";
import { addComment, deleteComment, deletePost, FANDOMS, getPoll, listComments, listPosts, savePost, setLike, vote, type CommentRow, type PostRow } from "@/lib/community";
import { addXp, useProgress } from "@/lib/progress";
import { supabase } from "@/integrations/supabase/client";
import { CommunityInbox, ModerationQueue, ReportControl } from "@/components/community/Safety";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/fandoms")({
  validateSearch: (search: Record<string, unknown>) => ({ anime: typeof search['anime'] === "string" ? search['anime'].slice(0, 160) : "", player: typeof search['player'] === "string" ? search['player'] : "" }),
  head: () => ({ meta: [
    { title: "Community Plaza | AnimeAtlas" }, { name: "description", content: "Wholesome anime discussions with spoiler protection, threaded replies and community polls." },
    { property: "og:title", content: "Community Plaza | AnimeAtlas" }, { property: "og:description", content: "Discuss, vote and share with fellow anime fans." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: Fandoms,
});

const ago = (d: string) => { const m = Math.round((Date.now() - +new Date(d)) / 60000); return m < 1 ? "just now" : m < 60 ? `${m}m` : m < 1440 ? `${Math.round(m / 60)}h` : `${Math.round(m / 1440)}d`; };
const who = (p: { author_name?: string | null; profiles: { display_name: string } | null }) => p.author_name ?? p.profiles?.display_name ?? "Traveler";
const field = "w-full rounded-xl border border-border bg-card px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-ring";

function SignInCta({ what }: { what: string }) {
  return <Link to="/auth" search={{ redirect: "/fandoms" }} className="font-semibold text-primary underline underline-offset-4">Sign in to {what}</Link>;
}

function Fandoms() {
  const search = Route.useSearch();
  const user = useUser();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const signOut = async () => { await qc.cancelQueries(); qc.clear(); await supabase.auth.signOut(); void navigate({ to: "/auth", replace: true }); };
  const posts = useQuery({ queryKey: ["posts"], queryFn: listPosts });
  const [fandom, setFandom] = useState("All");
  const [q, setQ] = useState(search.anime);
  const [sort, setSort] = useState<"new" | "top">("new");
  const [editing, setEditing] = useState<PostRow | "new" | null>(null);
  useEffect(() => { setQ(search.anime); setEditing(null); }, [search.anime, search.player]);
  const list = (posts.data ?? [])
    .filter((p) => fandom === "All" || p.fandom === fandom)
    .filter((p) => !search.player || p.author_id === search.player)
    .filter((p) => !q.trim() || (p.title + " " + p.body).toLowerCase().includes(q.trim().toLowerCase()))
    .sort((a, b) => (sort === "top" ? b.post_likes.length - a.post_likes.length : 0));

  return (
    <div className="mx-auto max-w-5xl pb-28">
      <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Community Plaza</p><h1 className="font-display text-3xl font-bold">Fandom discussions</h1></div>
        {user ? <div className="flex items-center gap-2">
            <CommunityInbox uid={user.id} /><ModerationQueue uid={user.id} />
            <button onClick={() => setEditing("new")} className="btn-primary inline-flex min-h-11 items-center gap-2"><Plus className="h-4 w-4" />New post</button>
            <Button variant="ghost" onClick={signOut}>Sign out</Button>
          </div> : <SignInCta what="join in" />}
      </header>
      {search.anime && <div className="mb-4 flex flex-wrap items-center gap-3 border-y border-border py-3"><p className="font-semibold">{search.anime}{search.player ? " · Shared-interest player’s discussions" : ""}</p>{user && <Button onClick={() => { if (search.player) void navigate({ to: "/fandoms", search: { anime: search.anime, player: "" } }).then(() => setEditing("new")); else setEditing("new"); }}><Plus className="h-4 w-4" />Start an anime discussion</Button>}<Button asChild variant="ghost"><Link to="/fandoms" search={{ anime: "", player: "" }}>All discussions</Link></Button></div>}
      <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
        <div className="space-y-4">
          <div className="paper space-y-3 rounded-3xl p-3">
            <label className="relative block"><span className="sr-only">Search posts</span><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search discussions" className={`${field} pl-9`} /></label>
            <div className="flex flex-wrap items-center gap-1.5">
              {["All", ...FANDOMS].map((f) => <button key={f} aria-pressed={fandom === f} onClick={() => setFandom(f)} className={`min-h-9 rounded-full px-3 text-sm font-semibold ${fandom === f ? "bg-charcoal text-ivory" : "bg-muted hover:bg-muted/70"}`}>{f}</button>)}
              <select aria-label="Sort" value={sort} onChange={(e) => setSort(e.target.value as "new" | "top")} className="ml-auto min-h-9 rounded-full border border-border bg-card px-3 text-sm"><option value="new">Newest</option><option value="top">Most liked</option></select>
            </div>
          </div>
          {editing && user && <PostEditor uid={user.id} initialTitle={search.anime ? `${search.anime} — discussion` : ""} post={editing === "new" ? null : editing} onDone={() => setEditing(null)} />}
          {posts.isLoading && [0, 1, 2].map((i) => <div key={i} className="paper h-32 animate-pulse rounded-3xl" />)}
          {posts.error && <p role="alert" className="rounded-2xl bg-destructive/10 p-4 font-semibold text-destructive">Couldn't load discussions. <button className="underline" onClick={() => posts.refetch()}>Try again</button></p>}
          {posts.data && list.length === 0 && <p className="paper rounded-3xl p-8 text-center text-muted-foreground">No discussions match yet. {user ? "Start one!" : ""}</p>}
          {list.map((p) => <PostCard key={p.id} p={p} uid={user?.id ?? null} onEdit={() => setEditing(p)} />)}
        </div>
        <aside className="space-y-4"><PollCard uid={user?.id ?? null} />
          <p className="paper rounded-3xl p-4 text-sm text-muted-foreground"><strong className="text-foreground">Plaza rules:</strong> be kind, put plot details in the spoiler box, share original art only.</p></aside>
      </div>
    </div>
  );
}

function PostEditor({ uid, post, onDone, initialTitle = "" }: { uid: string; post: PostRow | null; onDone: () => void; initialTitle?: string }) {
  const qc = useQueryClient();
  const [f, setF] = useState({ fandom: post?.fandom ?? "General", title: post?.title ?? initialTitle, body: post?.body ?? "", spoiler: post?.spoiler ?? "" });
  const m = useMutation({
    mutationFn: () => savePost(uid, { id: post?.id, fandom: f.fandom, title: f.title.trim(), body: f.body.trim(), spoiler: f.spoiler.trim() || null }),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ["posts"] }); toast.success(post ? "Post updated" : "Posted to the plaza"); onDone(); },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <form onSubmit={(e) => { e.preventDefault(); m.mutate(); }} className="paper animate-rise space-y-3 rounded-3xl p-4">
      <h2 className="font-display text-lg font-bold">{post ? "Edit post" : "New discussion"}</h2>
      <div className="grid gap-3 sm:grid-cols-[1fr_160px]">
        <label className="text-sm font-semibold">Title<input required minLength={3} maxLength={120} value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} className={field} /></label>
        <label className="text-sm font-semibold">Fandom<select value={f.fandom} onChange={(e) => setF({ ...f, fandom: e.target.value })} className={field}>{FANDOMS.map((x) => <option key={x}>{x}</option>)}</select></label>
      </div>
      <label className="block text-sm font-semibold">Post<textarea required maxLength={4000} rows={4} value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} className={field} /></label>
      <label className="block text-sm font-semibold">Spoilers (optional, hidden until tapped)<textarea maxLength={2000} rows={2} value={f.spoiler} onChange={(e) => setF({ ...f, spoiler: e.target.value })} className={field} /></label>
      <div className="flex justify-end gap-2"><button type="button" onClick={onDone} className="min-h-11 rounded-full px-4 font-semibold">Cancel</button><button disabled={m.isPending} className="btn-primary min-h-11 disabled:opacity-50">{m.isPending ? "Saving…" : post ? "Save" : "Post"}</button></div>
    </form>
  );
}

function PostCard({ p, uid, onEdit }: { p: PostRow; uid: string | null; onEdit: () => void }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [reveal, setReveal] = useState(false);
  const liked = !!uid && p.post_likes.some((l) => l.user_id === uid);
  const like = useMutation({ mutationFn: () => { if (!uid) throw new Error("Sign in to like posts."); return setLike(uid, p.id, !liked); }, onSettled: () => qc.invalidateQueries({ queryKey: ["posts"] }), onError: (e: Error) => toast.error(e.message) });
  const del = useMutation({ mutationFn: () => deletePost(p.id), onSuccess: () => { void qc.invalidateQueries({ queryKey: ["posts"] }); toast.success("Post deleted"); }, onError: (e: Error) => toast.error(e.message) });
  const count = p.comments[0]?.count ?? 0;
  return (
    <article className="paper rounded-3xl p-5">
      <p className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">{who(p)}</span>· {ago(p.created_at)}{p.updated_at > p.created_at && " · edited"}
        <span className="ml-auto rounded-full bg-lavender/60 px-2.5 py-0.5 text-xs font-bold text-charcoal">{p.fandom}</span>
      </p>
      <h2 className="mt-1 font-display text-xl font-bold">{p.title}</h2>
      <p className="mt-1 whitespace-pre-wrap leading-relaxed">{p.body}</p>
      {p.spoiler && (reveal ? <p className="mt-3 whitespace-pre-wrap rounded-2xl bg-lavender/50 p-3">{p.spoiler}</p>
        : <button onClick={() => setReveal(true)} className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-charcoal font-semibold text-ivory"><EyeOff className="h-4 w-4" />Spoiler: tap to reveal</button>)}
      <div className="mt-3 flex flex-wrap items-center gap-1">
        <ReportControl uid={uid} kind="post" id={p.id} />
        <button disabled={!uid || like.isPending} onClick={() => like.mutate()} aria-pressed={liked} aria-label={`${liked ? "Unlike" : "Like"} (${p.post_likes.length})`}
          className={`inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 font-semibold ${liked ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
          <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />{p.post_likes.length}</button>
        <button onClick={() => setOpen(!open)} aria-expanded={open} className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 font-semibold text-muted-foreground hover:text-foreground"><MessageSquare className="h-4 w-4" />{count} {count === 1 ? "reply" : "replies"}</button>
        {uid && uid === p.author_id && <>
          <button onClick={onEdit} className="ml-auto inline-flex min-h-11 items-center gap-1 rounded-full px-3 text-sm font-semibold text-muted-foreground hover:text-foreground"><Pencil className="h-4 w-4" />Edit</button>
          <button onClick={() => confirm("Delete this post?") && del.mutate()} className="inline-flex min-h-11 items-center gap-1 rounded-full px-3 text-sm font-semibold text-destructive"><Trash2 className="h-4 w-4" />Delete</button></>}
      </div>
      {open && <Comments postId={p.id} uid={uid} />}
    </article>
  );
}

function Comments({ postId, uid }: { postId: string; uid: string | null }) {
  const qc = useQueryClient();
  const c = useQuery({ queryKey: ["comments", postId], queryFn: () => listComments(postId) });
  const refresh = () => { void qc.invalidateQueries({ queryKey: ["comments", postId] }); void qc.invalidateQueries({ queryKey: ["posts"] }); };
  const all = c.data ?? [];
  const roots = all.filter((x) => !x.parent_id);
  return (
    <div className="mt-3 space-y-3 border-t border-border pt-3">
      {c.isLoading && <p className="text-sm text-muted-foreground">Loading replies…</p>}
      {roots.map((r) => <CommentItem key={r.id} c={r} kids={all.filter((x) => x.parent_id === r.id)} uid={uid} postId={postId} onChange={refresh} />)}
      {uid ? <CommentForm uid={uid} postId={postId} parentId={null} onDone={refresh} /> : <p className="text-sm"><SignInCta what="reply" /></p>}
    </div>
  );
}

function CommentItem({ c, kids, uid, postId, onChange, nested }: { c: CommentRow; kids?: CommentRow[]; uid: string | null; postId: string; onChange: () => void; nested?: boolean }) {
  const [reply, setReply] = useState(false);
  const del = useMutation({ mutationFn: () => deleteComment(c.id), onSuccess: onChange, onError: (e: Error) => toast.error(e.message) });
  return (
    <div className={nested ? "ml-4 border-l-2 border-lavender pl-3" : ""}>
      <p className="text-sm"><span className="font-semibold">{who(c)}</span> <span className="text-muted-foreground">· {ago(c.created_at)}</span></p>
      <p className="whitespace-pre-wrap">{c.body}</p>
      <div className="flex gap-1 text-sm">
        <ReportControl uid={uid} kind="comment" id={c.id} />
        {uid && !nested && <button onClick={() => setReply(!reply)} className="min-h-9 px-1 font-semibold text-muted-foreground hover:text-foreground">Reply</button>}
        {uid === c.author_id && <button onClick={() => del.mutate()} className="min-h-9 px-1 font-semibold text-destructive">Delete</button>}
      </div>
      {reply && uid && <div className="ml-4"><CommentForm uid={uid} postId={postId} parentId={c.id} onDone={() => { setReply(false); onChange(); }} /></div>}
      {kids?.map((k) => <CommentItem key={k.id} c={k} uid={uid} postId={postId} onChange={onChange} nested />)}
    </div>
  );
}

function CommentForm({ uid, postId, parentId, onDone }: { uid: string; postId: string; parentId: string | null; onDone: () => void }) {
  const [t, setT] = useState("");
  const m = useMutation({ mutationFn: () => addComment(uid, postId, t.trim(), parentId), onSuccess: () => { setT(""); onDone(); }, onError: (e: Error) => toast.error(e.message) });
  return (
    <form onSubmit={(e) => { e.preventDefault(); if (t.trim()) m.mutate(); }} className="flex gap-2">
      <label className="sr-only" htmlFor={`c-${parentId ?? postId}`}>{parentId ? "Write a reply" : "Write a comment"}</label>
      <input id={`c-${parentId ?? postId}`} value={t} maxLength={1000} onChange={(e) => setT(e.target.value)} placeholder={parentId ? "Write a reply…" : "Add to the discussion…"} className={field} />
      <button disabled={m.isPending || !t.trim()} className="btn-primary min-h-11 shrink-0 disabled:opacity-50">Send</button>
    </form>
  );
}

function PollCard({ uid }: { uid: string | null }) {
  const qc = useQueryClient();
  const prog = useProgress();
  const poll = useQuery({ queryKey: ["poll"], queryFn: getPoll });
  const m = useMutation({
    mutationFn: (i: number) => { if (!uid || !poll.data) throw new Error("Sign in to vote."); return vote(uid, poll.data.id, i); },
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ["poll"] }); if (prog.vote === null) addXp(20, () => ({ vote: 0 })); },
    onError: (e: Error) => toast.error(e.message),
  });
  if (poll.isLoading) return <div className="paper h-56 animate-pulse rounded-3xl" />;
  if (poll.error) return <p role="alert">Couldn't load the poll.</p>;
  if (!poll.data) return <p className="text-sm text-muted-foreground">No community poll right now.</p>;
  const d = poll.data;
  const mine = d.votes.find((v) => v.user_id === uid)?.option_index;
  const total = d.votes.length;
  const show = mine !== undefined || !uid;
  return (
    <section className="paper rounded-3xl p-4" aria-labelledby="poll-q">
      <div className="flex justify-end"><ReportControl uid={uid} kind="poll" id={d.id} /></div>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Community poll</p>
      <h2 id="poll-q" className="font-display text-lg font-bold">{d.question}</h2>
      <div className="mt-3 space-y-2">
        {d.options.map((o, i) => {
          const n = d.votes.filter((v) => v.option_index === i).length; const pct = total ? Math.round((n / total) * 100) : 0;
          return (
            <button key={o} disabled={!uid || m.isPending} onClick={() => m.mutate(i)} aria-pressed={mine === i}
              className={`relative block min-h-11 w-full overflow-hidden rounded-xl border text-left text-sm font-semibold ${mine === i ? "border-primary" : "border-border"} bg-card`}>
              {show && <span aria-hidden className="absolute inset-y-0 left-0 bg-lavender/70 transition-all duration-500" style={{ width: `${pct}%` }} />}
              <span className="relative flex justify-between px-3 py-2.5"><span>{o}</span>{show && <span>{pct}%</span>}</span>
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{total} {total === 1 ? "vote" : "votes"}{mine !== undefined && " · tap another option to change your vote"}</p>
      {!uid && <p className="mt-2 text-sm"><SignInCta what="vote" /></p>}
    </section>
  );
}
