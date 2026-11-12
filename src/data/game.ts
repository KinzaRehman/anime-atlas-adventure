// Reusable game content. Shapes mirror future API/Mongo documents (id-keyed).
export type Rarity = "common" | "rare" | "legendary";
export interface Collectible { id: string; name: string; title: string; emoji: string; rarity: Rarity; hue: "pink" | "sage" | "lavender" | "peach"; how: string; }
export interface Badge { id: string; name: string; emoji: string; how: string; }
export interface Location { id: string; name: string; emoji: string; blurb: string; x: number; y: number; }

export const LOCATIONS: Location[] = [
  { id: "library", name: "Manga Library", emoji: "📚", blurb: "Match manga genres to their story hooks.", x: 26, y: 22 },
  { id: "cafe", name: "Character Café", emoji: "☕", blurb: "Chat with Mochi & Sora over a warm latte.", x: 76, y: 22 },
  { id: "arcade", name: "Trivia Arcade", emoji: "⭐", blurb: "Test your anime knowledge for XP.", x: 24, y: 66 },
  { id: "plaza", name: "Community Plaza", emoji: "⛲", blurb: "Join discussions and vote in polls.", x: 74, y: 70 },
];

export interface Character extends Collectible { portrait?: string; role: string; bio: string; likes: string[]; }
// Discoverable characters. `portrait` is filled in by the UI layer (asset imports).
export const COLLECTIBLES: Character[] = [
  { id: "mochi", name: "Mochi", title: "Manga Librarian", role: "Keeper of the Sakuragaoka Library", emoji: "", rarity: "rare", hue: "pink",
    how: "Find Mochi by the fountain and help her at the library",
    bio: "Mochi has read every volume on the library's shelves at least twice. She runs the Sunday sketch club and believes every reader deserves a story that feels like home.",
    likes: ["Slice-of-life manga", "Strawberry milk", "Drawing tiny buildings"] },
  { id: "sora", name: "Sora", title: "Café Barista", role: "Arrives with the Café district", emoji: "", rarity: "common", hue: "lavender", how: "Arrives with the Café district", bio: "", likes: [] },
  { id: "tetsu", name: "Tetsu", title: "Quiz Ace", role: "Arrives with the Arcade district", emoji: "", rarity: "rare", hue: "sage", how: "Arrives with the Arcade district", bio: "", likes: [] },
  { id: "yuzu", name: "Yuzu", title: "Plaza Host", role: "Arrives with the Plaza district", emoji: "", rarity: "legendary", hue: "peach", how: "Arrives with the Plaza district", bio: "", likes: [] },
];

export const MOCHI_LINES = {
  intro: ["Oh! A new face in Sakuragaoka. Hello, I'm Mochi, the town librarian.", "A delivery of manga just came in and the genre shelves are all mixed up…", "Could you pop into the library and match each genre to its story? I'll wait right here!"],
  waiting: ["The library is just up the path, the one with the glowing lanterns.", "Match each genre to its story hook and come back to me!"],
  thanks: ["You sorted every shelf? That's amazing, thank you!", "Here, take my librarian card. Now we're officially friends."],
  after: ["Thanks again for the help! More friends will arrive as the town grows."],
};
export const BADGES: Badge[] = [
  { id: "first-steps", name: "First Steps", emoji: "👣", how: "Start exploring" },
  { id: "bookworm", name: "Bookworm", emoji: "📖", how: "Complete the library match" },
  { id: "trivia-star", name: "Trivia Star", emoji: "🌟", how: "Perfect trivia score" },
  { id: "friendly", name: "Friendly Chat", emoji: "💬", how: "Talk with both café friends" },
  { id: "voice", name: "Community Voice", emoji: "🗳️", how: "Vote in a poll" },
  { id: "explorer", name: "New Friend", emoji: "🗺️", how: "Befriend your first character" },
];

export const TRIVIA = [
  { q: "What does 'shōnen' manga typically target?", a: ["Young boys", "Cooking fans", "Retirees", "Toddlers"], c: 0 },
  { q: "Manga in Japan is traditionally read…", a: ["Left to right", "Right to left", "Bottom to top", "Diagonally"], c: 1 },
  { q: "A 'sensei' usually means…", a: ["Teacher", "Rival", "Snack", "Sidekick"], c: 0 },
  { q: "What is an 'OVA'?", a: ["A video release", "A type of ramen", "A dance", "A sword"], c: 0 },
  { q: "'Slice of life' stories focus on…", a: ["Everyday moments", "Space wars", "Giant robots only", "Pirates only"], c: 0 },
];

