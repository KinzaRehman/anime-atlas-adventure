import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useUser } from "@/lib/session";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): { redirect?: string | undefined } => { const r = s["redirect"]; return { redirect: typeof r === "string" && r.startsWith("/") && !r.startsWith("//") ? r : undefined }; },
  head: () => ({ meta: [
    { title: "Sign in | AnimeAtlas" }, { name: "description", content: "Sign in to post, comment, like and vote in the AnimeAtlas community." },
    { property: "og:title", content: "Sign in | AnimeAtlas" }, { property: "og:description", content: "Join the AnimeAtlas fandom community." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: AuthPage,
});

const G = <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"/><path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/></svg>;

function AuthPage() {
  const { redirect } = Route.useSearch();
  const to = redirect ?? "/fandoms";
  const nav = useNavigate();
  const user = useUser();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState(""); const [pw, setPw] = useState(""); const [name, setName] = useState("");
  const [msg, setMsg] = useState(""); const [busy, setBusy] = useState(false);
  useEffect(() => { if (user) void nav({ to, replace: true }); }, [user, nav, to]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setMsg("");
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
      if (error) setMsg(error.message);
    } else {
      const { error } = await supabase.auth.signUp({ email, password: pw, options: { emailRedirectTo: window.location.origin + to, data: { display_name: name.trim() } } });
      setMsg(error ? error.message : "Check your email to confirm your account, then sign in.");
    }
    setBusy(false);
  };
  const google = async () => {
    sessionStorage.setItem("aa-after-auth", to);
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/auth" });
    if (r.error) setMsg("Google sign-in didn't work. Please try again.");
  };
  useEffect(() => { const s = sessionStorage.getItem("aa-after-auth"); if (user && s) { sessionStorage.removeItem("aa-after-auth"); void nav({ to: s, replace: true }); } }, [user, nav]);

  const field = "min-h-12 w-full rounded-xl border border-border bg-card px-3 focus:outline-none focus:ring-2 focus:ring-ring";
  return (
    <div className="mx-auto max-w-sm space-y-5 py-6">
      <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Community Plaza</p>
        <h1 className="font-display text-3xl font-bold">{mode === "in" ? "Welcome back" : "Join the plaza"}</h1>
        <p className="text-sm text-muted-foreground">An account lets you post, comment, like and vote.</p></div>
      <button type="button" onClick={google} className="flex min-h-12 w-full items-center justify-center gap-2.5 rounded-full border border-[#747775] bg-[#FFFFFF] px-3 text-sm font-medium text-[#1F1F1F]">{G}Continue with Google</button>
      <div className="flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />or<span className="h-px flex-1 bg-border" /></div>
      <form onSubmit={submit} className="space-y-3">
        {mode === "up" && <label className="block text-sm font-semibold">Display name<input required maxLength={40} value={name} onChange={(e) => setName(e.target.value)} className={field} /></label>}
        <label className="block text-sm font-semibold">Email<input required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={field} /></label>
        <label className="block text-sm font-semibold">Password<input required type="password" minLength={6} autoComplete={mode === "in" ? "current-password" : "new-password"} value={pw} onChange={(e) => setPw(e.target.value)} className={field} /></label>
        <button disabled={busy} className="btn-primary min-h-12 w-full disabled:opacity-50">{busy ? "One moment…" : mode === "in" ? "Sign in" : "Create account"}</button>
      </form>
      {msg && <p role="status" className="rounded-xl bg-muted p-3 text-sm font-semibold">{msg}</p>}
      <button onClick={() => { setMode(mode === "in" ? "up" : "in"); setMsg(""); }} className="w-full text-sm font-semibold text-primary underline-offset-4 hover:underline">
        {mode === "in" ? "New here? Create an account" : "Already have an account? Sign in"}
      </button>
    </div>
  );
}
