# Anime Atlas Adventure

Build a playful, mobile-first anime fandom exploration app called **AnimeAtlas**.
**Live app**: https://anime-atlas-adventure.lovable.app


**Project type:** Interactive exploration game, character collection experience, and anime fandom community.

**Theme:** A cozy, colorful, anime-inspired town where players discover original characters, complete challenges, collect rewards, and connect with other anime fans.

**Who it's for:** Anime fans, casual gamers, collectors, and people who enjoy interactive communities.

**Core experience:**
- Welcome users with a beautiful illustrated town and a Start Exploring button.
- Let users navigate an interactive 2D map containing a Manga Library, Character Café, Trivia Arcade, and Community Plaza.
- Each location opens a unique activity.
- Players earn XP, badges, and collectible original anime-style characters through clear achievements.
- Create a character collection gallery showing unlocked and locked characters.
- Include two virtual characters with friendly, branching conversations about anime, trivia, and recommendations.
- Include a fandom community with example discussions, spoiler tags, and an interactive poll.
- Add an optional GPS discovery mode using browser geolocation with explicit permission. Virtual mode must work without GPS.

**Visual style:** Cozy anime-inspired 2D illustrations, strawberry pink, sage green, warm cream, lavender, and soft peach. Rounded character cards, illustrated buildings, expressive original characters, and playful transitions. Make the interface feel like a polished indie game, not a generic dashboard.

**Technical requirements:** React components, responsive layouts, accessible navigation, reusable game data, persistent progress using localStorage, and clean separation of components, pages, and data. Use sample content for the hackathon prototype. Structure the project so an Express API and MongoDB can be added later.

**Content boundaries:** No magic, fortune-telling, supernatural gameplay, gambling, loot boxes, or romantic chatbot interactions. Focus on friendship, creativity, exploration, knowledge, and wholesome community activities. Do not use copyrighted anime character artwork without permission.

**Accessibility and safety:** Support keyboard navigation, visible focus indicators, reduced motion, readable contrast, and mobile touch targets. Keep GPS optional, never publicly reveal player coordinates, and avoid directing players to unsafe or private locations.

**Screens:** Welcome, Explore, Collection, Fandoms, Character Chat, and Profile.

**Final experience:** Make it enjoyable within the first 30 seconds, with satisfying unlock animations, a clear sense of progression, and reasons to replay. Include a Copy Collection Summary button and a Play Again or Reset Demo button, with a clipboard fallback.

This project was built with [Lovable](https://lovable.dev).


## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/95ef1fcb-4000-4130-ace0-aa57041d8a61).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
