// 30 synthetic test personas. Emails use the reserved .test domain so nothing can ever be delivered.
import type { AvatarConfig } from "@/data/avatar";

export type Archetype = "daily" | "casual" | "character" | "social" | "achiever" | "newbie" | "returning";
export type Voice = "bubbly" | "chill" | "careful" | "terse" | "curious" | "dry";
export interface Persona {
  handle: string; name: string; archetype: Archetype; voice: Voice; genres: string[]; favAnime: string; favChar: string;
  chatWith: "mochi" | "sora"; traits: string[]; joinedDay: number; hour: number; avatar: AvatarConfig;
}
export const ARCHETYPE_LABEL: Record<Archetype, string> = {
  daily: "Daily explorer", casual: "Casual visitor", character: "Character-focused", social: "Social butterfly",
  achiever: "Achievement hunter", newbie: "New or confused", returning: "Returning user",
};
export const TEST_DOMAIN = "animeatlas.test";
export const testEmail = (handle: string) => `sim-${handle}@${TEST_DOMAIN}`;

const cuts = ["cut-long", "cut-short", "cut-bob", "cut-ponytail", "cut-twintails", "cut-buns", "cut-wavy", "cut-sidepart"];
const hairs = ["hair-ink", "hair-chestnut", "hair-honey", "hair-sakura", "hair-lavender", "hair-mint"];
const eyes = ["eyes-brown", "eyes-blue", "eyes-green", "eyes-amber", "eyes-violet"];
const outfits = ["explorer", "uniform", "hoodie", "cardigan", "jacket", "sparkle-hoodie", "star-hoodie", "yukata"];
const shoes = ["sneakers", "loafers", "boots", "high-tops", "sparkle-sneakers", "star-slipons", "platforms"];
const acc = ["none", "hairclip", "headphones", "cap", "scarf", "backpack", "bow", "star-clips", "cat-ears", "charm-bag"];
// Deterministic, distinct combination per index.
const look = (i: number): AvatarConfig => ({
  body: i % 2 ? "boy" : "girl", cut: cuts[i % 8]!, hair: hairs[(i * 5) % 6]!, eyes: eyes[(i * 3) % 5]!,
  glasses: ["no-glasses", "round-glasses", "red-glasses"][(i * 7) % 3]!, outfit: outfits[(i * 3) % 8]!, shoes: shoes[(i * 5) % 7]!, accessory: acc[(i * 7) % 10]!,
});

