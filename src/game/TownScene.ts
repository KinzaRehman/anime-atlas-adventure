import Phaser from "phaser";
import ground from "@/assets/world/streets.jpg";
import libraryImg from "@/assets/world/library.webp";
import playerImg from "@/assets/world/player.webp";
import mochiImg from "@/assets/world/mochi.webp";
import cafeImg from "@/assets/world/cafe.webp";
import soraImg from "@/assets/world/sora.webp";
import arcadeImg from "@/assets/world/arcade.webp";
import plazaImg from "@/assets/world/plaza.webp";
import tetsuImg from "@/assets/world/tetsu.webp";
import yuzuImg from "@/assets/world/yuzu.webp";
import renImg from "@/assets/world/ren.webp";
import hanaImg from "@/assets/world/hana.webp";
import workshopImg from "@/assets/world/workshop.webp";
import studioImg from "@/assets/world/studio.webp";
import kaitoImg from "@/assets/world/kaito.webp";
import namiImg from "@/assets/world/nami.webp";
import gardenImg from "@/assets/world/garden.webp";
import paperImg from "@/assets/world/paper.webp";
import { WORKSHOP, REN, STUDIO, HANA, GARDEN, KAITO, PAPER, NAMI } from "./world";
import { bus } from "./bus";
import { walkingSheet, FRAME } from "./walking";
import { createMover, stepMover, turnScale, type Mover } from "./movement";
import { findRoute, type Point } from "./navigation";
import { BUILDINGS, NPCS, isBlocked } from "./world";
import { strideTimeScale } from "./gait";
import { WaterMotion } from "./WaterMotion";
import { TownVisitors } from "./visitors";
import { ARCADE, BLOCKERS, CAFE, INTERACT_RADIUS, LIBRARY, MOCHI, PLAZA, SORA, SPAWN, TETSU, WORLD, YUZU } from "./world";

const PLAYER_H = 168, PLAYER_W = PLAYER_H * FRAME.w / (FRAME.h - 24);

export class TownScene extends Phaser.Scene {
  declare player: Phaser.GameObjects.Sprite;
  private water?: WaterMotion;
  private visitors?: TownVisitors;
  private route: Point[] = [];
  private npcSprites: {sprite: Phaser.GameObjects.Image; home: Point; shadow: Phaser.GameObjects.Ellipse; phase: number}[] = [];
  navigate(x: number, y: number) { this.route = findRoute({x:this.player.x,y:this.player.y},{x,y},[...this.npcSprites.map(n=>n.sprite),...this.visitors?.positions??[]]); }
  private walkAnimation = "";
  declare private shadow: Phaser.GameObjects.Ellipse;
  declare private mochi: Phaser.GameObjects.Image;
  private markers: Partial<Record<"mochi" | "sora" | "tetsu" | "yuzu" | "ren" | "hana" | "kaito" | "nami", Phaser.GameObjects.Container>> = {};
  private mover: Mover = createMover(0, 0);
  declare private keys: Record<"W" | "A" | "S" | "D" | "UP" | "DOWN" | "LEFT" | "RIGHT" | "SHIFT", Phaser.Input.Keyboard.Key>;
  private lastNear = "";
  private posTick = 0;
  reduced = false;

  constructor() { super("town"); }

  preload() {
    this.load.image("ground", ground);
    this.load.image("library", libraryImg);
    this.load.image("player", playerImg);
    this.load.image("mochi", mochiImg);
    this.load.image("cafe", cafeImg);
    this.load.image("sora", soraImg);
    this.load.image("arcade", arcadeImg);
    this.load.image("plaza", plazaImg);
    this.load.image("tetsu", tetsuImg);
    this.load.image("yuzu", yuzuImg);
    this.load.image("ren", renImg); this.load.image("hana", hanaImg);
    this.load.image("workshop", workshopImg); this.load.image("studio", studioImg);
    this.load.image("kaito", kaitoImg); this.load.image("nami", namiImg);
    this.load.image("garden", gardenImg); this.load.image("paper", paperImg);
  }

