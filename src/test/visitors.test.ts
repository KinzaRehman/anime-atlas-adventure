import { describe, expect, it, vi } from "vitest";
vi.mock("phaser",()=>({default:{}}));
import { VISITOR_LOOKS, VISITOR_STOPS } from "@/game/visitors";
import { isBlocked, isWalkingPath } from "@/game/world";
import { findRoute } from "@/game/navigation";
describe("ambient town visitors",()=>{
 it("provides exactly five distinct simulated explorers",()=>{
  expect(VISITOR_LOOKS).toHaveLength(5);
  expect(new Set(VISITOR_LOOKS.map(v=>JSON.stringify(v.look))).size).toBe(5);
 });
 it("starts all visitors safely on connected walking paths",()=>{
  for(const v of VISITOR_LOOKS) {
   expect(isBlocked(v.start.x,v.start.y)).toBe(false);
   expect(isWalkingPath(v.start.x,v.start.y)).toBe(true);
   for(const end of VISITOR_STOPS) {
    if(end.x===v.start.x&&end.y===v.start.y) continue;
    expect(findRoute(v.start,end).length,`${v.name} to ${end.x},${end.y}`).toBeGreaterThan(0);
   }
  }
 });
});