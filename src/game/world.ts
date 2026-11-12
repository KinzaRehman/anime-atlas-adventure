// Neighborhood layout in world pixels (ground art is 1920x1920). Pure data.
export const WORLD = { w: 1920, h: 1920 };
export const SPAWN = { x: 1180, y: 1120 };
export const LIBRARY = { x: 360, y: 470, door: { x: 380, y: 610 }, w: 420 }; // x,y = sprite bottom-centre
export const MOCHI = { x: 1240, y: 760 };
export const CAFE = { x: 1620, y: 420, door: { x: 1590, y: 600 }, w: 400 };
export const SORA = { x: 1420, y: 690 };
export const ARCADE = { x: 320, y: 1100, door: { x: 380, y: 1240 }, w: 400 };
export const TETSU = { x: 540, y: 1280 };
export const PLAZA = { x: 1620, y: 1120, door: { x: 1560, y: 1260 }, w: 400 };
export const YUZU = { x: 1340, y: 1260 };
export const WORKSHOP = { x: 300, y: 1850, door: { x: 390, y: 1840 }, w: 330 };
export const REN = { x: 530, y: 1790 };
export const STUDIO = { x: 1000, y: 1880, door: { x: 1040, y: 1840 }, w: 330 };
export const HANA = { x: 1230, y: 1810 };
export const INTERACT_RADIUS = 110;
// Rectangles the player can't enter: [x, y, w, h]
export const BLOCKERS: [number, number, number, number][] = [
  [170, 120, 380, 330],           // library body (rear)
  [820, 560, 280, 250],           // fountain
  [1440, 140, 370, 410],          // café body
  [140, 850, 360, 300],          // Arcade body, entrance clear below
  [1450, 950, 340, 240],         // Pavilion body, entrance clear below
  [0, 1400, 360, 200], [790, 1400, 1130, 220], // stream, bridge gap at x 360-790
  [140, 1610, 260, 190], [850, 1660, 280, 130],
];
