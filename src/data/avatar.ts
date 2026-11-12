// Avatar options + layered SVG renderer shared by the React editor and the Phaser player sprite.
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
const star = (x: number, y: number, r: number, fill: string, d = 0) => `<path class="tw" style="animation-delay:${d}s" d="M${x} ${y - r} Q${x} ${y} ${x + r} ${y} Q${x} ${y} ${x} ${y + r} Q${x} ${y} ${x - r} ${y} Q${x} ${y} ${x} ${y - r} Z" fill="${fill}"/>`;
const STYLE = `<style>.b{animation:br 2.6s ease-in-out infinite;transform-origin:50px 266px}@keyframes br{50%{transform:translateY(1.5px) scaleY(.99)}}.e{animation:bl 4.5s infinite;transform-box:fill-box;transform-origin:center}@keyframes bl{0%,93%,100%{transform:scaleY(1)}96%{transform:scaleY(.1)}}.hs{animation:sw 3.2s ease-in-out infinite;transform-box:fill-box;transform-origin:50% 0}@keyframes sw{50%{transform:rotate(4deg)}}.tw{animation:tw 1.8s ease-in-out infinite;transform-box:fill-box;transform-origin:center}@keyframes tw{0%,100%{opacity:.25;transform:scale(.4)}50%{opacity:1;transform:scale(1)}}.wv{animation:wv 2.6s ease-in-out infinite;transform-origin:74px 126px}@keyframes wv{0%,70%,100%{transform:rotate(0)}80%{transform:rotate(-14deg)}90%{transform:rotate(4deg)}}@media (prefers-reduced-motion:reduce){*{animation:none!important}}</style>`;
const trimTie = (a: AvatarConfig) => (a.accessory === "bow" ? "#f29bb8" : "#c9474f");
const c = (id: string, i = 0, fb = "#888") => avatarOption(id)?.colors[i] ?? fb;

