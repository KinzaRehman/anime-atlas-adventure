// Avatar options + layered SVG renderer shared by the React editor and the Phaser player sprite.
export type AvatarSlot = "body" | "hair" | "eyes" | "glasses" | "outfit" | "shoes" | "accessory";
export interface AvatarConfig { body: string; hair: string; eyes: string; glasses: string; outfit: string; shoes: string; accessory: string; }
export interface AvatarOption { id: string; slot: AvatarSlot; name: string; price: number; colors: string[]; }
const o = (slot: AvatarSlot, id: string, name: string, price: number, ...colors: string[]): AvatarOption => ({ id, slot, name, price, colors });

export const AVATAR_OPTIONS: AvatarOption[] = [
  o("body", "girl", "Girl", 0), o("body", "boy", "Boy", 0),
  o("hair", "hair-ink", "Ink black", 0, "#2b2430", "#4a3f52"), o("hair", "hair-chestnut", "Chestnut", 0, "#6b3f2a", "#93593b"),
  o("hair", "hair-honey", "Honey blond", 0, "#d7a24e", "#f0c878"), o("hair", "hair-sakura", "Sakura pink", 40, "#e58fa8", "#f6bfcf"),
  o("hair", "hair-lavender", "Lavender", 40, "#9a86c9", "#c3b5e6"), o("hair", "hair-mint", "Matcha mint", 60, "#6fa98a", "#a5d4b7"),
  o("eyes", "eyes-brown", "Warm brown", 0, "#6b4128"), o("eyes", "eyes-blue", "Sky blue", 0, "#3d7fc2"),
  o("eyes", "eyes-green", "Leaf green", 0, "#3f8a5a"), o("eyes", "eyes-amber", "Amber", 30, "#c9862b"), o("eyes", "eyes-violet", "Violet", 30, "#7b55b8"),
  o("glasses", "no-glasses", "No glasses", 0), o("glasses", "round-glasses", "Round glasses", 0, "#3a3340"),
  o("glasses", "red-glasses", "Red frames", 35, "#c9474f"),
  o("outfit", "uniform", "School uniform", 0, "#2f3a5c", "#f6f1e7", "#c9474f"), o("outfit", "hoodie", "Cosy hoodie", 0, "#8fae8b", "#3b3a44", "#f6f1e7"),
  o("outfit", "cardigan", "Library cardigan", 50, "#d9a0ae", "#4a4458", "#fff7ec"), o("outfit", "jacket", "Festival jacket", 80, "#2f6d73", "#2a2833", "#f0c878"),
  o("outfit", "yukata", "Summer yukata", 120, "#4e5f9e", "#4e5f9e", "#f4b8c6"),
  o("shoes", "sneakers", "Sneakers", 0, "#f6f1e7", "#c9474f"), o("shoes", "loafers", "Loafers", 0, "#4a2e22", "#2a1c16"),
  o("shoes", "boots", "Rain boots", 40, "#e2b84a", "#a5822c"), o("shoes", "high-tops", "High-tops", 60, "#3b3a44", "#f6f1e7"),
  o("accessory", "none", "None", 0), o("accessory", "hairclip", "Sakura hairclip", 0, "#f4b8c6"),
  o("accessory", "headphones", "Headphones", 50, "#3b3a44", "#e58fa8"), o("accessory", "cap", "Explorer cap", 60, "#c9474f", "#f6f1e7"),
  o("accessory", "scarf", "Knit scarf", 70, "#e2b84a", "#c98a2b"), o("accessory", "backpack", "Travel backpack", 90, "#6fa98a", "#4f7c63"),
];
export const SLOTS: { slot: AvatarSlot; label: string }[] = [
  { slot: "body", label: "Style" }, { slot: "hair", label: "Hair" }, { slot: "eyes", label: "Eyes" }, { slot: "glasses", label: "Glasses" },
  { slot: "outfit", label: "Outfit" }, { slot: "shoes", label: "Shoes" }, { slot: "accessory", label: "Accessory" },
];
export const DEFAULT_AVATAR: AvatarConfig = { body: "girl", hair: "hair-ink", eyes: "eyes-brown", glasses: "no-glasses", outfit: "uniform", shoes: "sneakers", accessory: "none" };
export const avatarOption = (id: string) => AVATAR_OPTIONS.find((x) => x.id === id);
const c = (id: string, i = 0, fb = "#888") => avatarOption(id)?.colors[i] ?? fb;

