import { useSyncExternalStore } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

// One shared auth listener for the whole app (browser only).
let user: User | null = null;
let started = false;
let ready = false;
const identitySubs = new Set<(signedOut: boolean) => void>();
const subs = new Set<() => void>();
function start() {
  if (started || typeof window === "undefined") return;
  started = true;
  let revision = 0;
  supabase.auth.onAuthStateChange((event, session) => {
    revision++;
    user = session?.user ?? null;
    ready = true;
    subs.forEach((f) => f());
    if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
      identitySubs.forEach((f) => f(event === "SIGNED_OUT"));
    }
  });
  const initialRevision = revision;
  supabase.auth.getUser().then(({ data }) => {
    if (revision !== initialRevision) return;
    user = data.user; ready = true; subs.forEach((f) => f());
  }).catch(() => { if (revision === initialRevision) { ready = true; subs.forEach((f) => f()); } });
}
export function useUser() {
  return useSyncExternalStore((f) => { start(); subs.add(f); return () => subs.delete(f); }, () => user, () => null);
}
export function useAuthReady() {
  return useSyncExternalStore((f) => { start(); subs.add(f); return () => subs.delete(f); }, () => ready, () => false);
}
export function subscribeIdentity(f: (signedOut: boolean) => void) {
  identitySubs.add(f); start();
  return () => { identitySubs.delete(f); };
}