type Row = [string, string, Archetype, Voice, string, string, string, "mochi" | "sora", string, number, number];
const ROWS: Row[] = [
  ["haru-walks", "Haru (test)", "daily", "bubbly", "Slice of Life,Adventure", "Laid-Back Camp", "Mochi", "mochi", "methodical,early riser", 1, 7],
  ["kenji-maps", "Kenji (test)", "daily", "careful", "Mystery,Sports", "Haikyu!!", "Tetsu", "sora", "completionist,note-taker", 1, 19],
  ["aiko-route", "Aiko (test)", "daily", "curious", "Slice of Life,Art", "A Place Further Than the Universe", "Hana", "mochi", "wanders off-path,asks why", 2, 8],
  ["daichi-run", "Daichi (test)", "daily", "terse", "Sports,Action", "Yowamushi Pedal", "Ren", "sora", "fast,impatient", 3, 6],
  ["mei-lantern", "Mei (test)", "daily", "chill", "Slice of Life,Comedy", "Non Non Biyori", "Kaito", "mochi", "steady,cosy", 4, 21],
  ["riku-sunday", "Riku (test)", "casual", "chill", "Comedy", "Bocchi the Rock!", "Sora", "sora", "drops in on weekends", 2, 15],
  ["nanami-peek", "Nanami (test)", "casual", "curious", "Mystery", "Ace of Diamond", "Yuzu", "mochi", "browses then leaves", 5, 12],
  ["sho-lunch", "Sho (test)", "casual", "terse", "Action,Sports", "Ping Pong the Animation", "Tetsu", "sora", "plays on lunch breaks", 3, 13],
  ["emi-later", "Emi (test)", "casual", "bubbly", "Comedy,Slice of Life", "Chi's Sweet Adventure", "Nami", "mochi", "easily distracted", 6, 20],
  ["takumi-once", "Takumi (test)", "casual", "dry", "Mystery,Mecha", "Shirobako", "Ren", "sora", "skeptical, short visits", 8, 22],
  ["yui-shelves", "Yui (test)", "character", "bubbly", "Slice of Life", "Barakamon", "Mochi", "mochi", "loyal to one character", 1, 18],
  ["sota-quiz", "Sota (test)", "character", "curious", "Comedy,Mystery", "Keep Your Hands Off Eizouken!", "Sora", "sora", "loves quiz banter", 2, 20],
  ["hina-letters", "Hina (test)", "character", "careful", "Art,Slice of Life", "Tamayura", "Mochi", "mochi", "writes long messages", 3, 21],
  ["kaoru-latte", "Kaoru (test)", "character", "chill", "Slice of Life", "Super Cub", "Sora", "sora", "regular at the café", 4, 9],
  ["ren-fan", "Rin (test)", "character", "terse", "Sports", "Run with the Wind", "Ren", "mochi", "tracks friendship levels", 6, 17],
  ["miku-threads", "Miku (test)", "social", "bubbly", "Slice of Life,Comedy", "Laid-Back Camp", "Yuzu", "sora", "starts threads", 1, 20],
  ["jun-replies", "Jun (test)", "social", "dry", "Mystery,Action", "Haikyu!!", "Tetsu", "mochi", "contrarian replier", 2, 22],
  ["sakura-polls", "Sakura (test)", "social", "curious", "Art,Comedy", "Bocchi the Rock!", "Hana", "sora", "votes in every poll", 2, 16],
  ["tomo-likes", "Tomo (test)", "social", "chill", "Sports,Slice of Life", "Tsurune", "Kaito", "mochi", "likes everything, rarely posts", 3, 14],
  ["asuka-helps", "Asuka (test)", "social", "careful", "Slice of Life,Mystery", "Space Brothers", "Mochi", "sora", "answers newcomer questions", 4, 19],
  ["kai-badges", "Kai (test)", "achiever", "terse", "Action,Shounen", "Major", "Tetsu", "sora", "min-maxer", 1, 6],
  ["nao-cards", "Nao (test)", "achiever", "careful", "Slice of Life,Sports", "Encouragement of Climb", "Nami", "mochi", "collects every card", 2, 18],
  ["yuto-streak", "Yuto (test)", "achiever", "bubbly", "Sports,Comedy", "Ao Ashi", "Ren", "sora", "keeps daily streaks", 3, 7],
  ["saki-hundred", "Saki (test)", "achiever", "dry", "Mystery", "Silver Spoon", "Kaito", "mochi", "chases 100%", 5, 23],
  ["momo-lost", "Momo (test)", "newbie", "curious", "Comedy", "Pui Pui Molcar", "Mochi", "mochi", "unsure where to go", 9, 17],
  ["ken-tap", "Ken (test)", "newbie", "terse", "Action", "Days", "Sora", "sora", "taps everything", 12, 21],
  ["lina-first", "Lina (test)", "newbie", "bubbly", "Slice of Life", "Slow Loop", "Yuzu", "mochi", "first anime game", 15, 19],
  ["goro-back", "Goro (test)", "returning", "dry", "Mecha,Mystery", "Space Brothers #0", "Ren", "sora", "leaves for weeks", 1, 22],
  ["chika-again", "Chika (test)", "returning", "bubbly", "Comedy,Art", "Non Non Biyori Repeat", "Hana", "mochi", "comes back for events", 2, 18],
  ["ryo-pause", "Ryo (test)", "returning", "careful", "Sports", "Big Windup!", "Tetsu", "sora", "busy with exams", 3, 20],
];
export const PERSONAS: Persona[] = ROWS.map(([handle, name, archetype, voice, g, favAnime, favChar, chatWith, t, joinedDay, hour], i) => ({
  handle, name, archetype, voice, genres: g.split(","), favAnime, favChar, chatWith, traits: t.split(","), joinedDay, hour, avatar: look(i),
}));
