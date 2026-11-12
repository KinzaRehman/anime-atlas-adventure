<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

- Game content lives in src/data/game.ts and progress in src/lib/progress.ts (localStorage); keep UI reading only these so an Express/Mongo API can replace them later.
- Game world uses Phaser (src/game, lazy-loaded in GameCanvas); React HUD talks to it only via src/game/bus.ts. Dev builds expose window.__scene for scripted checks (teleport via __scene.player.setPosition).
- Town expansion quests use TOWN_QUESTS content and QuestChallenge with townQuestStage; completion and turn-in remain separate so collectible cards require the full encounter loop.
- AI model calls go through @lovable.dev/ai-gateway inside createServerFn handlers in src/lib/*.functions.ts; keeps keys server-side.
- Community data (posts, comments, likes, polls) is read/written from the browser via the generated client in src/lib/community.ts, guarded by RLS; guests read, signed-in users write their own rows.
- Character chat history lives in the chat_messages table per user+character; sendChat (src/lib/chat.functions.ts) saves both turns server-side so history and replies stay consistent.
- Recurring missions use UTC period keys and ordered activity events in the progress store; reward claims are guarded against duplicates so replaying activities cannot repeatedly claim the same mission.
- Community reports and notification reads are caller-scoped by RLS; moderation uses a protected role table and a role-checking database function so clients cannot grant themselves moderation powers.
- Removed community items are filtered in public feeds and protected by restrictive read policies with owner/moderator access retained for review.
- Account state uses the single shared listener in src/lib/session.ts; root subscribes to identity transitions for cache invalidation, and login return paths are sanitized once to prevent conflicting redirects.
