# AnimeAtlas Premium Redesign: Direction and Phased Plan

## Why the app looks low-quality right now
- The world is a single static picture with pins on it, so there's no sense of walking around or exploring.
- Emoji are used as icons, avatars and collectibles, which looks cheap and inconsistent.
- Every screen is the same stack of chunky rounded cards with thick borders and "cartoon button" shadows.
- Weak visual hierarchy: everything shares one weight and colour, and nothing feels important.
- The chat is multiple-choice buttons, and the community is fake (likes and the poll reset on refresh).
- Only 2 of 8 characters have real portraits.

## Design direction: "Evening in Sakuragaoka"
A late-afternoon anime town: warm lantern light, long soft shadows, paper and ink textures. Editorial and calm, like a premium Japanese mobile game menu, not a toy.

- **Palette:** warm ivory `#F6F0E6` (paper), charcoal `#24212A` (ink and UI chrome), muted sakura `#D98FA0`, matcha `#8FA678`, soft lavender `#A99BC9`, plus one lantern-gold accent for rewards only.
- **Type:** "Zen Maru Gothic" for headings (a Japanese rounded typeface, refined rather than bubbly) and "Plus Jakarta Sans" for body text. Numbers use tabular figures for the XP and level readouts.
- **Surfaces:** frosted charcoal glass over the world (HUD, sheets, nav), and ivory paper cards with a faint grain for content. Corners are small (12–16px), borders are hairlines, and shadows are soft and layered, never chunky.
- **Icons:** a custom set of line icons (lucide-based, 1.75px stroke). No emoji anywhere in the UI.
- **Motion:** bottom sheets that spring open, shared-element transitions from card to profile, a petal and light-ray particle burst when you unlock something. All of it is turned off by reduced-motion.
- **Art:** 8 original character portraits in one consistent style (same framing, lighting and line weight), plus the art for the world itself.

## Screen layouts (mobile first)
```text
EXPLORE (default)                 COLLECTION            CHARACTER PROFILE
+---------------------------+    +----------------+    +----------------+
| [Lv3 ===XP]   [minimap]   |    | 5/8  filters   |    | full portrait  |
|                           |    | [card][card]   |    | name / role    |
|     2.5D world fills       |    | [card][card]   |    | backstory      |
|     ~90% of the screen     |    | locked = ink   |    | likes / stats  |
|        (player)           |    |  silhouette    |    | [Chat] (if met)|
|   [!] discovery pulse     |    +----------------+    +----------------+
| [joystick]     [Interact] |
+---[ floating pill nav ]---+    CHAT: portrait header, message thread,
                                  typing dots, text box + send
COMMUNITY: fandom tabs, search, feed, post composer sheet, thread view
PROFILE: avatar, level ring, daily/weekly missions, achievements, settings
```
- **Desktop:** the world stays edge to edge, with a docked side panel (missions, minimap, nearby) instead of a stretched phone layout. Community gets a 3-column layout (fandoms | feed | trending and rankings).

## Gameplay architecture
- **Engine:** Phaser 3, loaded lazily on the Explore page only and never rendered on the server. The React overlay (HUD, sheets) talks to Phaser through a small event bus.
- **World:** a tile-based town (grass, roads, plaza, river and bridge) with layered buildings (library, café, arcade, plaza, bookshop, park and gallery). Things are drawn in depth order so the player walks behind trees and buildings. Collision bodies stop you walking through walls.
- **Controls:**
  - Phone: an on-screen thumbstick and an Interact button.
  - Desktop: WASD or arrow keys and E/Space.
  - The camera follows the player smoothly.
- **Proximity:** a prompt appears near a door or character. Interacting opens that building's activity in a bottom sheet (library genre match, arcade trivia, café to chat), or plays the character discovery sequence.
- **Characters:** 8 characters walk set routes around town. Some appear only after you meet a condition (time of day, missions done).
- **Rules:** game rules stay in plain TypeScript with no React or Phaser inside, and they have unit tests.
- **Progress:** progress is saved in your browser while signed out, and synced to Lovable Cloud once you sign in.

## Backend (Lovable Cloud)
- **Accounts:** email or Google sign-in, with profiles (name, avatar, bio, favourite fandoms).
- **Community data:** fandoms, posts (editable by the author), threaded comments, reactions, polls and votes, anime rankings, reports for moderators, and notifications.
- **Permissions:** only the author can edit their own posts, and only a moderator role can resolve reports.
- **AI chat:** the AI runs on the server through Lovable AI, so no key is ever in the browser. Each character has its own personality brief and boundary rules: fictional AI characters, friendship only, no romance, magic or fortune-telling. Replies stream in and the history is saved per user. Clear errors are shown for rate limits and for running out of credits.

## Phases (each one finished properly before the next)
1. **Design system and playable world:** new colours, fonts and tokens, a redesigned shell and nav, the Phaser town with movement, camera, collisions, buildings, proximity prompts, minimap and HUD. Building activities move into bottom sheets.
2. **Characters:** generate 8 consistent portraits, add backstories, the unlock sequence, a profile view and a redesigned collection.
3. **AI chat:** turn on Lovable Cloud and Lovable AI, then build the typed chat with streaming, typing dots, timestamps and saved history.
4. **Community:** accounts, posts, comments, reactions, polls, rankings, search and filters, spoilers, reporting and notifications.
5. **GPS mode:** a Leaflet map that only loads after you allow location, with a few safe public discovery points generated around you. Your exact position is never stored or shared.
6. **Missions and polish:** daily and weekly challenges, achievements, loading and empty states, an accessibility pass, and checks on phone and desktop.

## Technical notes
- New packages: `phaser`, `leaflet`, `react-leaflet`, `framer-motion`. Phaser and Leaflet are loaded only when needed, so the first page stays fast.
- Content stays in `src/data/*`, game rules in `src/game/rules`, the Phaser scenes in `src/game/scenes`, and server functions in `src/server/*.functions.ts`.
- This is a large build. I'll do phase 1 next and check it with screenshots, then continue phase by phase, saving after each one.
