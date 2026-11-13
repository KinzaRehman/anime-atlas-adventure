import { avatarOption, type AvatarConfig } from "@/data/avatar";

const files = import.meta.glob("../assets/avatar/layers/*.webp", { eager: true, query: "?url", import: "default" }) as Record<string, string>;
const cache = new Map<string, Promise<HTMLImageElement>>();
function image(group: string, index: number) {
  const url = files[`../assets/avatar/layers/${group}-${index}.webp`];
  if (!url) return Promise.reject(new Error("Missing explorer artwork"));
  let pending = cache.get(url);
  if (!pending) {
    pending = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image(); img.onload = () => resolve(img); img.onerror = reject; img.src = url;
    });
    cache.set(url, pending);
  }
  return pending;
}
const cuts = ["cut-long", "cut-short", "cut-bob", "cut-ponytail", "cut-twintails", "cut-buns", "cut-wavy", "cut-sidepart"];
const outfits = ["uniform", "hoodie", "cardigan", "jacket", "sparkle-hoodie", "star-hoodie", "yukata", "explorer"];
const shoes = ["sneakers", "loafers", "boots", "high-tops", "sparkle-sneakers", "star-slipons", "platforms"];
const accessories = ["hairclip", "headphones", "cap", "scarf", "bow", "star-clips", "cat-ears", "charm-bag"];

const FW = 300, FH = 800, FIG_TOP = 8, FIG_H = 780, GROUND = FIG_TOP + FIG_H;
const NECK_Y = 225, HAIR_END = 560, SPINE_L = 104, SPINE_R = 196, ANKLE_Y = 700, SHOE_H = 104;
const hex = (c: string) => [1, 3, 5].map((s) => parseInt(c.slice(s, s + 2), 16));
/** Neutral-to-violet dark tones used by the explorer's hair; excludes navy, olive and brown clothing. */
export function isHair(r: number, g: number, b: number) {
  return Math.max(r, g, b) < 175 && Math.min(r, g, b) > 25 && Math.abs(r - g) < 40 && Math.abs(r - b) < 35 && g <= r + 8;
}
/** Hair strands that continue down from the scalp, traced per column so clothing line art is never mistaken for hair. */
export function hangingHair(px: Uint8ClampedArray) {
  const mask = new Uint8Array(FW * FH);
  for (let x = 0; x < FW; x++) {
    if (x >= SPINE_L && x <= SPINE_R) continue;
    let miss = 0;
    for (let y = NECK_Y - 6; y < HAIR_END; y++) {
      const i = (y * FW + x) * 4;
      const hairy = (px[i + 3] ?? 0) > 40 && isHair(px[i] ?? 0, px[i + 1] ?? 0, px[i + 2] ?? 0);
      if (hairy) { miss = 0; if (y >= NECK_Y) mask[y * FW + x] = 1; } else if (++miss > 3) break;
    }
  }
  return mask;
}
function copy(src: Uint8ClampedArray, dst: ImageData, i: number) { for (let j = 0; j < 4; j++) dst.data[i + j] = src[i + j] ?? 0; }
function tint(img: ImageData, i: number, rgb: number[]) {
  const shade = ((img.data[i] ?? 0) + (img.data[i + 1] ?? 0) + (img.data[i + 2] ?? 0)) / 240;
  for (let j = 0; j < 3; j++) img.data[i + j] = Math.min(255, (rgb[j] ?? 0) * shade);
}
/** Every figure shares one frame, scale and ground line so parts line up exactly. */
function figurePixels(img: HTMLImageElement) {
  const c = document.createElement("canvas"); c.width = FW; c.height = FH;
  const x = c.getContext("2d", { willReadFrequently: true }); if (!x) throw new Error("Explorer preview unavailable");
  const w = img.width / img.height * FIG_H; x.drawImage(img, (FW - w) / 2, FIG_TOP, w, FIG_H);
  return x.getImageData(0, 0, FW, FH).data;
}
function gapColumn(data: Uint8ClampedArray, w: number, y0: number, y1: number, x0: number, x1: number) {
  let best = (x0 + x1) >> 1, min = Infinity;
  for (let x = x0; x < x1; x++) { let sum = 0; for (let y = y0; y < y1; y++) sum += data[(y * w + x) * 4 + 3] ?? 0; if (sum < min) { min = sum; best = x; } }
  return best;
}
/** One illustrated shoe, drawn on each foot (mirrored for the right) so both feet always match. */
function fitShoes(ctx: CanvasRenderingContext2D, shoe: HTMLImageElement) {
  const fig = ctx.getImageData(0, 0, FW, FH).data;
  const gap = gapColumn(fig, FW, ANKLE_Y, GROUND, 110, 190);
  const aspect = shoe.height / shoe.width;
  for (const [x0, x1, mirror] of [[0, gap, false], [gap, FW, true]] as const) {
    let minX = x1, maxX = x0;
    for (let y = ANKLE_Y; y < GROUND; y++) for (let x = x0; x < x1; x++) if ((fig[(y * FW + x) * 4 + 3] ?? 0) > 40) { if (x < minX) minX = x; if (x > maxX) maxX = x; }
    if (maxX <= minX) continue;
    const footW = maxX - minX;
    // Wide enough to cover the original foot, never crossing the inseam the walk rig splits on.
    let w = Math.min(footW * 1.15, x1 - x0 - 6), h = w * aspect;
    if (h > SHOE_H * 1.5) { h = SHOE_H * 1.5; w = h / aspect; }
    if (h < SHOE_H * 0.8) { h = SHOE_H * 0.8; w = Math.min(h / aspect, x1 - x0 - 6); }
    const left = Math.max(x0 + 2, Math.min(x1 - 2 - w, minX + footW / 2 - w / 2));
    ctx.clearRect(Math.max(x0, minX - 3), GROUND - SHOE_H * 1.14, Math.min(x1, maxX + 3) - Math.max(x0, minX - 3), SHOE_H * 1.14 + 4);
    ctx.save();
    if (mirror) { ctx.translate(left * 2 + w, 0); ctx.scale(-1, 1); }
    ctx.drawImage(shoe, left, GROUND - h, w, h);
    ctx.restore();
  }
}