  private avatarN = 0;
  private sparkly = false; private sparkT = 0;
  private installWalking(key: string, source: CanvasImageSource, width: number, height: number) {
    const sheet = walkingSheet(source, width, height);
    const texture = this.textures.addCanvas(`${key}-sheet`, sheet.canvas);
    if (!texture) return;
    // CanvasTexture already owns its source; register frame rectangles directly.
    for (let frame = 0; frame < sheet.count; frame++) texture.add(frame, 0, frame * sheet.frameWidth, 0, sheet.frameWidth, sheet.frameHeight);
    const previous = this.walkAnimation;
    this.walkAnimation = `${key}-walk`;
    this.anims.create({ key: this.walkAnimation, frames: this.anims.generateFrameNumbers(`${key}-sheet`, { start: 1, end: 8 }), frameRate: 8, repeat: -1 });
    this.player?.anims.stop(); this.player?.setTexture(`${key}-sheet`, 0).setDisplaySize(PLAYER_W, PLAYER_H);
    if (previous) this.anims.remove(previous);
  }
  setAvatar(url: string, sparkly = false) {
    this.sparkly = sparkly;
    const key = `avatar-${++this.avatarN}`;
    const img = new Image();
    img.onload = () => {
      if (!this.sys?.isActive() || key !== `avatar-${this.avatarN}`) return;
      const previous = this.player?.texture.key;
      this.installWalking(key, img, img.width, img.height);
      if (previous?.startsWith("avatar-")) this.textures.remove(previous);
    };
    img.src = url;
  }

  create() {
    this.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.add.image(0, 0, "ground").setOrigin(0).setDepth(-10);
    this.water = new WaterMotion(this);
    this.water.update(0);
    // warm evening grade
    this.add.rectangle(0, 0, WORLD.w, WORLD.h, 0xffb27a, 0.08).setOrigin(0).setDepth(5000).setBlendMode(Phaser.BlendModes.MULTIPLY);

    for (const [key, spot] of Object.entries(BUILDINGS)) {
      this.add.image(spot.x,spot.y,key).setOrigin(0.5,1).setDisplaySize(spot.w,spot.h).setDepth(spot.y);
      const entrance = this.add.graphics().setDepth(-5);
      entrance.fillStyle(0xf6f0e6,0.25).fillRect(spot.door.x-35,spot.y,70,80);
      entrance.lineStyle(1,0x24212a,0.2);
      for(let y=spot.y+10;y<spot.y+80;y+=15) entrance.lineBetween(spot.door.x-35,y,spot.door.x+35,y);
    }
    for (const [id, spot] of Object.entries(NPCS)) {
      const shadow=this.add.ellipse(spot.x,spot.y-3,48,14,0x24212a,0.25).setDepth(spot.y-1);
      const npc=this.add.image(spot.x,spot.y,id).setOrigin(0.5,1).setDisplaySize(id==="mochi"?58:64,160).setDepth(spot.y);
      this.npcSprites.push({sprite:npc,home:spot,shadow,phase:this.npcSprites.length});
      if(id==="mochi") this.mochi=npc;
      this.markers[id as keyof typeof NPCS]=this.makeMarker(spot.x,spot.y-185).setVisible(id==="mochi");
    }
    const offDestination=bus.on("destination",p=>this.navigate(p.x,p.y));
    this.events.once("shutdown",offDestination);
    this.input.on("pointerdown",(pointer:Phaser.Input.Pointer)=>{if(!bus.paused) this.navigate(pointer.worldX,pointer.worldY);});
    this.shadow = this.add.ellipse(SPAWN.x, SPAWN.y, 52, 16, 0x24212a, 0.28);
    this.player = this.add.sprite(SPAWN.x, SPAWN.y, "player").setOrigin(0.5, 1).setDisplaySize(PLAYER_W, PLAYER_H);
    const original = this.textures.get("player").getSourceImage() as HTMLImageElement;
    this.installWalking("explorer-walking", original, original.width, original.height);
    this.visitors = new TownVisitors(this,this.reduced,()=>[this.player,...this.npcSprites.map(n=>n.sprite)]);
    void this.visitors.create();
    const unsubscribeAvatar = bus.on("avatar", ({ url, sparkly }) => this.setAvatar(url, sparkly));
    this.events.once("shutdown", unsubscribeAvatar);

    // petals
    const g = this.make.graphics({ x: 0, y: 0 }, false);
    g.fillStyle(0xf4b8c6, 1).fillEllipse(6, 4, 12, 7).generateTexture("petal", 12, 8).destroy();
    if (!this.reduced) this.add.particles(0, 0, "petal", {
      x: { min: 0, max: WORLD.w }, y: -20, lifespan: 14000, speedY: { min: 30, max: 60 }, speedX: { min: -30, max: 30 },
      rotate: { start: 0, end: 360 }, scale: { min: 0.6, max: 1.1 }, alpha: { start: 0.9, end: 0.4 }, frequency: 260,
    }).setDepth(6000);

    this.cameras.main.setBounds(0, 0, WORLD.w, WORLD.h).startFollow(this.player, true, 0.12, 0.12).setRoundPixels(false);
    this.applyZoom();
    this.scale.on("resize", () => this.applyZoom());
    this.cameras.main.fadeIn(600, 246, 240, 230);

    const kb = this.input.keyboard;
    if (kb) {
      this.keys = kb.addKeys("W,A,S,D,UP,DOWN,LEFT,RIGHT,SHIFT") as TownScene["keys"];
      kb.removeCapture("W,A,S,D,SPACE");
    }
    bus.emit("ready", true);
  }

