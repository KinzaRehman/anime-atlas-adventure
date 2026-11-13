import { describe, expect, it } from "vitest";
import { bodyPose, plantedLean, strideTimeScale, GAIT } from "@/game/gait";
import { createMover, stepMover, MOVE } from "@/game/movement";
import { isHair } from "@/lib/avatar-art";

const open = (_x: number, _y: number) => false;
const run = (m: ReturnType<typeof createMover>, ix: number, iy: number, secs: number, blocked: (x: number, y: number) => boolean = open) => {
  let s = 0; for (let t = 0; t < secs; t += 1 / 60) s = stepMover(m, ix, iy, false, false, 1 / 60, blocked); return s;
};

describe("gait", () => {
  it("alternates legs: only one foot lifts at a time", () => {
    for (let f = 0; f < GAIT.FRAMES; f++) { const p = bodyPose(f / GAIT.FRAMES); expect(p.left.footLift > 0 && p.right.footLift > 0).toBe(false); }
    expect(bodyPose(0.25).left.footLift).toBeGreaterThan(0);
    expect(bodyPose(0.75).right.footLift).toBeGreaterThan(0);
  });
  it("keeps the stance foot planted under a shifted hip", () => {
    const lean = plantedLean(4, 318); expect(Math.sin(lean) * 318).toBeCloseTo(4, 5);
  });
  it("syncs step rate to ground speed", () => { expect(strideTimeScale(240)).toBeCloseTo(2); });
});

describe("movement", () => {
  it("accelerates smoothly instead of jumping to full speed", () => {
    const m = createMover(500, 500); const first = stepMover(m, 1, 0, false, false, 1 / 60, open);
    expect(first).toBeLessThan(MOVE.WALK * 0.3); expect(run(m, 1, 0, 1)).toBeGreaterThan(MOVE.WALK * 0.95);
  });
  it("decelerates to a stop rather than freezing instantly", () => {
    const m = createMover(500, 500); run(m, 1, 0, 1);
    expect(stepMover(m, 0, 0, false, false, 1 / 60, open)).toBeGreaterThan(50); expect(m.state).toBe("stop");
    run(m, 0, 0, 1); expect(m.state).toBe("idle");
  });
  it("turns over a short pivot instead of snapping", () => {
    const m = createMover(500, 500); run(m, 1, 0, 0.5);
    stepMover(m, -1, 0, false, false, 1 / 60, open); expect(m.state).toBe("turn"); expect(m.facing).toBe(1);
    run(m, -1, 0, 0.3); expect(m.facing).toBe(-1);
  });
  it("slides along walls and never enters blocked space", () => {
    const wall = (x: number) => x > 600; const m = createMover(590, 500);
    run(m, 1, 1, 1, wall); expect(m.x).toBeLessThanOrEqual(600); expect(m.y).toBeGreaterThan(600);
  });
  it("stops while interacting", () => { const m = createMover(0, 0); run(m, 1, 0, 1); run(m, 1, 0, 1); stepMover(m, 1, 0, false, true, 1, open); expect(m.state).toBe("interact"); });
});

describe("hair mask", () => {
  it("matches violet hair but not navy blazer, olive trousers or brown bag", () => {
    expect(isHair(70, 55, 85)).toBe(true);
    expect(isHair(30, 40, 90)).toBe(false); expect(isHair(100, 100, 55)).toBe(false); expect(isHair(120, 75, 40)).toBe(false);
  });
});
