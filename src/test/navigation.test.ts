import {describe,it,expect} from "vitest";
import {BUILDINGS,DISTRICT_ENTRANCES,isBlocked,STREETS,BLOCKERS} from "@/game/world";
import {findRoute} from "@/game/navigation";
describe("town navigation",()=>{
 it("keeps all building silhouettes off streets",()=>{
  for(const b of Object.values(BUILDINGS)) for(const [x,y,w,h] of STREETS) expect(b.x+b.w/2<=x||b.x-b.w/2>=x+w||b.y<=y||b.y-b.h>=y+h).toBe(true);
 });
 for(const [id,b] of Object.entries(BUILDINGS)) it(`every district entrance reaches ${id}`,()=>{
  expect(isBlocked(b.door.x,b.door.y)).toBe(false);
  for(const start of DISTRICT_ENTRANCES) {const route=findRoute(start,b.door);expect(route.length).toBeGreaterThan(0);for(const p of route) expect(isBlocked(p.x,p.y)).toBe(false);}
 });
 it("cannot route through a roof, wall or stream",()=>{for(const [x,y,w,h] of BLOCKERS.slice(0,11)) expect(findRoute({x:1280,y:1240},{x:x+w/2,y:y+h/2})).toEqual([]);});
});
