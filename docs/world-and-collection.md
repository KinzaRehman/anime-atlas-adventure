# World navigation and anime collection verification

## Completed
- All eight buildings sit off the street network, with connected entrance aprons. Rendering, collision and destination routing share one placement source.
- EasyStar A* routes prefer streets and keep extra clearance at corners. Keyboard and joystick override destination walking. NPCs make small local patrols and yield to nearby characters; they do not roam across districts.
- The map has a Walk to building action without bypassing quest completion or character turn-in.
- Exactly 100 user-requested main franchise cards, 377 verified curated installments, and 100 official API cover assets.
- AniList provides titles, alternative titles, unique synopses, formats, dates, studios, episode counts and scores. Unknown values remain unknown. This is a curated list, not an official ranking.
- Search, genre/year/type/status filters, five collection tabs, five sorts, private favorites, independent episode/movie tracking and resume indicators.
- Existing account-rated decks, sharing preferences, custom cards, device-only shelf and town progress remain untouched.

## Files
- Navigation: `src/game/world.ts`, `navigation.ts`, `TownScene.ts`, `WaterMotion.ts`, `bus.ts`; `src/components/game/TownMap.tsx`, `Minimap.tsx`, `Joystick.tsx`; new painted `streets.jpg`.
- Collection: `src/data/anime-manifest.json`, `anime-metadata.json`, `anime-catalogue.ts`; `src/components/collection/FranchiseCollection.tsx`, `AnimeDecks.tsx`; `src/lib/anime-tracking.ts`; `src/routes/collection.tsx`.
- Private tracking storage: migration `0011_anime_installment_progress.sql` and generated types. Both tables have explicit grants and owner-only RLS.
- Tests: `src/test/navigation.test.ts`, `anime-franchises.test.ts`, and updated `anime-decks.test.ts`.

## Verified
- All 64 district entrance to building door combinations were exercised through the running Phaser scene's movement and collision loop; no solid-object crossings or stuck routes.
- Desktop route to library and phone-sized route to Paper & Pages reached their destinations.
- Phone-sized joystick moved 210 world pixels and returned to idle after release.
- 91 regression tests passed; focused final navigation/catalogue tests passed after adding corner clearance. Latest preview build is successful.
- Browser catalogue contains exactly 100 cards and 100 cover image references; Haikyu search returns one franchise with six installments.
- Signed-in Haikyu episode progress saved as Watching / 3 and read back after reload; favorites read back in a separate signed-in browser context. Test-only writes were restored/removed.
- Sports filter returns 15 franchises. Desktop, tablet and phone layouts had no horizontal overflow; card artwork and detail forms inspected.

## Limitations and maintenance
- Metadata is a committed snapshot fetched November 13, 2026; no repeated API calls occur on page loads. Scores, ongoing episode counts and announced sequels can change. Refresh deliberately through AniList in rate-limited batches and review explicit membership, rather than automatically walking sequel relations.
- Positive installment IDs are MAL IDs. Negative IDs namespace AniList-only releases (including the second Attack on Titan finale special), avoiding invented MAL IDs.
- Remakes, alternate adaptations and selected films remain independently tracked. The curated installment list is not every OVA, recap or franchise film ever released. One Piece uses its actual continuous TV entry, not invented external arc IDs.
- Imported older rated cards stay in the rated-card shelf, without rewriting their titles/ratings or automatically assuming entire-franchise completion. Device-only cards and town XP remain device-local.
- Physical-device touch feel, network-offline behavior, exhaustive external artwork-rights review, and cross-district NPC roaming are not verified/implemented. Cover failures show an intentional labelled fallback.