/** Returns an SVG string (viewBox 100x270, feet at bottom). */
export function avatarSvg(a: AvatarConfig): string {
  const girl = a.body === "girl", skin = "#f6dcc8", skinS = "#e9bfa6";
  const [h, hl] = [c(a.hair), c(a.hair, 1)], eye = c(a.eyes);
  const [top, bottom, trim] = [c(a.outfit), c(a.outfit, 1), c(a.outfit, 2)];
  const [s1, s2] = [c(a.shoes), c(a.shoes, 1)];
  const parts: string[] = [];
  if (a.accessory === "backpack") parts.push(`<rect x="22" y="122" width="56" height="62" rx="12" fill="${c(a.accessory, 1)}"/>`);
  const cut = a.cut ?? (girl ? "cut-long" : "cut-short");
  // back hair
  if (cut === "cut-long" || cut === "cut-sidepart") parts.push(`<path class="hs" d="M18 70 Q14 150 26 158 L74 158 Q86 150 82 70 Z" fill="${h}"/>`);
  if (cut === "cut-wavy") parts.push(`<path class="hs" d="M18 70 Q8 100 18 120 Q8 140 24 162 Q36 156 50 164 Q64 156 76 162 Q92 140 82 120 Q92 100 82 70 Z" fill="${h}"/>`);
  if (cut === "cut-bob") parts.push(`<path d="M17 70 Q14 112 24 116 L76 116 Q86 112 83 70 Z" fill="${h}"/>`);
  if (cut === "cut-ponytail") parts.push(`<path class="hs" d="M70 50 Q98 56 92 104 Q88 132 76 140 Q84 108 72 70 Z" fill="${h}"/>`);
  if (cut === "cut-twintails") for (const [x, dx] of [[16, -1], [84, 1]] as const) parts.push(`<path class="hs" d="M${x} 62 Q${x + dx * 16} 92 ${x + dx * 8} 140 Q${x + dx * 2} 150 ${x - dx * 2} 132 Q${x + dx * 2} 100 ${x - dx * 4} 70 Z" fill="${h}"/><circle cx="${x}" cy="64" r="4" fill="${trimTie(a)}"/>`);
  // legs
  const legH = a.shoes === "boots" ? 236 : 252;
  parts.push(`<rect x="36" y="196" width="11" height="${legH - 196 + 6}" fill="${girl && a.outfit !== "yukata" ? skin : bottom}"/><rect x="53" y="196" width="11" height="${legH - 196 + 6}" fill="${girl && a.outfit !== "yukata" ? skin : bottom}"/>`);
  // shoes
  if (a.shoes === "boots") parts.push(`<rect x="33" y="232" width="16" height="30" rx="4" fill="${s1}"/><rect x="51" y="232" width="16" height="30" rx="4" fill="${s1}"/>`);
  else if (a.shoes === "platforms") parts.push(`<rect x="32" y="248" width="18" height="12" rx="5" fill="${s1}"/><rect x="50" y="248" width="18" height="12" rx="5" fill="${s1}"/>`);
  else if (a.shoes === "high-tops") parts.push(`<rect x="33" y="246" width="16" height="16" rx="4" fill="${s1}"/><rect x="51" y="246" width="16" height="16" rx="4" fill="${s1}"/>`);
  else parts.push(`<rect x="32" y="252" width="18" height="10" rx="5" fill="${s1}"/><rect x="50" y="252" width="18" height="10" rx="5" fill="${s1}"/>`);
  parts.push(`<rect x="31" y="261" width="20" height="5" rx="2" fill="${s2}"/><rect x="49" y="261" width="20" height="5" rx="2" fill="${s2}"/>`);
  if (a.shoes === "sparkle-sneakers" || a.shoes === "star-slipons") parts.push(([[38, 256], [58, 256], [44, 259]] as const).map(([x, y], i) => star(x, y, 2.6, "#fff", i * 0.5)).join(""));
  if (a.shoes === "star-slipons") parts.push(star(40, 255, 3.4, s2, 0.2) + star(60, 255, 3.4, s2, 0.9));
  // bottom garment
  if (a.outfit === "yukata") parts.push(`<path d="M30 180 L70 180 L72 246 L28 246 Z" fill="${top}"/><path d="M50 180 L52 246" stroke="${trim}" stroke-width="2"/>`);
  else if (girl) parts.push(`<path d="M30 176 L70 176 L78 212 L22 212 Z" fill="${bottom}"/>`);
  else parts.push(`<rect x="33" y="176" width="34" height="30" fill="${bottom}"/>`);
  // arms + torso
  parts.push(`<rect x="20" y="124" width="12" height="54" rx="6" fill="${top}"/><circle cx="26" cy="182" r="6" fill="${skin}"/><g class="wv"><rect x="68" y="124" width="12" height="54" rx="6" fill="${top}"/><circle cx="74" cy="182" r="6" fill="${skin}"/></g>`);
  parts.push(`<path d="M30 122 Q50 114 70 122 L70 182 L30 182 Z" fill="${top}"/><rect x="45" y="108" width="10" height="12" fill="${skinS}"/>`);
  if (a.outfit === "uniform") parts.push(`<path d="M40 120 L50 136 L60 120" fill="${trim === "#c9474f" ? "#f6f1e7" : trim}"/><path d="M47 132 L53 132 L52 152 L48 152 Z" fill="${trim}"/>`);
  if (a.outfit === "hoodie") parts.push(`<path d="M36 122 Q50 134 64 122" stroke="${trim}" stroke-width="3" fill="none"/><rect x="38" y="156" width="24" height="12" rx="3" fill="${bottom}" opacity=".25"/>`);
  if (a.outfit === "sparkle-hoodie" || a.outfit === "star-hoodie") {
    parts.push(`<path d="M30 124 Q50 104 70 124 Q50 132 30 124 Z" fill="${top}" opacity=".85"/><path d="M42 126 L41 142 M58 126 L59 142" stroke="${trim}" stroke-width="2" stroke-linecap="round"/><rect x="36" y="156" width="28" height="14" rx="4" fill="#fff" opacity=".25"/>`);
    parts.push(([[38, 146, 4], [62, 136, 3.4], [56, 172, 3], [26, 150, 2.6], [74, 162, 2.6], [46, 164, 2.2]] as const).map(([x, y, r], i) => star(x, y, r, trim, i * 0.3)).join(""));
    if (a.outfit === "star-hoodie") parts.push(`<path d="M50 142 l3 6 6 1-4.5 4 1 6-5.5-3-5.5 3 1-6-4.5-4 6-1z" fill="${trim}"/>`);
  }
  if (a.outfit === "cardigan") parts.push(`<rect x="44" y="120" width="12" height="62" fill="${trim}"/><circle cx="50" cy="140" r="1.6" fill="${bottom}"/><circle cx="50" cy="152" r="1.6" fill="${bottom}"/><circle cx="50" cy="164" r="1.6" fill="${bottom}"/>`);
  if (a.outfit === "jacket") parts.push(`<path d="M50 120 L50 182" stroke="${trim}" stroke-width="2"/><rect x="30" y="170" width="40" height="5" fill="${trim}"/>`);
  if (a.outfit === "yukata") parts.push(`<path d="M38 120 L56 160" stroke="${trim}" stroke-width="4"/><rect x="30" y="160" width="40" height="10" fill="${trim}"/>`);
  if (a.accessory === "scarf") parts.push(`<rect x="34" y="112" width="32" height="12" rx="6" fill="${c(a.accessory)}"/><rect x="56" y="118" width="9" height="26" rx="3" fill="${c(a.accessory, 1)}"/>`);
  if (a.accessory === "backpack") parts.push(`<rect x="32" y="122" width="5" height="50" fill="${c(a.accessory, 1)}"/><rect x="63" y="122" width="5" height="50" fill="${c(a.accessory, 1)}"/>`);
  // head
  parts.push(`<ellipse cx="50" cy="76" rx="31" ry="33" fill="${skin}"/>`);
  // eyes
  for (const x of [38, 62]) parts.push(`<g class="e"><ellipse cx="${x}" cy="82" rx="6" ry="8" fill="#2b2430"/><ellipse cx="${x}" cy="83.5" rx="4.6" ry="6" fill="${eye}"/><circle cx="${x - 1.8}" cy="79.5" r="2" fill="#fff"/></g><path d="M${x - 7} 72.5 Q${x} 69.5 ${x + 7} 72.5" stroke="#2b2430" stroke-width="2" fill="none"/>`);
  parts.push(`<ellipse cx="31" cy="94" rx="5" ry="2.6" fill="#f2a7b5" opacity=".6"/><ellipse cx="69" cy="94" rx="5" ry="2.6" fill="#f2a7b5" opacity=".6"/><path d="M45 99 Q50 103 55 99" stroke="#a5525e" stroke-width="2" fill="none" stroke-linecap="round"/>`);
  if (a.glasses !== "no-glasses") { const g = c(a.glasses); parts.push(`<circle cx="38" cy="82" r="10" stroke="${g}" stroke-width="2.4" fill="#fff" fill-opacity=".12"/><circle cx="62" cy="82" r="10" stroke="${g}" stroke-width="2.4" fill="#fff" fill-opacity=".12"/><path d="M48 82 L52 82" stroke="${g}" stroke-width="2.4"/>`); }
  // front hair
  if (cut === "cut-short") parts.push(`<path d="M18 74 Q16 36 50 37 Q84 36 82 74 Q78 60 70 56 L66 66 L58 56 L50 66 L42 56 L34 66 L30 56 Q22 62 18 74 Z" fill="${h}"/>`);
  else if (cut === "cut-sidepart") parts.push(`<path d="M17 82 Q14 36 50 37 Q86 38 83 78 Q78 60 70 54 Q46 58 30 74 Q22 76 17 82 Z" fill="${h}"/>`);
  else if (cut === "cut-bob") parts.push(`<path d="M17 84 Q14 38 50 38 Q86 38 83 84 Q80 66 76 62 L24 62 Q20 66 17 84 Z" fill="${h}"/>`);
  else parts.push(`<path d="M17 80 Q14 38 50 38 Q86 38 83 80 Q76 58 64 54 Q60 66 48 66 Q40 60 38 52 Q26 60 17 80 Z" fill="${h}"/>`);
  if (cut === "cut-buns") parts.push(`<circle cx="26" cy="40" r="13" fill="${h}"/><circle cx="74" cy="40" r="13" fill="${h}"/><path d="M20 36 Q26 30 32 36 M68 36 Q74 30 80 36" stroke="${hl}" stroke-width="2" fill="none"/>`);
  parts.push(`<path d="M30 48 Q50 40 70 48" stroke="${hl}" stroke-width="3" fill="none" opacity=".8" stroke-linecap="round"/>`);
  if (a.accessory === "hairclip") parts.push(`<g transform="translate(72 56)">${[0, 72, 144, 216, 288].map((r) => `<ellipse cx="0" cy="-4" rx="3" ry="4.5" fill="${c(a.accessory)}" transform="rotate(${r})"/>`).join("")}<circle r="2" fill="#e2b84a"/></g>`);
  if (a.accessory === "headphones") parts.push(`<path d="M18 74 Q18 30 50 30 Q82 30 82 74" stroke="${c(a.accessory)}" stroke-width="5" fill="none"/><rect x="11" y="68" width="12" height="20" rx="5" fill="${c(a.accessory, 1)}"/><rect x="77" y="68" width="12" height="20" rx="5" fill="${c(a.accessory, 1)}"/>`);
  if (a.accessory === "cap") parts.push(`<path d="M18 56 Q20 30 50 30 Q80 30 82 56 Z" fill="${c(a.accessory)}"/><path d="M50 52 Q80 50 92 58 L52 58 Z" fill="${c(a.accessory)}"/><circle cx="50" cy="31" r="3" fill="${c(a.accessory, 1)}"/>`);
  const acc = a.accessory, ac = c(acc), ac2 = c(acc, 1);
  if (acc === "bow") parts.push(`<g transform="translate(50 36)"><path d="M0 0 L-16 -9 Q-20 0 -16 9 Z M0 0 L16 -9 Q20 0 16 9 Z" fill="${ac}"/><circle r="4" fill="${ac}"/>${star(-10, -2, 2.4, ac2)}${star(11, 2, 2.4, ac2, 0.6)}</g>`);
  if (acc === "star-clips") parts.push(`<path transform="translate(70 54)" d="M0 -6 l2 4.5 5 .5-3.8 3.4 1.2 5-4.4-2.6-4.4 2.6 1.2-5L-7 -1l5-.5z" fill="${ac}"/><path transform="translate(80 64) scale(.7)" d="M0 -6 l2 4.5 5 .5-3.8 3.4 1.2 5-4.4-2.6-4.4 2.6 1.2-5L-7 -1l5-.5z" fill="${ac}"/>${star(76, 46, 2.4, ac2, 0.4)}`);
  if (acc === "cat-ears") parts.push(`<path d="M20 70 Q18 34 50 34 Q82 34 80 70" stroke="${ac}" stroke-width="3.5" fill="none"/><path d="M22 50 L24 24 L40 40 Z M78 50 L76 24 L60 40 Z" fill="${ac}"/><path d="M26 44 L27 31 L35 40 Z M74 44 L73 31 L65 40 Z" fill="${ac2}"/>`);
  if (acc === "charm-bag") parts.push(`<path d="M34 122 L64 168" stroke="${ac2}" stroke-width="2.5"/><rect x="58" y="162" width="18" height="16" rx="5" fill="${ac}"/>${star(67, 170, 3, "#fff", 0.3)}`);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 270" width="100" height="270">${STYLE}<g class="b">${parts.join("")}</g></svg>`;
}
export const isSparkly = (a: AvatarConfig) => ["sparkle-hoodie", "star-hoodie"].includes(a.outfit) || ["sparkle-sneakers", "star-slipons"].includes(a.shoes) || ["bow", "star-clips"].includes(a.accessory);
export const avatarDataUrl = (a: AvatarConfig) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(avatarSvg(a))}`;
