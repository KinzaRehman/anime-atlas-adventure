import { bodyPose, plantedLean, GAIT } from "./gait";

/** Rig the equipped illustration into hinged parts and bake a walk cycle; art is never replaced. */
const SRC_W = 300, SRC_H = 800, FIG_TOP = 8, FIG_H = 780, GROUND = FIG_TOP + FIG_H;
const HIP = 470, KNEE = 630, PAD = 30, TOP = 24;
export const FRAME = { w: SRC_W + PAD * 2, h: SRC_H + TOP } as const;

function normalise(source: CanvasImageSource, width: number, height: number) {
  const c = document.createElement("canvas"); c.width = SRC_W; c.height = SRC_H;
  const x = c.getContext("2d", { willReadFrequently: true }); if (!x) throw new Error("Walking artwork unavailable");
  if (width === SRC_W && height === SRC_H) x.drawImage(source, 0, 0);
  else { const w = width / height * FIG_H; x.drawImage(source, (SRC_W - w) / 2, FIG_TOP, w, FIG_H); }
  return { c, data: x.getImageData(0, 0, SRC_W, SRC_H).data };
}

/** Column with the least ink between the legs: the true inseam, so each leg keeps its whole shoe. */
function inseam(data: Uint8ClampedArray) {
  let best = SRC_W / 2, min = Infinity;
  for (let x = 110; x < 190; x++) { let s = 0; for (let y = KNEE; y < GROUND; y++) s += data[(y * SRC_W + x) * 4 + 3] ?? 0; if (s < min) { min = s; best = x; } }
  return best;
}

export function walkingSheet(source: CanvasImageSource, width: number, height: number) {
  const { c: art, data } = normalise(source, width, height);
  const seam = inseam(data);
  const count = 1 + GAIT.FRAMES;
  const canvas = document.createElement("canvas"); canvas.width = FRAME.w * count; canvas.height = FRAME.h;
  const ctx = canvas.getContext("2d"); if (!ctx) throw new Error("Walking artwork unavailable");
  const legs = [{ x0: 0, x1: seam, hipX: (seam + 95) / 2 }, { x0: seam, x1: SRC_W, hipX: (seam + 205) / 2 }];
  const thigh = KNEE - HIP, shin = GROUND - KNEE;
  for (let f = 0; f < count; f++) {
    const ox = f * FRAME.w + PAD, oy = TOP;
    if (f === 0) { ctx.drawImage(art, ox, oy); continue; }
    const pose = bodyPose((f - 1) / GAIT.FRAMES);
    legs.forEach((leg, side) => {
      const lp = side === 0 ? pose.left : pose.right;
      const stanceLean = plantedLean(pose.shift, thigh + shin);
      const hx = ox + leg.hipX + pose.shift, hy = oy + HIP;
      // Thigh hinged at the hip, shin hinged at the knee; the shoe rides on the shin.
      ctx.save(); ctx.translate(hx, hy); ctx.rotate(stanceLean);
      ctx.drawImage(art, leg.x0, HIP, leg.x1 - leg.x0, thigh + 6, leg.x0 - leg.hipX, 0, leg.x1 - leg.x0, thigh + 6);
      ctx.translate(0, thigh);
      // Swing leg: knee comes forward, so the shin foreshortens and the shoe lifts clear of the ground.
      ctx.drawImage(art, leg.x0, KNEE, leg.x1 - leg.x0, shin, leg.x0 - leg.hipX, 0, leg.x1 - leg.x0, shin * lp.shinScale);
      ctx.restore();
    });
    // Upper body last so the waistband covers both hip hinges; weight shift, bob and shoulder twist.
    ctx.save(); ctx.translate(ox + SRC_W / 2 + pose.shift, oy + HIP + pose.bob); ctx.rotate(pose.twist);
    ctx.drawImage(art, 0, 0, SRC_W, HIP + 14, -SRC_W / 2, -HIP, SRC_W, HIP + 14);
    ctx.restore();
  }
  return { canvas, frameWidth: FRAME.w, frameHeight: FRAME.h, count };
}
