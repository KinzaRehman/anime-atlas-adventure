import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [
    { title: "Reset password | AnimeAtlas" }, { name: "description", content: "Securely reset your AnimeAtlas account password." },
    { property: "og:title", content: "Reset password | AnimeAtlas" }, { property: "og:description", content: "Recover access to your AnimeAtlas account." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }), component: ResetPassword,
});
function ResetPassword() {
  const [recovery, setRecovery] = useState(false), [password, setPassword] = useState(""), [confirmation, setConfirmation] = useState(""), [message, setMessage] = useState(""), [busy, setBusy] = useState(false), [done, setDone] = useState(false);
  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1));
    if (params.get("type") === "recovery") setRecovery(true);
    const { data } = supabase.auth.onAuthStateChange((event) => { if (event === "PASSWORD_RECOVERY") setRecovery(true); });
    return () => data.subscription.unsubscribe();
  }, []);
  return <div className="mx-auto max-w-sm space-y-4 py-8"><h1 className="font-display text-3xl font-bold">New password</h1>{recovery && !done ? <form className="space-y-3" onSubmit={async (e) => {
    e.preventDefault(); if (password !== confirmation) { setMessage("Passwords don't match."); return; }
    setBusy(true); const r = await supabase.auth.updateUser({ password }); setBusy(false); setMessage(r.error ? r.error.message : "Password updated."); setDone(!r.error);
  }}><label className="block text-sm font-semibold">New password<input required type="password" minLength={6} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 min-h-12 w-full rounded-lg border border-border bg-card px-3" /></label><label className="block text-sm font-semibold">Confirm password<input required type="password" minLength={6} autoComplete="new-password" value={confirmation} onChange={(e) => setConfirmation(e.target.value)} className="mt-1 min-h-12 w-full rounded-lg border border-border bg-card px-3" /></label><Button disabled={busy} className="min-h-12 w-full">{busy ? "Saving…" : "Save password"}</Button></form> : <p className="text-muted-foreground">{done ? "Your password has been updated." : "Open the password reset link from your email."}</p>}{message && <p role="status">{message}</p>}<Link to="/auth" className="font-semibold text-primary">Back to sign in</Link></div>;
}