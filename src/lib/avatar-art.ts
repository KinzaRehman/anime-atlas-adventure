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

/** Compose only illustrated wardrobe layers; never substitute a geometric character. */
export async function renderAvatarArt(a: AvatarConfig): Promise<string> {
  const [body, head, footwear, accessory] = await Promise.all([
    image("outfits", Math.max(0, outfits.indexOf(a.outfit))),
    image("hairstyles", Math.max(0, cuts.indexOf(a.body === "boy" && a.cut === "cut-long" ? "cut-short" : a.cut))),
    image("details", Math.max(0, shoes.indexOf(a.shoes))),
    accessories.includes(a.accessory) ? image("details", accessories.indexOf(a.accessory) + 8) : Promise.resolve(null),
  ]);
  const canvas = document.createElement("canvas"); canvas.width = 300; canvas.height = 800;
  const ctx = canvas.getContext("2d"); if (!ctx) throw new Error("Explorer preview unavailable");
  const drawFigure = (img: HTMLImageElement) => {
    const width = img.width / img.height * 780;
    ctx.drawImage(img, (300 - width) / 2, 8, width, 780);
  };
  drawFigure(body);
  ctx.clearRect(0, 0, 300, 225);
  const headCanvas = document.createElement("canvas"); headCanvas.width = 300; headCanvas.height = 800;
  const hc = headCanvas.getContext("2d"); if (!hc) throw new Error("Explorer preview unavailable");
  const hw = head.width / head.height * 780;
  hc.drawImage(head, (300 - hw) / 2, 28, hw, 780);
  const pixels = hc.getImageData(0, 0, 300, 225);
  const hair = avatarOption(a.hair)?.colors[0] ?? "#2b2430";
  const rgb = [1, 3, 5].map((start) => parseInt(hair.slice(start, start + 2), 16));
  const eye = avatarOption(a.eyes)?.colors[0] ?? "#6b4128";
  const eyeRgb = [1, 3, 5].map((start) => parseInt(eye.slice(start, start + 2), 16));
  for (let y = 0; y < 225; y++) for (let x = 0; x < 300; x++) {
    const i = (y * 300 + x) * 4;
    if (!pixels.data[i + 3]) continue;
    const r = pixels.data[i] ?? 0, g = pixels.data[i + 1] ?? 0, b = pixels.data[i + 2] ?? 0;
    const inFace = y > 124 && x > 98 && x < 214;
    const darkHair = Math.max(r, g, b) < 175 && Math.min(r, g, b) > 25 && Math.abs(r - g) < 40;
    if (darkHair && !inFace && a.hair !== "hair-ink") {
      const shade = (r + g + b) / 240;
      for (let j = 0; j < 3; j++) pixels.data[i + j] = Math.min(255, (rgb[j] ?? 0) * shade);
    }
    if (y > 157 && y < 178 && ((x > 110 && x < 132) || (x > 166 && x < 188)) && r < 140 && g < 120 && b < 130) {
      for (let j = 0; j < 3; j++) pixels.data[i + j] = (eyeRgb[j] ?? 0) * ((r + g + b) / 220);
    }
  }
  hc.putImageData(pixels, 0, 0);
  ctx.drawImage(headCanvas, 0, 0, 300, 225, 0, 0, 300, 225);
  // Shoes replace the existing shoes rather than floating beside them.
  if (a.outfit !== "yukata") {
    ctx.clearRect(0, 680, 300, 120);
    ctx.drawImage(footwear, 40, 645, 220, 143);
  }
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