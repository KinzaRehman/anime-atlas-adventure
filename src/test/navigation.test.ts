import {describe,it,expect} from "vitest";
import {BUILDINGS,DISTRICT_ENTRANCES,isBlocked,STREETS,BLOCKERS,HUB,SPAWN,isWalkingPath} from "@/game/world";
import {findRoute} from "@/game/navigation";
describe("town navigation",()=>{
 it("keeps a circular hub connected to the surrounding grid",()=>{
  expect(isWalkingPath(HUB.x+170,HUB.y)).toBe(true);
  expect(isWalkingPath(HUB.x,HUB.y+170)).toBe(true);
  expect(isBlocked(HUB.x,HUB.y)).toBe(true);
  expect(isBlocked(SPAWN.x,SPAWN.y)).toBe(false);
  for(const b of Object.values(BUILDINGS)) expect(findRoute(SPAWN,b.door).length).toBeGreaterThan(0);
  const route=findRoute({x:HUB.x-170,y:HUB.y},{x:HUB.x+170,y:HUB.y});
  expect(route.length).toBeGreaterThan(0);
  for(let i=1;i<route.length;i++) {
   const a=route[i-1],b=route[i];
   if(!a||!b) continue;
   for(let t=0;t<=1;t+=0.05) expect(isBlocked(a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t)).toBe(false);
  }
 });
 it("keeps all building silhouettes off streets",()=>{
  for(const b of Object.values(BUILDINGS)) for(const [x,y,w,h] of STREETS) expect(b.x+b.w/2<=x||b.x-b.w/2>=x+w||b.y<=y||b.y-b.h>=y+h).toBe(true);
 });
 for(const [id,b] of Object.entries(BUILDINGS)) it(`every district entrance reaches ${id}`,()=>{
  expect(isBlocked(b.door.x,b.door.y)).toBe(false);
  for(const start of DISTRICT_ENTRANCES) {const route=findRoute(start,b.door);expect(route.length).toBeGreaterThan(0);for(const p of route) expect(isBlocked(p.x,p.y)).toBe(false);}
 });
 it("cannot route through a roof, wall or stream",()=>{for(const [x,y,w,h] of BLOCKERS.slice(0,11)) expect(findRoute({x:1280,y:1240},{x:x+w/2,y:y+h/2})).toEqual([]);});
});
