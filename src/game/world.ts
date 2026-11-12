// Neighborhood layout in world pixels (ground art is 1920x1920). Pure data.
export const WORLD = { w: 1920, h: 1920 };
export const SPAWN = { x: 1180, y: 1120 };
export const LIBRARY = { x: 360, y: 470, door: { x: 380, y: 610 }, w: 420 }; // x,y = sprite bottom-centre
export const MOCHI = { x: 1240, y: 760 };
export const INTERACT_RADIUS = 110;
// Rectangles the player can't enter: [x, y, w, h]
export const BLOCKERS: [number, number, number, number][] = [
  [170, 120, 380, 330],           // library body (rear)
  [820, 560, 280, 250],           // fountain
  [0, 1400, 360, 200], [790, 1400, 1130, 220], // stream, bridge gap at x 360-790
];
