import { useSyncExternalStore } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

// One shared auth listener for the whole app (browser only).
let user: User | null = null;
let started = false;
const subs = new Set<() => void>();
function start() {
  if (started || typeof window === "undefined") return;
  started = true;
  supabase.auth.getUser().then(({ data }) => { user = data.user; subs.forEach((f) => f()); });
  supabase.auth.onAuthStateChange((_e, s) => { user = s?.user ?? null; subs.forEach((f) => f()); });
}
export function useUser() {
  return useSyncExternalStore((f) => { start(); subs.add(f); return () => subs.delete(f); }, () => user, () => null);
}
