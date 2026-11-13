/** Pure locomotion state machine: velocity, facing and movement state for the town explorer. */
export const MOVE = { WALK: 230, RUN: 380, ACCEL: 9, DECEL: 14, STOP_EPS: 6, TURN_TIME: 0.14 } as const;
export type MoveState = "idle" | "start" | "walk" | "run" | "turn" | "stop" | "interact";
export interface Mover { x: number; y: number; vx: number; vy: number; facing: 1 | -1; turn: number; state: MoveState }

export const createMover = (x: number, y: number): Mover => ({ x, y, vx: 0, vy: 0, facing: 1, turn: 0, state: "idle" });

export function stepMover(m: Mover, ix: number, iy: number, run: boolean, interacting: boolean, dt: number, blocked: (x: number, y: number) => boolean) {
  const len = Math.hypot(ix, iy); if (len > 1) { ix /= len; iy /= len; }
  if (interacting) { ix = 0; iy = 0; }
  const target = run ? MOVE.RUN : MOVE.WALK;
  const k = 1 - Math.exp(-(len > 0 ? MOVE.ACCEL : MOVE.DECEL) * dt);
  m.vx += (ix * target - m.vx) * k; m.vy += (iy * target - m.vy) * k;
  if (len === 0 && Math.hypot(m.vx, m.vy) < MOVE.STOP_EPS) { m.vx = 0; m.vy = 0; }
  // Axis-separated collision lets the explorer slide along walls instead of sticking or passing through.
  const nx = m.x + m.vx * dt, ny = m.y + m.vy * dt;
  if (!blocked(nx, m.y)) m.x = nx; else m.vx = 0;
  if (!blocked(m.x, ny)) m.y = ny; else m.vy = 0;
  const speed = Math.hypot(m.vx, m.vy);
  const wantFacing = ix > 0.2 ? 1 : ix < -0.2 ? -1 : m.facing;
  if (wantFacing !== m.facing && m.turn <= 0) m.turn = MOVE.TURN_TIME;
  if (m.turn > 0) { m.turn = Math.max(0, m.turn - dt); if (m.turn <= MOVE.TURN_TIME / 2 && wantFacing !== m.facing) m.facing = wantFacing; }
  m.state = interacting ? "interact"
    : m.turn > 0 ? "turn"
    : len === 0 ? (speed > MOVE.STOP_EPS ? "stop" : "idle")
    : speed < target * 0.6 ? "start"
    : run ? "run" : "walk";
  return speed;
}

/** Horizontal squash during a turn so the figure pivots instead of snapping. */
export const turnScale = (m: Mover) => m.turn > 0 ? Math.max(0.35, Math.abs(Math.cos((1 - m.turn / MOVE.TURN_TIME) * Math.PI))) : 1;
