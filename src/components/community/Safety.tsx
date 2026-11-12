import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, Check, Flag, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export function ReportControl({ uid, kind, id }: { uid: string | null; kind: "post" | "comment" | "poll"; id: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("Inappropriate content");
  const report = useMutation({ mutationFn: async () => {
    if (!uid) throw new Error("Sign in to report content.");
    const r = await supabase.from("community_reports").insert({ reporter_id: uid, target_kind: kind, target_id: id, reason });
    if (r.error) throw new Error(r.error.code === "23505" ? "You already reported this item." : r.error.message);
  }, onSuccess: () => { toast.success("Report sent for review"); setOpen(false); }, onError: (e: Error) => toast.error(e.message) });
  if (!uid) return null;
  return <div className="relative"><Button type="button" variant="ghost" size="icon" title={`Report ${kind}`} aria-label={`Report ${kind}`} onClick={() => setOpen(!open)}><Flag className="h-4 w-4" /></Button>{open && <form className="absolute right-0 z-20 w-64 space-y-3 rounded-lg border border-border bg-card p-3 shadow-soft" onSubmit={(e) => { e.preventDefault(); report.mutate(); }}>
    <label className="block text-sm font-semibold">Reason<select value={reason} onChange={(e) => setReason(e.target.value)} className="mt-1 w-full rounded-md border border-border bg-background p-2">{["Inappropriate content", "Harassment or bullying", "Spam or misleading content", "Unmarked spoilers"].map((r) => <option key={r}>{r}</option>)}</select></label>
    <div className="flex gap-2"><Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button disabled={report.isPending}>Send report</Button></div>
  </form>}</div>;
}

export function CommunityInbox({ uid }: { uid: string }) {
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();
  const queryKey = ["notifications", uid];
  const notifications = useQuery({ queryKey, refetchInterval: 30000, queryFn: async () => {
    const r = await supabase.from("community_notifications").select("id,kind,message,read_at,created_at").eq("user_id", uid).order("created_at", { ascending: false }).limit(50);
    if (r.error) throw new Error(r.error.message); return r.data;
  } });
  const read = useMutation({ mutationFn: async (id: string) => {
    const r = await supabase.from("community_notifications").update({ read_at: new Date().toISOString() }).eq("id", id).eq("user_id", uid);
    if (r.error) throw new Error(r.error.message);
  }, onSuccess: () => qc.invalidateQueries({ queryKey }), onError: (e: Error) => toast.error(e.message) });
  const unread = notifications.data?.filter((n) => !n.read_at).length ?? 0;
  return <div className="relative"><Button variant="ghost" size="icon" aria-label={`Notifications (${unread} unread)`} title="Notifications" onClick={() => setOpen(!open)}><Bell className="h-5 w-5" />{unread > 0 && <span className="absolute right-0 top-0 grid h-4 w-4 place-items-center rounded-full bg-primary text-[10px] text-primary-foreground">{unread}</span>}</Button>
    {open && <section aria-label="Notifications" className="absolute right-0 z-30 max-h-96 w-[min(320px,85vw)] overflow-y-auto rounded-lg border border-border bg-card p-4 shadow-soft"><h2 className="mb-2 font-display font-bold">Notifications</h2>{notifications.isLoading && <p>Loading…</p>}{notifications.error && <p role="alert">Couldn't load notifications.</p>}{notifications.data?.length === 0 && <p className="text-sm text-muted-foreground">No new activity yet.</p>}{notifications.data?.map((n) => <div key={n.id} className="flex items-center gap-2 border-t border-border py-3"><p className="flex-1 text-sm">{n.message}<time className="block text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString()}</time></p>{!n.read_at && <Button variant="ghost" size="icon" aria-label="Mark as read" disabled={read.isPending} onClick={() => read.mutate(n.id)}><Check className="h-4 w-4" /></Button>}</div>)}</section>}
  </div>;
}

export function ModerationQueue({ uid }: { uid: string }) {
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();
  const role = useQuery({ queryKey: ["moderator", uid], queryFn: async () => {
    const r = await supabase.rpc("is_community_moderator"); if (r.error) throw new Error(r.error.message); return r.data;
  } });
  const reports = useQuery({ queryKey: ["moderation", uid], enabled: !!role.data && open, queryFn: async () => {
    const r = await supabase.from("community_reports").select("id,target_kind,target_id,reason,created_at").eq("status", "pending").order("created_at");
    if (r.error) throw new Error(r.error.message); return r.data;
  } });
  const decide = useMutation({ mutationFn: async ({ id, decision }: { id: string; decision: string }) => {
    const r = await supabase.rpc("resolve_community_report", { report_id: id, decision }); if (r.error) throw new Error(r.error.message);
  }, onSuccess: () => { void qc.invalidateQueries({ queryKey: ["moderation", uid] }); void qc.invalidateQueries({ queryKey: ["hidden"] }); void qc.invalidateQueries({ queryKey: ["posts"] }); void qc.invalidateQueries({ queryKey: ["poll"] }); void qc.invalidateQueries({ queryKey: ["comments"] }); }, onError: (e: Error) => toast.error(e.message) });
  if (!role.data) return null;
  return <><Button variant="outline" onClick={() => setOpen(!open)}><ShieldCheck className="h-4 w-4" />Moderation</Button>{open && <section className="fixed inset-x-3 top-24 z-40 mx-auto max-h-[70dvh] max-w-xl overflow-y-auto rounded-lg border border-border bg-card p-5 shadow-soft" aria-label="Moderation queue"><div className="flex justify-between"><h2 className="font-display text-xl font-bold">Reports for review</h2><Button variant="ghost" onClick={() => setOpen(false)}>Close</Button></div>{reports.isLoading && <p>Loading reports…</p>}{reports.error && <p role="alert">Couldn't load reports.</p>}{reports.data?.length === 0 && <p className="py-5 text-muted-foreground">No reports pending.</p>}{reports.data?.map((r) => <ReportedItem key={r.id} report={r} pending={decide.isPending} onDecision={(decision) => decide.mutate({ id: r.id, decision })} />)}</section>}</>;
}

function ReportedItem({ report, pending, onDecision }: { report: { id: string; target_kind: string; target_id: string; reason: string }; pending: boolean; onDecision: (decision: string) => void }) {
  const content = useQuery({ queryKey: ["reported-content", report.id], queryFn: async () => {
    if (report.target_kind === "post") { const r = await supabase.from("posts").select("title,body").eq("id", report.target_id).maybeSingle(); if (r.error) throw new Error(r.error.message); return r.data ? `${r.data.title}\n${r.data.body}` : "Content unavailable"; }
    if (report.target_kind === "comment") { const r = await supabase.from("comments").select("body").eq("id", report.target_id).maybeSingle(); if (r.error) throw new Error(r.error.message); return r.data?.body ?? "Content unavailable"; }
    const r = await supabase.from("polls").select("question,options").eq("id", report.target_id).maybeSingle(); if (r.error) throw new Error(r.error.message); return r.data ? `${r.data.question}\n${r.data.options.join(" · ")}` : "Content unavailable";
  } });
  return <article className="border-t border-border py-4"><p className="text-xs font-bold uppercase text-primary">{report.target_kind} · {report.reason}</p><p className="my-2 whitespace-pre-wrap text-sm">{content.isLoading ? "Loading content…" : content.error ? "Couldn't load content." : content.data}</p><div className="flex gap-2"><Button variant="outline" disabled={pending} onClick={() => onDecision("dismissed")}>Dismiss</Button><Button variant="destructive" disabled={pending || !content.data} onClick={() => onDecision("removed")}>Hide content</Button></div></article>;
}