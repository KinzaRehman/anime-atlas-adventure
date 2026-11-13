import { supabase } from "@/integrations/supabase/client";

export type PostRow = { id: string; author_id: string | null; author_name: string | null; fandom: string; title: string; body: string; spoiler: string | null; created_at: string; updated_at: string;
  profiles: { display_name: string } | null; post_likes: { user_id: string }[]; comments: { count: number }[] };
export type CommentRow = { id: string; post_id: string; parent_id: string | null; author_id: string; body: string; created_at: string; profiles: { display_name: string } | null };
export const FANDOMS = ["General", "Slice of Life", "Sports", "Mecha", "Mystery", "Adventure", "Art"];

const must = <T,>(r: { data: T | null; error: { message: string } | null }) => { if (r.error) throw new Error(r.error.message); return r.data as T; };

async function hiddenIds(kind: string) { const r = await supabase.from("community_hidden").select("target_id").eq("target_kind", kind); if (r.error) throw new Error(r.error.message); return new Set(r.data.map((r) => r.target_id)); }
export const listPosts = async () => {
  const [rows, hidden] = await Promise.all([supabase.from("posts").select("*, profiles!posts_author_id_fkey(display_name), post_likes(user_id), comments(count)").order("created_at", { ascending: false }).limit(100), hiddenIds("post")]);
  return (must(rows) as unknown as PostRow[]).filter((p) => !hidden.has(p.id));
};
export const listComments = async (postId: string) => {
  const [rows, hidden] = await Promise.all([supabase.from("comments").select("*, profiles!comments_author_id_fkey(display_name)").eq("post_id", postId).order("created_at"), hiddenIds("comment")]);
  return (must(rows) as unknown as CommentRow[]).filter((p) => !hidden.has(p.id));
};
export const savePost = async (uid: string, p: { id?: string | undefined; fandom: string; title: string; body: string; spoiler: string | null }) =>
  p.id ? must(await supabase.from("posts").update({ fandom: p.fandom, title: p.title, body: p.body, spoiler: p.spoiler, updated_at: new Date().toISOString() }).eq("id", p.id).select())
       : must(await supabase.from("posts").insert({ author_id: uid, fandom: p.fandom, title: p.title, body: p.body, spoiler: p.spoiler }).select());
export const deletePost = async (id: string) => must(await supabase.from("posts").delete().eq("id", id));
export const addComment = async (uid: string, postId: string, body: string, parentId: string | null) => must(await supabase.from("comments").insert({ author_id: uid, post_id: postId, body, parent_id: parentId }).select());
export const deleteComment = async (id: string) => must(await supabase.from("comments").delete().eq("id", id));
export const setLike = async (uid: string, postId: string, on: boolean) =>
  on ? must(await supabase.from("post_likes").insert({ user_id: uid, post_id: postId })) : must(await supabase.from("post_likes").delete().eq("post_id", postId).eq("user_id", uid));
export type Poll = { id: string; question: string; options: string[]; counts: number[]; mine: number | undefined };
export const getPoll = async (): Promise<Poll | null> => {
  const pr = await supabase.from("polls").select("id, question, options").order("created_at").limit(1).maybeSingle();
  if (pr.error) throw new Error(pr.error.message);
  if (!pr.data) return null;
  if ((await hiddenIds("poll")).has(pr.data.id)) return null;
  const [cr, mr] = await Promise.all([supabase.rpc("poll_vote_counts", { _poll_id: pr.data.id }), supabase.from("poll_votes").select("option_index").eq("poll_id", pr.data.id).maybeSingle()]);
  if (cr.error) throw new Error(cr.error.message);
  const counts = pr.data.options.map((_: string, i: number) => Number(cr.data?.find((c) => c.option_index === i)?.votes ?? 0));
  return { ...pr.data, counts, mine: mr.data?.option_index };
};
export const vote = async (uid: string, pollId: string, option: number) => must(await supabase.from("poll_votes").upsert({ poll_id: pollId, user_id: uid, option_index: option }));