  private applyZoom() { const w = this.scale.width; this.cameras.main.setZoom(w < 640 ? 0.85 : w < 1100 ? 1 : 1.1); }

  private makeMarker(x: number, y: number) {
    const ring = this.add.circle(0, 0, 18, 0xd98fa0).setStrokeStyle(3, 0xf6f0e6);
    const dot = this.add.text(0, 0, "!", { fontFamily: "Zen Maru Gothic, sans-serif", fontSize: "24px", color: "#F6F0E6", fontStyle: "bold" }).setOrigin(0.5);
    const c = this.add.container(x, y, [ring, dot]).setDepth(7000);
    if (!this.reduced) this.tweens.add({ targets: c, y: y - 10, duration: 700, yoyo: true, repeat: -1, ease: "Sine.inOut" });
    return c;
  }

  setMarker(id: "mochi" | "sora" | "tetsu" | "yuzu" | "ren" | "hana" | "kaito" | "nami", visible: boolean) { this.markers[id]?.setVisible(visible); }

  celebrate(x: number, y: number) {
    if (this.reduced) return;
    const e = this.add.particles(x, y, "petal", { speed: { min: 120, max: 320 }, lifespan: 1200, quantity: 40, scale: { start: 1.4, end: 0 }, rotate: { start: 0, end: 540 }, emitting: false }).setDepth(8000);
    e.explode(48);
    this.time.delayedCall(1500, () => e.destroy());
  }

  private blocked(x: number, y: number) { return isBlocked(x,y,[...this.npcSprites.map(n=>n.sprite),...this.visitors?.positions??[]]); }

