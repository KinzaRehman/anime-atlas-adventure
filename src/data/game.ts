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
  { id: "sora", name: "Sora", title: "Café Barista", role: "Barista at Yasuragi Café", emoji: "", rarity: "common", hue: "lavender",
    how: "Meet Sora outside the café and win her Café Quiz",
    bio: "Sora knows every regular's order and every anime opening by heart. She hosts quiz nights at the café and says a good question is better than a good latte (almost).",
    likes: ["Opening theme songs", "Melon bread", "Quiz nights"] },
  { id: "tetsu", name: "Tetsu", title: "Quiz Ace", role: "Host of the Trivia Arcade", emoji: "", rarity: "rare", hue: "sage", how: "After helping Sora, meet Tetsu and clear his Arcade challenge", bio: "Tetsu fills notebooks with facts about manga production. He started the neighborhood quiz club so everyone could learn together, and always cheers louder for a friend's answer than his own.", likes: ["Sports manga", "Quiz notebooks", "Teamwork"] },
  { id: "yuzu", name: "Yuzu", title: "Plaza Host", role: "Community Pavilion organizer", emoji: "", rarity: "legendary", hue: "peach", how: "After helping Sora, help Yuzu prepare a welcoming town festival", bio: "Yuzu brings the neighborhood together through sketch swaps and reading circles. Her event cards are handwritten, and she always saves a seat for someone visiting for the first time.", likes: ["Sketch swaps", "Picnics", "Handmade invitations"] },
  { id: "ren", name: "Ren", title: "Workshop Keeper", role: "Sakuragaoka bicycle mechanic", emoji: "", rarity: "rare", hue: "sage", how: "Meet Ren, complete his bicycle safety check, and return for his card", bio: "Ren restores old bicycles for neighbors and believes careful preparation makes every journey better. His workshop is a welcoming place to learn practical skills.", likes: ["Bicycle repairs", "Careful craftsmanship", "Neighborhood rides"] },
  { id: "hana", name: "Hana", title: "Sketch Club Artist", role: "Town Art Studio host", emoji: "", rarity: "rare", hue: "lavender", how: "Meet Hana, complete the sketch club challenge, and return for her card", bio: "Hana draws the quiet details of Sakuragaoka. She welcomes beginners into her studio and shares simple ways to turn everyday observations into original artwork.", likes: ["Original characters", "Sketchbooks", "Drawing town buildings"] },
  { id: "kaito", name: "Kaito", title: "Garden Keeper", role: "Neighborhood greenhouse caretaker", emoji: "", rarity: "rare", hue: "sage", how: "Meet Kaito, prepare the greenhouse seedlings, and return for his card", bio: "Kaito grows seedlings for the neighborhood's shared planters. His patient observation notebooks inspire the backgrounds of the town sketch club.", likes: ["Seedlings", "Nature sketchbooks", "Shared gardens"] },
  { id: "nami", name: "Nami", title: "Paper Storymaker", role: "Paper & Pages craft shop host", emoji: "", rarity: "rare", hue: "pink", how: "Meet Nami, prepare an original town booklet, and return for her card", bio: "Nami turns everyday town stories into handmade booklets. She teaches careful folding and welcomes anyone who wants to share an original idea.", likes: ["Handmade booklets", "Paper crafts", "Original stories"] },
];

