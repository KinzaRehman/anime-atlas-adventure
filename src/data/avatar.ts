// Avatar wardrobe content; illustrated rendering lives in the shared avatar-art module.
export type AvatarSlot = "body" | "cut" | "hair" | "eyes" | "glasses" | "outfit" | "shoes" | "accessory";
export interface AvatarConfig { body: string; cut: string; hair: string; eyes: string; glasses: string; outfit: string; shoes: string; accessory: string; }
export interface AvatarOption { id: string; slot: AvatarSlot; name: string; price: number; colors: string[]; }
const o = (slot: AvatarSlot, id: string, name: string, price: number, ...colors: string[]): AvatarOption => ({ id, slot, name, price, colors });

export const AVATAR_OPTIONS: AvatarOption[] = [
  o("body", "girl", "Girl", 0), o("body", "boy", "Boy", 0),
  o("cut", "cut-long", "Long & straight", 0), o("cut", "cut-short", "Short & spiky", 0), o("cut", "cut-bob", "Neat bob", 0),
  o("cut", "cut-ponytail", "High ponytail", 0), o("cut", "cut-twintails", "Twin tails", 40), o("cut", "cut-buns", "Space buns", 40),
  o("cut", "cut-wavy", "Soft waves", 60), o("cut", "cut-sidepart", "Side-swept fringe", 50),
  o("hair", "hair-ink", "Ink black", 0, "#2b2430", "#4a3f52"), o("hair", "hair-chestnut", "Chestnut", 0, "#6b3f2a", "#93593b"),
  o("hair", "hair-honey", "Honey blond", 0, "#d7a24e", "#f0c878"), o("hair", "hair-sakura", "Sakura pink", 40, "#e58fa8", "#f6bfcf"),
  o("hair", "hair-lavender", "Lavender", 40, "#9a86c9", "#c3b5e6"), o("hair", "hair-mint", "Matcha mint", 60, "#6fa98a", "#a5d4b7"),
  o("eyes", "eyes-brown", "Warm brown", 0, "#6b4128"), o("eyes", "eyes-blue", "Sky blue", 0, "#3d7fc2"),
  o("eyes", "eyes-green", "Leaf green", 0, "#3f8a5a"), o("eyes", "eyes-amber", "Amber", 30, "#c9862b"), o("eyes", "eyes-violet", "Violet", 30, "#7b55b8"),
  o("glasses", "no-glasses", "No glasses", 0), o("glasses", "round-glasses", "Round glasses", 0, "#3a3340"),
  o("glasses", "red-glasses", "Red frames", 35, "#c9474f"),
  o("outfit", "explorer", "Original explorer", 0, "#f6f1e7", "#8fa678", "#6b563f"),
  o("outfit", "uniform", "School uniform", 0, "#2f3a5c", "#f6f1e7", "#c9474f"), o("outfit", "hoodie", "Cosy hoodie", 0, "#8fae8b", "#3b3a44", "#f6f1e7"),
  o("outfit", "cardigan", "Library cardigan", 50, "#d9a0ae", "#4a4458", "#fff7ec"), o("outfit", "jacket", "Festival jacket", 80, "#2f6d73", "#2a2833", "#f0c878"),
  o("outfit", "sparkle-hoodie", "Pink sparkle hoodie", 70, "#f29bb8", "#4a4458", "#fff4c9"),
  o("outfit", "star-hoodie", "Starlight hoodie", 90, "#b7a5e8", "#3b3a5c", "#fff4c9"),
  o("outfit", "yukata", "Summer yukata", 120, "#4e5f9e", "#4e5f9e", "#f4b8c6"),
  o("shoes", "sneakers", "Sneakers", 0, "#f6f1e7", "#c9474f"), o("shoes", "loafers", "Loafers", 0, "#4a2e22", "#2a1c16"),
  o("shoes", "boots", "Rain boots", 40, "#e2b84a", "#a5822c"), o("shoes", "high-tops", "High-tops", 60, "#3b3a44", "#f6f1e7"),
  o("shoes", "sparkle-sneakers", "Glitter sneakers", 50, "#f6b3c8", "#fff4c9"), o("shoes", "star-slipons", "Star slip-ons", 45, "#b7a5e8", "#fff4c9"),
  o("shoes", "platforms", "Pastel platforms", 70, "#fff7ec", "#f29bb8"),
  o("accessory", "none", "None", 0), o("accessory", "hairclip", "Sakura hairclip", 0, "#f4b8c6"),
  o("accessory", "headphones", "Headphones", 50, "#3b3a44", "#e58fa8"), o("accessory", "cap", "Explorer cap", 60, "#c9474f", "#f6f1e7"),
  o("accessory", "scarf", "Knit scarf", 70, "#e2b84a", "#c98a2b"), o("accessory", "backpack", "Travel backpack", 90, "#6fa98a", "#4f7c63"),
  o("accessory", "bow", "Sparkle ribbon bow", 40, "#f29bb8", "#fff4c9"), o("accessory", "star-clips", "Star clips", 35, "#f0c878", "#fff4c9"),
  o("accessory", "cat-ears", "Cat-ear headband", 60, "#3b3a44", "#f6bfcf"), o("accessory", "charm-bag", "Sakura charm bag", 55, "#f6bfcf", "#c9474f"),
];
export const SLOTS: { slot: AvatarSlot; label: string }[] = [
  { slot: "body", label: "Style" }, { slot: "cut", label: "Hairstyle" }, { slot: "hair", label: "Hair colour" }, { slot: "eyes", label: "Eyes" }, { slot: "glasses", label: "Glasses" },
  { slot: "outfit", label: "Outfit" }, { slot: "shoes", label: "Shoes" }, { slot: "accessory", label: "Accessory" },
];
export const DEFAULT_AVATAR: AvatarConfig = { body: "girl", cut: "cut-long", hair: "hair-ink", eyes: "eyes-brown", glasses: "no-glasses", outfit: "uniform", shoes: "sneakers", accessory: "none" };
export const avatarOption = (id: string) => AVATAR_OPTIONS.find((x) => x.id === id);
export const isSparkly = (a: AvatarConfig) => ["sparkle-hoodie", "star-hoodie"].includes(a.outfit) || ["sparkle-sneakers", "star-slipons"].includes(a.shoes) || ["bow", "star-clips"].includes(a.accessory);
