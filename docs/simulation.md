# AnimeAtlas test-account simulation

30 synthetic players (emails `sim-<handle>@animeatlas.test`, display names ending "(test)") play the app through the
normal signed-in database rules. Their posts, replies, likes, votes, profiles and anime cards are hidden from real
players and visitors; only admins and the test accounts see them.

## Dashboard
Profile → Simulation dashboard (shown only to admin accounts), or `/sim`.
- Seed 30 users: creates missing accounts only; rerunning never duplicates.
- Run 1 / 7 / 30 days: advances the simulated clock one day per step. A day can only be simulated once.
- Pause / Resume: blocks further days.
- Run checks: real security and behaviour tests; results show as passed / failed / skipped / unimplemented.
- AI budget: total AI chat messages the simulation may use (default 3). Over budget, chats are skipped and logged.
- CSV / JSON: export the activity and error log.
- Reset test data: deletes only test accounts and what they created. Real players are untouched.

Nothing runs in the background; every day is started by a button press.

## Command line (developers)
`bun scripts/sim.ts seed | day <n> | checks | reset | status` (needs the backend service environment).

## Admin access
Admins are rows in the protected roles table with role `admin`; grant one only for a real, signed-up account.
