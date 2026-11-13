import Phaser from "phaser";
import { DEFAULT_AVATAR, type AvatarConfig } from "@/data/avatar";
import { renderAvatarArt } from "@/lib/avatar-art";
import { walkingSheet, FRAME } from "./walking";
import { createMover, stepMover, type Mover } from "./movement";
import { findRoute, type Point } from "./navigation";
import { isBlocked } from "./world";
import { strideTimeScale } from "./gait";

// Local ambient visitors only: no account, chat, quest or progress side effects.
export const VISITOR_LOOKS: { name: string; look: AvatarConfig; start: Point }[] = [
 { name: "Aki", look: {...DEFAULT_AVATAR, body:"boy",cut:"cut-short",hair:"hair-chestnut",outfit:"hoodie"}, start:{x:790,y:890} },
 { name: "Mio", look: {...DEFAULT_AVATAR,cut:"cut-bob",hair:"hair-sakura",outfit:"cardigan",shoes:"loafers"}, start:{x:1130,y:890} },
 { name: "Haru", look: {...DEFAULT_AVATAR,body:"boy",cut:"cut-sidepart",hair:"hair-honey",outfit:"jacket",shoes:"high-tops"}, start:{x:960,y:720} },
 { name: "Rin", look: {...DEFAULT_AVATAR,cut:"cut-ponytail",hair:"hair-lavender",outfit:"sparkle-hoodie",shoes:"sparkle-sneakers"}, start:{x:640,y:1240} },
 { name: "Nao", look: {...DEFAULT_AVATAR,cut:"cut-wavy",hair:"hair-ink",outfit:"explorer",glasses:"round-glasses"}, start:{x:1280,y:1240} },
];
export const VISITOR_STOPS: Point[] = [
 {x:790,y:890},{x:1130,y:890},{x:960,y:720},{x:960,y:1080},
 {x:640,y:640},{x:1280,y:640},{x:640,y:1240},{x:1280,y:1240},
 {x:640,y:1640},{x:1280,y:1640},{x:960,y:1830},
];
type Visitor = { sprite: Phaser.GameObjects.Sprite; shadow: Phaser.GameObjects.Ellipse; label: Phaser.GameObjects.Text; mover: Mover; route: Point[]; wait: number; stalled: number; stop: number; animation: string };
export class TownVisitors {
 private visitors: Visitor[] = [];
 private active = true;
 private assets: string[] = [];
 constructor(private scene: Phaser.Scene, private reduced: boolean, private occupants: () => Point[]) {
  scene.events.once("shutdown",()=>{
   this.active=false;
   for(const key of this.assets) { scene.anims.remove(`${key}-walk`); scene.textures.remove(key); }
  });
 }
 get positions(): Point[] { return this.visitors.map(v=>v.sprite); }
 async create() {
  for(const [index,visitor] of VISITOR_LOOKS.entries()) {
   try {
    const url=await renderAvatarArt(visitor.look);
    const image=new Image(); image.src=url;
    await image.decode();
    if(!this.active) return;
    const key=`ambient-visitor-${index}`;
    const sheet=walkingSheet(image,image.width,image.height);
    const texture=this.scene.textures.addCanvas(key,sheet.canvas);
    if(!texture) continue;
    this.assets.push(key);
    for(let f=0;f<sheet.count;f++) texture.add(f,0,f*FRAME.w,0,FRAME.w,FRAME.h);
    const animation=`${key}-walk`;
    this.scene.anims.create({key:animation,frames:this.scene.anims.generateFrameNumbers(key,{start:1,end:8}),frameRate:8,repeat:-1});
    const {x,y}=visitor.start;
    const sprite=this.scene.add.sprite(x,y,key,0).setOrigin(0.5,1).setDisplaySize(168*FRAME.w/(FRAME.h-24),168).setDepth(y);
    sprite.setData("simulatedVisitor",true);
    const shadow=this.scene.add.ellipse(x,y-3,48,14,0x24212a,0.22).setDepth(y-1);
    const label=this.scene.add.text(x,y-181,`Visitor · ${visitor.name}`,{fontFamily:"Zen Maru Gothic, sans-serif",fontSize:"12px",color:"#24212A",backgroundColor:"#F6F0E6",padding:{x:5,y:2}}).setOrigin(0.5,1).setDepth(y+1);
    this.visitors.push({sprite,shadow,label,mover:createMover(x,y),route:[],wait:index*0.7,stalled:0,stop:index,animation});
   } catch(error) { if(import.meta.env.DEV) console.warn("Town visitor artwork unavailable",error); }
  }
 }
 update(dt: number, paused: boolean) {
  for(const v of this.visitors) {
   const others=[...this.occupants(),...this.visitors.filter(o=>o!==v).map(o=>o.sprite)];
   if(!paused && !v.route.length && (v.wait-=dt)<=0) {
    v.stop=(v.stop+3)%VISITOR_STOPS.length;
    const destination=VISITOR_STOPS[v.stop];
    if(destination) v.route=findRoute(v.sprite,destination,others);
    v.wait=1.5+v.stop%3;
   }
   let ix=0,iy=0;
   const point=v.route[0];
   if(point && !paused) {
    const dx=point.x-v.mover.x,dy=point.y-v.mover.y,d=Math.hypot(dx,dy);
    if(d<9) v.route.shift();
    else { const pace=Math.min(0.55,d/24); ix=dx/d*pace; iy=dy/d*pace; }
   }
   const speed=stepMover(v.mover,ix,iy,false,paused,dt,(x,y)=>isBlocked(x,y,others));
   v.sprite.setPosition(v.mover.x,v.mover.y).setFlipX(v.mover.facing<0).setDepth(v.mover.y);
   if(speed>12&&!this.reduced) {v.sprite.play(v.animation,true);v.sprite.anims.timeScale=strideTimeScale(speed);}
   else {v.sprite.anims.stop();v.sprite.setFrame(0);}
   v.shadow.setPosition(v.mover.x,v.mover.y-3).setDepth(v.mover.y-1);
   v.label.setPosition(v.mover.x,v.mover.y-181).setDepth(v.mover.y+1);
   v.stalled=point&&!paused&&speed<8?v.stalled+dt:0;
   if(v.stalled>2) {v.route=[];v.wait=0.5;v.stalled=0;}
  }
 }
}