  override update(_t: number, dms: number) {
    const dt = Math.min(dms / 1000, 0.05);
    if (!this.reduced) this.water?.update(dt);
    let ix = bus.input.x, iy = bus.input.y;
    const k = this.keys;
    if (k) {
      const horizontal = Number(k.D.isDown || k.RIGHT.isDown) - Number(k.A.isDown || k.LEFT.isDown);
      const vertical = Number(k.S.isDown || k.DOWN.isDown) - Number(k.W.isDown || k.UP.isDown);
      if (k.D.isDown || k.RIGHT.isDown || k.A.isDown || k.LEFT.isDown) ix = horizontal;
      if (k.S.isDown || k.DOWN.isDown || k.W.isDown || k.UP.isDown) iy = vertical;
    }
    const p = this.player, m = this.mover;
    if(ix || iy) this.route=[];
    const waypoint=this.route[0];
    if(waypoint && !bus.paused) {
      const dx=waypoint.x-p.x,dy=waypoint.y-p.y,distance=Math.hypot(dx,dy);
      if(distance<9) this.route.shift();
      else {ix=dx/distance*Math.min(1,distance/24);iy=dy/distance*Math.min(1,distance/24);}
    }
    // Gentle patrols yield to the player and each other; no floating bob animation.
    for(const n of this.npcSprites) {
      const nx=n.home.x+Math.sin(_t/4000+n.phase)*22,ny=n.home.y+Math.sin(_t/5000+n.phase)*12;
      const others=[p,...this.npcSprites.filter(o=>o!==n).map(o=>o.sprite),...this.visitors?.positions??[]];
      if(!isBlocked(nx,ny,others)) n.sprite.setPosition(nx,ny).setDepth(ny);
      n.shadow.setPosition(n.sprite.x,n.sprite.y-3).setDepth(n.sprite.y-1);
    }
    if (m.x !== p.x || m.y !== p.y) { m.x = p.x; m.y = p.y; } // external teleports (dev/scripted) stay authoritative
    const speed = stepMover(m, ix, iy, !!k?.SHIFT.isDown, bus.paused, dt, (x, y) => this.blocked(x, y));
    p.setPosition(m.x, m.y).setFlipX(m.facing < 0);
    const stepping = speed > 12 && m.state !== "idle";
    if (stepping && !this.reduced) { p.play(this.walkAnimation, true); p.anims.timeScale = strideTimeScale(speed); }
    else if (p.anims.isPlaying) { p.anims.stop(); p.setFrame(0); }
    p.setDisplaySize(PLAYER_W * turnScale(m), PLAYER_H);
    p.setData("moveState", m.state);
    const moving = stepping;
    if (this.sparkly && !this.reduced && (this.sparkT -= dt) <= 0) {
      this.sparkT = moving ? 0.12 : 0.45;
      const sp = this.add.star(p.x + Phaser.Math.Between(-28, 28), p.y - Phaser.Math.Between(10, 150), 4, 2, 6, Phaser.Math.RND.pick([0xfff4c9, 0xf6bfcf, 0xffffff])).setDepth(p.y + 1).setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({ targets: sp, y: sp.y - 24, alpha: 0, scale: 0.3, angle: 90, duration: 900, onComplete: () => sp.destroy() });
    }
    p.setDepth(p.y); this.shadow.setPosition(p.x, p.y - 3).setDepth(p.y - 1);
    this.visitors?.update(dt,bus.paused);

    // proximity
    const spots = [
      { id: "mochi", label: "Talk to Mochi", x: MOCHI.x, y: MOCHI.y },
      { id: "library", label: "Enter Manga Library", x: LIBRARY.door.x, y: LIBRARY.door.y },
      { id: "sora", label: "Talk to Sora", x: SORA.x, y: SORA.y },
      { id: "cafe", label: "Enter Yasuragi Café", x: CAFE.door.x, y: CAFE.door.y },
      { id: "tetsu", label: "Talk to Tetsu", x: TETSU.x, y: TETSU.y },
      { id: "arcade", label: "Enter Trivia Arcade", x: ARCADE.door.x, y: ARCADE.door.y },
      { id: "yuzu", label: "Talk to Yuzu", x: YUZU.x, y: YUZU.y },
      { id: "plaza", label: "Enter Community Pavilion", x: PLAZA.door.x, y: PLAZA.door.y },
      { id: "ren", label: "Talk to Ren", x: REN.x, y: REN.y },
      { id: "workshop", label: "Enter Bicycle Workshop", x: WORKSHOP.door.x, y: WORKSHOP.door.y },
      { id: "hana", label: "Talk to Hana", x: HANA.x, y: HANA.y },
      { id: "studio", label: "Enter Town Art Studio", x: STUDIO.door.x, y: STUDIO.door.y },
      { id: "kaito", label: "Talk to Kaito", x: KAITO.x, y: KAITO.y },
      { id: "garden", label: "Enter Neighborhood Greenhouse", x: GARDEN.door.x, y: GARDEN.door.y },
      { id: "nami", label: "Talk to Nami", x: NAMI.x, y: NAMI.y },
      { id: "paper", label: "Enter Paper & Pages", x: PAPER.door.x, y: PAPER.door.y },
    ] as const;
    let best: (typeof spots)[number] | null = null, bd = INTERACT_RADIUS;
    for (const sp of spots) { const d = Math.hypot(p.x - sp.x, p.y - sp.y); if (d < bd) { bd = d; best = sp; } }
    const near = best?.id ?? "";
    if (near !== this.lastNear) { this.lastNear = near; bus.emit("near", best ? { id: best.id, label: best.label } : null); }
    if ((this.posTick += dms) > 100) { this.posTick = 0; bus.emit("pos", { x: p.x, y: p.y }); }
  }
}