export const GENRE_MATCH = [
  { genre: "Sports", hook: "A team trains all summer for the regional finals." },
  { genre: "Slice of Life", hook: "Two roommates open a tiny bakery." },
  { genre: "Mecha", hook: "Pilots repair a giant robot after a storm." },
  { genre: "Mystery", hook: "A student club solves who borrowed the library key." },
];

export const DISCUSSIONS = [
  { id: "d1", author: "pastelpanda", avatar: "🐼", title: "Comfort anime for rainy days?", body: "Looking for cozy slice-of-life shows with found-family vibes. Drop your picks!", spoiler: null, likes: 24 },
  { id: "d2", author: "inkbrush", avatar: "🖌️", title: "That finale twist though", body: "I can't stop thinking about the last episode.", spoiler: "The quiet side character was the team's original captain all along!", likes: 41 },
  { id: "d3", author: "matchalatte", avatar: "🍵", title: "Fan art Friday 🎨", body: "Share original sketches of your own characters — all skill levels welcome.", spoiler: null, likes: 18 },
];

export const POLL = { q: "Which genre should the next town festival celebrate?", options: ["Slice of Life", "Sports", "Mecha", "Mystery"], base: [34, 21, 15, 18] };

export type ChatNode = { text: string; options: { label: string; next: string }[] };
export const CHAT: Record<"mochi" | "sora", { name: string; role: string; nodes: { start: ChatNode; [k: string]: ChatNode } }> = {
  mochi: { name: "Mochi", role: "Manga Librarian", nodes: {
    start: { text: "Hi hi! I'm Mochi 📚 What should we talk about today?", options: [{ label: "Recommend me something", next: "rec" }, { label: "Fun manga fact!", next: "fact" }, { label: "What do you like to draw?", next: "draw" }] },
    rec: { text: "Cozy or exciting? I always have a stack ready!", options: [{ label: "Cozy please", next: "cozy" }, { label: "Exciting!", next: "exciting" }] },
    cozy: { text: "Try a slice-of-life series about a small-town café — gentle humor and great friendships. ☕", options: [{ label: "Another topic", next: "start" }] },
    exciting: { text: "A sports story about an underdog team is perfect — training arcs are SO satisfying!", options: [{ label: "Another topic", next: "start" }] },
    fact: { text: "Weekly manga magazines can be as thick as a phone book, packed with dozens of series!", options: [{ label: "Whoa, more!", next: "fact2" }, { label: "Another topic", next: "start" }] },
    fact2: { text: "Many artists begin as assistants, drawing backgrounds for other creators. Teamwork!", options: [{ label: "Another topic", next: "start" }] },
    draw: { text: "Little town buildings! Want a tip? Start with simple shapes, then add cozy details like flower boxes.", options: [{ label: "Thanks, Mochi!", next: "start" }] },
  }},
  sora: { name: "Sora", role: "Café Barista", nodes: {
    start: { text: "Welcome to the café! I'm Sora ☕ Quiz time or chat time?", options: [{ label: "Quiz me!", next: "quiz" }, { label: "Best anime snacks?", next: "snack" }, { label: "How do I make friends here?", next: "friends" }] },
    quiz: { text: "Quick one: what's the word for a story's big, emotional season ending?", options: [{ label: "A finale", next: "right" }, { label: "A sandwich", next: "wrong" }] },
    right: { text: "Correct! You're a natural. Come back for the Trivia Arcade too!", options: [{ label: "Another topic", next: "start" }] },
    wrong: { text: "Haha, tasty guess! It's a finale. Let's try the arcade for more practice.", options: [{ label: "Another topic", next: "start" }] },
    snack: { text: "Onigiri, melon bread and strawberry milk — classic watch-party fuel! 🍙", options: [{ label: "Another topic", next: "start" }] },
    friends: { text: "Hop over to the Community Plaza! Share a favorite show and be kind — that's the café rule.", options: [{ label: "Got it!", next: "start" }] },
  }},
};

export const XP_PER_LEVEL = 100;