/** Returns an SVG string (viewBox 100x270, feet at bottom). */
export function avatarSvg(a: AvatarConfig): string {
  const girl = a.body === "girl", skin = "#f6dcc8", skinS = "#e9bfa6";
  const [h, hl] = [c(a.hair), c(a.hair, 1)], eye = c(a.eyes);
  const [top, bottom, trim] = [c(a.outfit), c(a.outfit, 1), c(a.outfit, 2)];
  const [s1, s2] = [c(a.shoes), c(a.shoes, 1)];
  const parts: string[] = [];
  if (a.accessory === "backpack") parts.push(`<rect x="22" y="122" width="56" height="62" rx="12" fill="${c(a.accessory, 1)}"/>`);
  if (girl) parts.push(`<path d="M18 70 Q14 150 26 158 L74 158 Q86 150 82 70 Z" fill="${h}"/>`);
  // legs
  const legH = a.shoes === "boots" ? 236 : 252;
  parts.push(`<rect x="36" y="196" width="11" height="${legH - 196 + 6}" fill="${girl && a.outfit !== "yukata" ? skin : bottom}"/><rect x="53" y="196" width="11" height="${legH - 196 + 6}" fill="${girl && a.outfit !== "yukata" ? skin : bottom}"/>`);
  // shoes
  if (a.shoes === "boots") parts.push(`<rect x="33" y="232" width="16" height="30" rx="4" fill="${s1}"/><rect x="51" y="232" width="16" height="30" rx="4" fill="${s1}"/>`);
  else if (a.shoes === "high-tops") parts.push(`<rect x="33" y="246" width="16" height="16" rx="4" fill="${s1}"/><rect x="51" y="246" width="16" height="16" rx="4" fill="${s1}"/>`);
  else parts.push(`<rect x="32" y="252" width="18" height="10" rx="5" fill="${s1}"/><rect x="50" y="252" width="18" height="10" rx="5" fill="${s1}"/>`);
  parts.push(`<rect x="31" y="261" width="20" height="5" rx="2" fill="${s2}"/><rect x="49" y="261" width="20" height="5" rx="2" fill="${s2}"/>`);
  // bottom garment
  if (a.outfit === "yukata") parts.push(`<path d="M30 180 L70 180 L72 246 L28 246 Z" fill="${top}"/><path d="M50 180 L52 246" stroke="${trim}" stroke-width="2"/>`);
  else if (girl) parts.push(`<path d="M30 176 L70 176 L78 212 L22 212 Z" fill="${bottom}"/>`);
  else parts.push(`<rect x="33" y="176" width="34" height="30" fill="${bottom}"/>`);
  // arms + torso
  parts.push(`<rect x="20" y="124" width="12" height="54" rx="6" fill="${top}"/><rect x="68" y="124" width="12" height="54" rx="6" fill="${top}"/><circle cx="26" cy="182" r="6" fill="${skin}"/><circle cx="74" cy="182" r="6" fill="${skin}"/>`);
  parts.push(`<path d="M30 122 Q50 114 70 122 L70 182 L30 182 Z" fill="${top}"/><rect x="45" y="108" width="10" height="12" fill="${skinS}"/>`);
  if (a.outfit === "uniform") parts.push(`<path d="M40 120 L50 136 L60 120" fill="${trim === "#c9474f" ? "#f6f1e7" : trim}"/><path d="M47 132 L53 132 L52 152 L48 152 Z" fill="${trim}"/>`);
  if (a.outfit === "hoodie") parts.push(`<path d="M36 122 Q50 134 64 122" stroke="${trim}" stroke-width="3" fill="none"/><rect x="38" y="156" width="24" height="12" rx="3" fill="${bottom}" opacity=".25"/>`);
  if (a.outfit === "cardigan") parts.push(`<rect x="44" y="120" width="12" height="62" fill="${trim}"/><circle cx="50" cy="140" r="1.6" fill="${bottom}"/><circle cx="50" cy="152" r="1.6" fill="${bottom}"/><circle cx="50" cy="164" r="1.6" fill="${bottom}"/>`);
  if (a.outfit === "jacket") parts.push(`<path d="M50 120 L50 182" stroke="${trim}" stroke-width="2"/><rect x="30" y="170" width="40" height="5" fill="${trim}"/>`);
  if (a.outfit === "yukata") parts.push(`<path d="M38 120 L56 160" stroke="${trim}" stroke-width="4"/><rect x="30" y="160" width="40" height="10" fill="${trim}"/>`);
  if (a.accessory === "scarf") parts.push(`<rect x="34" y="112" width="32" height="12" rx="6" fill="${c(a.accessory)}"/><rect x="56" y="118" width="9" height="26" rx="3" fill="${c(a.accessory, 1)}"/>`);
  if (a.accessory === "backpack") parts.push(`<rect x="32" y="122" width="5" height="50" fill="${c(a.accessory, 1)}"/><rect x="63" y="122" width="5" height="50" fill="${c(a.accessory, 1)}"/>`);
  // head
  parts.push(`<ellipse cx="50" cy="76" rx="31" ry="33" fill="${skin}"/>`);
  // eyes
  for (const x of [38, 62]) parts.push(`<ellipse cx="${x}" cy="82" rx="6" ry="8" fill="#2b2430"/><ellipse cx="${x}" cy="83.5" rx="4.6" ry="6" fill="${eye}"/><circle cx="${x - 1.8}" cy="79.5" r="2" fill="#fff"/><path d="M${x - 7} 72.5 Q${x} 69.5 ${x + 7} 72.5" stroke="#2b2430" stroke-width="2" fill="none"/>`);
  parts.push(`<ellipse cx="31" cy="94" rx="5" ry="2.6" fill="#f2a7b5" opacity=".6"/><ellipse cx="69" cy="94" rx="5" ry="2.6" fill="#f2a7b5" opacity=".6"/><path d="M45 99 Q50 103 55 99" stroke="#a5525e" stroke-width="2" fill="none" stroke-linecap="round"/>`);
  if (a.glasses !== "no-glasses") { const g = c(a.glasses); parts.push(`<circle cx="38" cy="82" r="10" stroke="${g}" stroke-width="2.4" fill="#fff" fill-opacity=".12"/><circle cx="62" cy="82" r="10" stroke="${g}" stroke-width="2.4" fill="#fff" fill-opacity=".12"/><path d="M48 82 L52 82" stroke="${g}" stroke-width="2.4"/>`); }
  // front hair
  if (girl) parts.push(`<path d="M17 80 Q14 38 50 38 Q86 38 83 80 Q76 58 64 54 Q60 66 48 66 Q40 60 38 52 Q26 60 17 80 Z" fill="${h}"/>`);
  else parts.push(`<path d="M18 74 Q16 36 50 37 Q84 36 82 74 Q78 60 70 56 L66 66 L58 56 L50 66 L42 56 L34 66 L30 56 Q22 62 18 74 Z" fill="${h}"/>`);
  parts.push(`<path d="M30 48 Q50 40 70 48" stroke="${hl}" stroke-width="3" fill="none" opacity=".8" stroke-linecap="round"/>`);
  if (a.accessory === "hairclip") parts.push(`<g transform="translate(72 56)">${[0, 72, 144, 216, 288].map((r) => `<ellipse cx="0" cy="-4" rx="3" ry="4.5" fill="${c(a.accessory)}" transform="rotate(${r})"/>`).join("")}<circle r="2" fill="#e2b84a"/></g>`);
  if (a.accessory === "headphones") parts.push(`<path d="M18 74 Q18 30 50 30 Q82 30 82 74" stroke="${c(a.accessory)}" stroke-width="5" fill="none"/><rect x="11" y="68" width="12" height="20" rx="5" fill="${c(a.accessory, 1)}"/><rect x="77" y="68" width="12" height="20" rx="5" fill="${c(a.accessory, 1)}"/>`);
  if (a.accessory === "cap") parts.push(`<path d="M18 56 Q20 30 50 30 Q80 30 82 56 Z" fill="${c(a.accessory)}"/><path d="M50 52 Q80 50 92 58 L52 58 Z" fill="${c(a.accessory)}"/><circle cx="50" cy="31" r="3" fill="${c(a.accessory, 1)}"/>`);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 270" width="100" height="270">${parts.join("")}</svg>`;
}
export const avatarDataUrl = (a: AvatarConfig) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(avatarSvg(a))}`;