export const MOCHI_LINES = {
  intro: ["Oh! A new face in Sakuragaoka. Hello, I'm Mochi, the town librarian.", "A delivery of manga just came in and the genre shelves are all mixed up…", "Could you pop into the library and match each genre to its story? I'll wait right here!"],
  waiting: ["The library is just up the path, the one with the glowing lanterns.", "Match each genre to its story hook and come back to me!"],
  thanks: ["You sorted every shelf? That's amazing, thank you!", "Here, take my librarian card. Now we're officially friends."],
  after: ["Thanks again for the help! More friends will arrive as the town grows."],
};
export const SORA_LINES = {
  locked: ["Hi there! Mochi was looking for someone new. Help her first, then come say hi!"],
  intro: ["Welcome to Yasuragi Café! I'm Sora, the barista.", "Tonight is quiz night, but my quiz partner is late…", "Step inside and answer my Café Quiz. Get them all right and I'll have a surprise for you!"],
  waiting: ["The quiz cards are waiting on the counter inside. You've got this!"],
  thanks: ["A perfect quiz! You really know your anime.", "Here's my barista card. Come by for quiz night anytime!"],
  after: ["The café is always open for friends. More of the town opens soon!"],
};
export const CAFE_QUIZ = [
  { q: "What does 'shōnen' manga typically target?", a: ["Young boys", "Cooking fans", "Retirees"], c: 0 },
  { q: "Manga in Japan is traditionally read…", a: ["Left to right", "Right to left", "Bottom to top"], c: 1 },
  { q: "A 'sensei' usually means…", a: ["Rival", "Snack", "Teacher"], c: 2 },
  { q: "A story's big emotional season ending is called the…", a: ["Finale", "Prologue", "Filler"], c: 0 },
];
export const BADGES: Badge[] = [
  { id: "daily-explorer", name: "Daily Explorer", emoji: "", how: "Complete a daily town mission" },
  { id: "weekly-explorer", name: "Town Trailblazer", emoji: "", how: "Complete a weekly six-building mission" },
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

export type TownFriend = "tetsu" | "yuzu" | "ren" | "hana" | "kaito" | "nami";
export const TOWN_FRIENDS: TownFriend[] = ["tetsu", "yuzu", "ren", "hana", "kaito", "nami"];
export type QuestQuestion = { q: string; a: string[]; c: number };
export const TOWN_QUESTS = {
  kaito: {
    location: "garden", building: "Neighborhood Greenhouse", title: "Kaito's Seedling Trail",
    objective: { find: "Meet Kaito by the northern greenhouse", activity: "Prepare Kaito's seedling trays", return: "Return to Kaito for his card", done: "Kaito's card collected", locked: "Help Sora first" },
    lines: { locked: ["Help Sora at the café first, then visit the greenhouse."], intro: ["Hello, I'm Kaito. These seedlings are for our shared town planters.", "Could you help me prepare three care cards? Take a look inside the greenhouse.", "Come back afterward for my Garden Keeper card."], waiting: ["The seedling care cards are inside the greenhouse."], thanks: ["Our young plants have a thoughtful care plan now!", "Here's my Garden Keeper card. Thank you for helping the neighborhood grow."], after: ["You're welcome to practice the care cards again anytime."] },
    questions: [
      { q: "A seedling tray needs watering. What should you do first?", a: ["Check the soil moisture and the plant's care label", "Flood every tray", "Water only the leaves"], c: 0 },
      { q: "How can you track the plants for the town sketch club?", a: ["Pull them up every day", "Record changes in a dated observation sketchbook", "Guess without looking"], c: 1 },
      { q: "The shared garden has new visitors. What is a thoughtful plan?", a: ["Pick plants without permission", "Block the walking path", "Label the planters and leave a clear accessible path"], c: 2 },
    ],
  },
  nami: {
    location: "paper", building: "Paper & Pages", title: "Nami's Town Storybook",
    objective: { find: "Meet Nami at Paper & Pages", activity: "Prepare Nami's original town booklet", return: "Return to Nami for her card", done: "Nami's card collected", locked: "Help Sora first" },
    lines: { locked: ["Sora needs a quiz partner first. Then visit my paper shop!"], intro: ["I'm Nami! We're making a little booklet about Sakuragaoka.", "Help choose three careful craft decisions inside Paper & Pages.", "Return when the booklet plan is ready and I'll share my Paper Storymaker card."], waiting: ["The booklet planning cards are waiting inside Paper & Pages."], thanks: ["An original town story, ready to share!", "You've earned my Paper Storymaker card. Keep creating your own ideas."], after: ["You can revisit the booklet challenge whenever inspiration strikes."] },
    questions: [
      { q: "What belongs on the cover of your original town booklet?", a: ["Your own title and drawing of the neighborhood", "A copied famous manga cover", "Someone else's artwork without asking"], c: 0 },
      { q: "How do you make a neat paper fold?", a: ["Rush and tear the paper", "Align the edges and press the crease carefully", "Scrunch the whole sheet"], c: 1 },
      { q: "A neighbor contributes a sketch. What should you do before sharing it?", a: ["Remove their name", "Claim you drew it", "Ask permission and include their chosen credit"], c: 2 },
    ],
  },
  ren: {
    location: "workshop", building: "Bicycle Workshop", title: "Ren's Ready-to-Ride Check",
    objective: { find: "Meet Ren at the workshop", activity: "Complete Ren's safety check", return: "Return to Ren for his card", done: "Ren's card collected", locked: "Help Sora first" },
    lines: { locked: ["Help Sora with quiz night first, then come visit the workshop."], intro: ["Hello, I'm Ren! I repair the neighborhood's bicycles.", "Could you help prepare our safety checklist? Three careful choices make a good start.", "Head into the workshop, then return for my Workshop Keeper card."], waiting: ["The safety checklist is inside the workshop."], thanks: ["A thoughtful checklist! Thank you for helping everyone prepare.", "Here is my Workshop Keeper card."], after: ["You're welcome to practice the checklist anytime."] },
    questions: [
      { q: "Before a ride, what should you check?", a: ["Brakes, tires, and a properly fitted helmet", "Only the bicycle's color", "Nothing at all"], c: 0 },
      { q: "A bicycle's brakes feel loose. What is the careful choice?", a: ["Ride faster", "Ask a qualified mechanic before riding", "Ignore it"], c: 1 },
      { q: "Where should a neighborhood ride take place?", a: ["Private driveways without permission", "Busy roads with no plan", "A permitted, safe public route with supervision when needed"], c: 2 },
    ],
  },
  hana: {
    location: "studio", building: "Town Art Studio", title: "Hana's Original Sketch Club",
    objective: { find: "Meet Hana by the art studio", activity: "Prepare Hana's sketch club", return: "Return to Hana for her card", done: "Hana's card collected", locked: "Help Sora first" },
    lines: { locked: ["Sora is preparing quiz night. Help her first, then visit our sketch club."], intro: ["I'm Hana! Welcome to the town's original sketch club.", "We're preparing three drawing cards for new artists.", "Visit the studio and finish them, then come back for my artist card."], waiting: ["The drawing cards are waiting inside the studio."], thanks: ["Our beginners have a wonderful starting point now!", "Here is my Sketch Club Artist card, with thanks."], after: ["The studio is open for another sketch club challenge anytime."] },
    questions: [
      { q: "How do you begin drawing a town building?", a: ["Start with simple shapes and proportions", "Draw every tiny detail first", "Skip observation"], c: 0 },
      { q: "What makes a collectible character original?", a: ["Tracing a copyrighted character", "Your own design, personality, and story", "Changing only a famous character's name"], c: 1 },
      { q: "A new artist asks for feedback. What helps?", a: ["Mock their first attempt", "Compare them to professionals", "Offer one kind, specific suggestion and encouragement"], c: 2 },
    ],
  },
  tetsu: {
    location: "arcade", building: "Trivia Arcade", title: "Tetsu's Knowledge Rally",
    objective: { find: "Meet Tetsu by the western Arcade", activity: "Clear Tetsu's Knowledge Rally", return: "Return to Tetsu for his card", done: "Tetsu's card collected", locked: "Help Sora first" },
    lines: {
      locked: ["Welcome! Sora is looking for a quiz partner. Help her at the café, then join our rally!"],
      intro: ["Hey, I'm Tetsu! I run the Trivia Arcade's quiz club.", "Our Knowledge Rally has five questions about manga and anime. No timer, just curiosity!", "Head inside and clear the rally, then come back for my Quiz Ace card."],
      waiting: ["The Knowledge Rally is waiting inside the Arcade. Every question has another chance if you need it."],
      thanks: ["Five questions cleared! That's the spirit of our quiz club.", "You've earned my Quiz Ace card. Let's keep learning together!"],
      after: ["You're always welcome to replay the rally. Yuzu is preparing something over at the Pavilion!"],
    },
    questions: TRIVIA,
  },
  yuzu: {
    location: "plaza", building: "Community Pavilion", title: "Yuzu's Festival Welcome",
    objective: { find: "Meet Yuzu by the eastern Pavilion", activity: "Prepare Yuzu's Festival Welcome", return: "Return to Yuzu for her card", done: "Yuzu's card collected", locked: "Help Sora first" },
    lines: {
      locked: ["Hello! I'm planning our next gathering. First, help Sora with quiz night at the café."],
      intro: ["Hello, I'm Yuzu! I organize our neighborhood gatherings.", "I'm planning a festival where every anime fan feels welcome. Could you help with three event cards?", "Step into the Pavilion and choose a thoughtful plan for each card. Come back when everything's ready!"],
      waiting: ["The three event cards are inside the Pavilion. A little kindness makes a wonderful festival."],
      thanks: ["Our festival plan is ready! New visitors and longtime friends will feel at home.", "Here's my Plaza Host card, with thanks for bringing everyone together."],
      after: ["The Pavilion is always open. We can plan another gathering anytime!"],
    },
    questions: [
      { q: "Welcome table: a new visitor hasn't watched your favorite series. What goes on their invitation?", a: ["A friendly, spoiler-free introduction", "The ending and every plot twist", "Only fans who finished it may join"], c: 0 },
      { q: "Sketch circle: someone is drawing their very first character. How do you organize the table?", a: ["Only experienced artists can sit here", "Welcome every skill level and share encouragement", "Rank everyone's drawings from worst to best"], c: 1 },
      { q: "Discussion corner: two friends prefer different genres. What should the event card say?", a: ["One genre is the only right answer", "Cancel the conversation", "Take turns, listen, and respect different tastes"], c: 2 },
    ],
  },
} satisfies Record<TownFriend, { location: string; building: string; title: string; objective: Record<string, string>; lines: Record<string, string[]>; questions: QuestQuestion[] }>;

export const TOWN_MAP_QUESTS = [
  { character: "mochi", location: "library", building: "Manga Library", title: "Mochi's Genre Shelves" },
  { character: "sora", location: "cafe", building: "Yasuragi Café", title: "Sora's Café Quiz" },
  ...TOWN_FRIENDS.map((character) => ({ character, ...TOWN_QUESTS[character] })),
];