/** Compose only illustrated wardrobe layers; never substitute a geometric character. */
export async function renderAvatarArt(a: AvatarConfig): Promise<string> {
  const [body, head, footwear, accessory] = await Promise.all([
    image("outfits", Math.max(0, outfits.indexOf(a.outfit))),
    image("hairstyles", Math.max(0, cuts.indexOf(a.body === "boy" && a.cut === "cut-long" ? "cut-short" : a.cut))),
    image("shoe", Math.max(0, shoes.indexOf(a.shoes))),
    accessories.includes(a.accessory) ? image("details", accessories.indexOf(a.accessory) + 8) : Promise.resolve(null),
  ]);
  const canvas = document.createElement("canvas"); canvas.width = FW; canvas.height = FH;
  const ctx = canvas.getContext("2d"); if (!ctx) throw new Error("Explorer preview unavailable");
  const bodyPx = figurePixels(body), headPx = figurePixels(head);
  const hair = hex(avatarOption(a.hair)?.colors[0] ?? "#2b2430");
  const eye = hex(avatarOption(a.eyes)?.colors[0] ?? "#6b4128");
  const recolor = a.hair !== "hair-ink";
  const bodyStrand = hangingHair(bodyPx), headStrand = hangingHair(headPx);
  const out = ctx.createImageData(FW, FH), behind = ctx.createImageData(FW, FH);
  for (let y = 0; y < FH; y++) for (let x = 0; x < FW; x++) {
    const i = (y * FW + x) * 4;
    const side = x < SPINE_L || x > SPINE_R;
    if (y < NECK_Y) {
      // One head: the chosen hairstyle figure supplies scalp, hairline and face.
      if (!headPx[i + 3]) continue;
      copy(headPx, out, i);
      const r = out.data[i] ?? 0, g = out.data[i + 1] ?? 0, b = out.data[i + 2] ?? 0;
      const inFace = y > 124 && x > 98 && x < 214;
      if (recolor && !inFace && isHair(r, g, b)) tint(out, i, hair);
      if (y > 157 && y < 178 && ((x > 110 && x < 132) || (x > 166 && x < 188)) && r < 140 && g < 120 && b < 130) {
        const k = (r + g + b) / 220; for (let j = 0; j < 3; j++) out.data[i + j] = (eye[j] ?? 0) * k;
      }
      continue;
    }
    // Below the neck the outfit's own hanging hair is removed so hairstyles never stack.
    if (bodyPx[i + 3] && !(bodyStrand[y * FW + x])) copy(bodyPx, out, i);
    // Long hairstyles keep their length, drawn behind the shoulders and arms.
    if (headStrand[y * FW + x]) { copy(headPx, behind, i); if (recolor) tint(behind, i, hair); }
  }
  const layer = (data: ImageData) => { const c = document.createElement("canvas"); c.width = FW; c.height = FH; c.getContext("2d")?.putImageData(data, 0, 0); return c; };
  ctx.drawImage(layer(behind), 0, 0); ctx.drawImage(layer(out), 0, 0);
  // Shoes: one matching illustrated shoe fitted to each detected foot.
  if (a.outfit !== "yukata") fitShoes(ctx, footwear);
  if (a.glasses !== "no-glasses") {
    ctx.strokeStyle = avatarOption(a.glasses)?.colors[0] ?? "#3a3340"; ctx.lineWidth = 3;
    for (const x of [121, 178]) { ctx.beginPath(); ctx.ellipse(x, 165, 23, 20, 0, 0, Math.PI * 2); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(144, 163); ctx.lineTo(155, 163); ctx.stroke();
  }
  if (accessory) {
    const placements: Record<string, [number, number, number, number]> = {
      hairclip: [191, 76, 42, 34], headphones: [58, 26, 184, 172], cap: [64, 8, 175, 95],
      scarf: [90, 203, 145, 158], bow: [126, 8, 75, 65], "star-clips": [188, 72, 48, 40],
      "cat-ears": [64, 0, 170, 125], "charm-bag": [61, 303, 126, 202],
    };
    const pos = placements[a.accessory]; if (pos) ctx.drawImage(accessory, pos[0], pos[1], pos[2], pos[3]);
  }
  return canvas.toDataURL("image/png");
}