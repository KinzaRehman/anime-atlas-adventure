/** Pure gait maths for the illustrated explorer rig (no Phaser, no DOM). */
export const GAIT = {
  FRAMES: 8,          // walk frames per full cycle (two steps)
  CYCLE_PX: 120,      // world distance covered per cycle; drives animation rate
  WEIGHT_SHIFT: 4,    // px the pelvis moves over the stance foot
  BOB: 2.5,           // px the upper body rises mid-stance
  KNEE_LIFT: 0.14,    // shin foreshortening of the swing leg (knee comes forward)
  FOOT_LIFT: 16,      // px the swing foot clears the ground
  TORSO_TWIST: 0.018, // rad shoulder counter-rotation
} as const;

export interface LegPose { swing: number; shinScale: number; footLift: number }
export interface BodyPose { shift: number; bob: number; twist: number; left: LegPose; right: LegPose }

/** phase in [0,1): left leg swings during the first half, right during the second. */
export function bodyPose(phase: number): BodyPose {
  const s = Math.sin(phase * Math.PI * 2);
  const leg = (swingWave: number): LegPose => {
    const lift = Math.max(0, swingWave);
    return { swing: lift, shinScale: 1 - GAIT.KNEE_LIFT * lift, footLift: GAIT.FOOT_LIFT * lift };
  };
  return {
    // Weight moves over whichever foot is planted (right while left swings).
    shift: GAIT.WEIGHT_SHIFT * s,
    bob: -GAIT.BOB * Math.abs(s),
    twist: GAIT.TORSO_TWIST * s,
    left: leg(s),
    right: leg(-s),
  };
}

/** Stance foot stays planted: the leg leans so its foot keeps its rest x while the hip shifts. */
export function plantedLean(hipShift: number, legLength: number) {
  return Math.asin(Math.max(-1, Math.min(1, hipShift / legLength)));
}

/** Animation playback rate that keeps steps in sync with ground speed. */
export function strideTimeScale(speed: number) { return speed / GAIT.CYCLE_PX; }
