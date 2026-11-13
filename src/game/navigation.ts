import * as EasyStar from "easystarjs";
import { isBlocked, WORLD, STREETS } from "./world";
export type Point = {x:number;y:number};
export const CELL = 20;
export function findRoute(start:Point, end:Point, others:readonly Point[] = []):Point[] {
 // Route centers retain extra clearance for eased turns and floating-point boundaries.
 const blocked=(x:number,y:number)=>[-6,0,6].some(dx=>[-6,0,6].some(dy=>isBlocked(x+dx,y+dy,others)));
 if(blocked(end.x,end.y)) return [];
 const grid=Array.from({length:WORLD.h/CELL},(_,y)=>Array.from({length:WORLD.w/CELL},(_,x)=>{
  const px=x*CELL+CELL/2,py=y*CELL+CELL/2;
  return blocked(px,py)?1:STREETS.some(([sx,sy,w,h])=>px>=sx&&px<=sx+w&&py>=sy&&py<=sy+h)?0:2;
 }));
 const cell=(p:Point)=>({x:Math.floor(p.x/CELL),y:Math.floor(p.y/CELL)});
 const a=cell(start),b=cell(end);
 if(!grid[a.y] || grid[a.y]?.[a.x]===undefined || !grid[b.y]) return [];
 const row=grid[a.y]; if(row) row[a.x]=0;
 const engine=new EasyStar.js();engine.setGrid(grid);engine.setAcceptableTiles([0,2]);engine.setTileCost(2,8);engine.enableSync();engine.disableDiagonals();
 let result:Point[]=[];
 engine.findPath(a.x,a.y,b.x,b.y,path=>{result=path?.map(p=>({x:p.x*CELL+CELL/2,y:p.y*CELL+CELL/2}))??[];});engine.calculate();
 if(result.length) {
  result.shift();
  // Keep corners, discard collinear intermediate cells; long streets stay smooth.
  result=result.filter((p,i,all)=>{const before=all[i-1],after=all[i+1];return !before||!after||(p.x-before.x)*(after.y-p.y)!==(p.y-before.y)*(after.x-p.x);});
  result.push(end);
 } return result;
}
