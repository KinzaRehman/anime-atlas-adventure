// Authoritative placement geometry shared by rendering, map, collision and navigation.
export const WORLD = { w: 1920, h: 1920 };
export const SPAWN = { x: 1280, y: 1240 };
const building = (x: number, y: number, w = 290, h = 300) => ({ x, y, w, h, door: { x: x - 25, y: y + 35 } });
export const LIBRARY = building(300, 530);
export const GARDEN = building(960, 530, 290, 290);
export const CAFE = building(1620, 530);
export const ARCADE = building(300, 1130);
export const PLAZA = building(1620, 1130);
export const WORKSHOP = building(300, 1740, 260, 240);
export const STUDIO = building(960, 1740, 260, 240);
export const PAPER = building(1620, 1740, 260, 240);
export const BUILDINGS = { library: LIBRARY, garden: GARDEN, cafe: CAFE, arcade: ARCADE, plaza: PLAZA, workshop: WORKSHOP, studio: STUDIO, paper: PAPER };
const friend = (b: typeof LIBRARY) => ({ x: b.x + 105, y: b.y + 55 });
export const MOCHI = friend(LIBRARY), KAITO = friend(GARDEN), SORA = friend(CAFE), TETSU = friend(ARCADE), YUZU = friend(PLAZA), REN = friend(WORKSHOP), HANA = friend(STUDIO), NAMI = friend(PAPER);
export const NPCS = { mochi: MOCHI, kaito: KAITO, sora: SORA, tetsu: TETSU, yuzu: YUZU, ren: REN, hana: HANA, nami: NAMI };
export const INTERACT_RADIUS = 110;
export const STREETS = [
 [540, 0, 200, 1920], [1180, 0, 200, 1920],
 [0, 540, 1920, 200], [0, 1140, 1920, 200], [0, 1740, 1920, 180],
] as const;
export const DISTRICT_ENTRANCES = [{x:640,y:60},{x:1280,y:60},{x:60,y:640},{x:1860,y:640},{x:60,y:1240},{x:1860,y:1240},{x:640,y:1860},{x:1280,y:1860}];
// Whole illustrated silhouettes are solid: the explorer cannot climb roofs or clip walls.
export const BLOCKERS: [number,number,number,number][] = [
 ...Object.values(BUILDINGS).map(b => [b.x-b.w/2,b.y-b.h,b.w,b.h] as [number,number,number,number]),
 [0,1340,540,150],[740,1340,440,150],[1380,1340,540,150],
 // Painted border trees and rocks are never part of the street network.
 [0,0,80,530],[1840,0,80,530],[0,740,80,400],[1840,740,80,400],
];
export const PLAYER_RADIUS = 20;
export function isBlocked(x:number,y:number, others: readonly {x:number;y:number}[] = []) {
 if(x<25||y<25||x>1895||y>1895) return true;
 return BLOCKERS.some(([bx,by,w,h]) => x>bx-PLAYER_RADIUS && x<bx+w+PLAYER_RADIUS && y>by-PLAYER_RADIUS && y<by+h+PLAYER_RADIUS)
  || others.some(p=>Math.hypot(x-p.x,(y-p.y)*1.4)<34);
}
