/** Animate the equipped illustration itself so every wardrobe keeps the same face and art. */
export function walkingSheet(source: CanvasImageSource, width: number, height: number) {
  const frameWidth = 300, frameHeight = 800, count = 9;
  const canvas = document.createElement("canvas");
  canvas.width = frameWidth * count; canvas.height = frameHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Walking artwork unavailable");
  for (let frame = 0; frame < count; frame++) {
    ctx.save(); ctx.translate(frame * frameWidth, 0);
    const stride = frame === 0 ? 0 : Math.sin((frame - 1) / 8 * Math.PI * 2);
    const hip = 0.59;
    // Alternating illustrated legs, hinged at the hips; no replacement shapes.
    for (const side of [0, 1]) {
      const swing = stride * (side === 0 ? 1 : -1);
      const pivot = side === 0 ? 112 : 188;
      ctx.save(); ctx.translate(pivot, hip * frameHeight);
      ctx.rotate(swing * 0.075); ctx.scale(1, 1 - Math.max(0, swing) * 0.045);
      ctx.drawImage(source, side * width / 2, height * hip, width / 2, height * (1 - hip), side * frameWidth / 2 - pivot, -2, frameWidth / 2, frameHeight * (1 - hip));
      ctx.restore();
    }
    ctx.drawImage(source, 0, 0, width, height * hip, 0, 0, frameWidth, frameHeight * hip);
    ctx.restore();
  }
  return { canvas, frameWidth, frameHeight, count };
}