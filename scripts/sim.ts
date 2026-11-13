// Developer runner: bun scripts/sim.ts seed | day [n] | checks | reset | status
import { createClient } from "@supabase/supabase-js";
import { seed, runDay, resetSim, type SimEnv } from "../src/lib/sim/engine";
import { runChecks } from "../src/lib/sim/checks";
const url = process.env["SUPABASE_URL"]!, key = process.env["SUPABASE_SERVICE_ROLE_KEY"]!;
const admin = createClient(url, key, { auth: { persistSession: false }, global: { fetch: (i, init) => { const h = new Headers(init?.headers); if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization"); h.set("apikey", key); return fetch(i, { ...init, headers: h }); } } });
const env: SimEnv = { url, publishableKey: process.env["SUPABASE_PUBLISHABLE_KEY"]!, admin, secret: key };
const [cmd, n] = process.argv.slice(2);
if (cmd === "seed") console.log(await seed(env));
else if (cmd === "day") for (let i = 0; i < Number(n ?? 1); i++) { const r = await runDay(env); console.log(r); if (!r.ran) break; }
else if (cmd === "checks") { const st = await admin.from("sim_state").select("sim_day").single(); for (const r of await runChecks(env, st.data?.sim_day ?? 0)) console.log(r.status.padEnd(13), r.area, "-", r.name, "-", r.detail); }
else if (cmd === "reset") console.log(await resetSim(env));
else console.log((await admin.from("sim_state").select("*").single()).data);
