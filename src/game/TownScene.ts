import Phaser from "phaser";
import ground from "@/assets/world/ground.webp";
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
import { WORKSHOP, REN, STUDIO, HANA } from "./world";
import { bus } from "./bus";
import { ARCADE, BLOCKERS, CAFE, INTERACT_RADIUS, LIBRARY, MOCHI, PLAZA, SORA, SPAWN, TETSU, WORLD, YUZU } from "./world";

const SPEED = 260; // px/s
const ACCEL = 12;  // velocity smoothing

export class TownScene extends Phaser.Scene {
  player!: Phaser.GameObjects.Image;
  private shadow!: Phaser.GameObjects.Ellipse;
  private mochi!: Phaser.GameObjects.Image;
  private markers: Partial<Record<"mochi" | "sora" | "tetsu" | "yuzu" | "ren" | "hana", Phaser.GameObjects.Container>> = {};
  private vel = new Phaser.Math.Vector2();
  private keys!: Record<"W" | "A" | "S" | "D" | "UP" | "DOWN" | "LEFT" | "RIGHT", Phaser.Input.Keyboard.Key>;
  private walkT = 0;
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
  }

  create() {
    this.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.add.image(0, 0, "ground").setOrigin(0).setDepth(-10);
    // warm evening grade
    this.add.rectangle(0, 0, WORLD.w, WORLD.h, 0xffb27a, 0.08).setOrigin(0).setDepth(5000).setBlendMode(Phaser.BlendModes.MULTIPLY);

    const lib = this.add.image(LIBRARY.x, LIBRARY.y + 140, "library").setOrigin(0.5, 1);
    lib.setScale(LIBRARY.w / lib.width).setDepth(LIBRARY.y + 140);
    // door glow
    const glow = this.add.circle(LIBRARY.door.x, LIBRARY.door.y, 70, 0xffd27a, 0.25).setBlendMode(Phaser.BlendModes.ADD).setDepth(1);
    if (!this.reduced) this.tweens.add({ targets: glow, alpha: 0.08, duration: 1400, yoyo: true, repeat: -1, ease: "Sine.inOut" });

    this.mochi = this.add.image(MOCHI.x, MOCHI.y, "mochi").setOrigin(0.5, 1).setDisplaySize(64, 187).setDepth(MOCHI.y);
    this.add.ellipse(MOCHI.x, MOCHI.y - 4, 56, 16, 0x24212a, 0.25).setDepth(MOCHI.y - 1);
    if (!this.reduced) this.tweens.add({ targets: this.mochi, y: MOCHI.y - 4, duration: 900, yoyo: true, repeat: -1, ease: "Sine.inOut" });
    this.markers.mochi = this.makeMarker(MOCHI.x, MOCHI.y - 210);

    const cafe = this.add.image(CAFE.x, CAFE.y + 140, "cafe").setOrigin(0.5, 1);
    cafe.setScale(CAFE.w / cafe.width).setDepth(CAFE.y + 140);
    const cglow = this.add.circle(CAFE.door.x, CAFE.door.y, 70, 0xffd27a, 0.22).setBlendMode(Phaser.BlendModes.ADD).setDepth(1);
    if (!this.reduced) this.tweens.add({ targets: cglow, alpha: 0.06, duration: 1700, yoyo: true, repeat: -1, ease: "Sine.inOut" });
    const sora = this.add.image(SORA.x, SORA.y, "sora").setOrigin(0.5, 1).setDisplaySize(54, 190).setDepth(SORA.y);
    this.add.ellipse(SORA.x, SORA.y - 4, 52, 15, 0x24212a, 0.25).setDepth(SORA.y - 1);
    if (!this.reduced) this.tweens.add({ targets: sora, y: SORA.y - 3, duration: 1100, yoyo: true, repeat: -1, ease: "Sine.inOut" });
    this.markers.sora = this.makeMarker(SORA.x, SORA.y - 215).setVisible(false);

    for (const [key, spot] of [["arcade", ARCADE], ["plaza", PLAZA], ["workshop", WORKSHOP], ["studio", STUDIO]] as const) {
      const offset = key === "workshop" || key === "studio" ? 0 : 140;
      const building = this.add.image(spot.x, spot.y + offset, key).setOrigin(0.5, 1);
      building.setScale(spot.w / building.width).setDepth(spot.y + offset);
    }
    for (const [id, spot, width] of [["tetsu", TETSU, 58], ["yuzu", YUZU, 56], ["ren", REN, 70], ["hana", HANA, 65]] as const) {
      this.add.ellipse(spot.x, spot.y - 4, 52, 15, 0x24212a, 0.25).setDepth(spot.y - 1);
      const npc = this.add.image(spot.x, spot.y, id).setOrigin(0.5, 1).setDisplaySize(width, 190).setDepth(spot.y);
      if (!this.reduced) this.tweens.add({ targets: npc, y: spot.y - 3, duration: 1200, yoyo: true, repeat: -1, ease: "Sine.inOut" });
      this.markers[id] = this.makeMarker(spot.x, spot.y - 215).setVisible(false);
    }

    this.shadow = this.add.ellipse(SPAWN.x, SPAWN.y, 52, 16, 0x24212a, 0.28);
    this.player = this.add.image(SPAWN.x, SPAWN.y, "player").setOrigin(0.5, 1).setDisplaySize(62, 168);

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
      this.keys = kb.addKeys("W,A,S,D,UP,DOWN,LEFT,RIGHT") as TownScene["keys"];
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

  setMarker(id: "mochi" | "sora" | "tetsu" | "yuzu" | "ren" | "hana", visible: boolean) { this.markers[id]?.setVisible(visible); }

  celebrate(x: number, y: number) {
    if (this.reduced) return;
    const e = this.add.particles(x, y, "petal", { speed: { min: 120, max: 320 }, lifespan: 1200, quantity: 40, scale: { start: 1.4, end: 0 }, rotate: { start: 0, end: 540 }, emitting: false }).setDepth(8000);
    e.explode(48);
    this.time.delayedCall(1500, () => e.destroy());
  }

  private blocked(x: number, y: number) {
    if (x < 30 || y < 120 || x > WORLD.w - 30 || y > WORLD.h - 10) return true;
    if (Math.hypot(x - MOCHI.x, (y - MOCHI.y) * 2) < 40 || Math.hypot(x - SORA.x, (y - SORA.y) * 2) < 40) return true;
    if ([TETSU, YUZU, REN, HANA].some((npc) => Math.hypot(x - npc.x, (y - npc.y) * 2) < 40)) return true;
    return BLOCKERS.some(([bx, by, bw, bh]) => x > bx && x < bx + bw && y > by && y < by + bh);
  }

  override update(_t: number, dms: number) {
    const dt = Math.min(dms / 1000, 0.05);
    let ix = bus.input.x, iy = bus.input.y;
    const k = this.keys;
    if (k) {
      const horizontal = Number(k.D.isDown || k.RIGHT.isDown) - Number(k.A.isDown || k.LEFT.isDown);
      const vertical = Number(k.S.isDown || k.DOWN.isDown) - Number(k.W.isDown || k.UP.isDown);
      if (k.D.isDown || k.RIGHT.isDown || k.A.isDown || k.LEFT.isDown) ix = horizontal;
      if (k.S.isDown || k.DOWN.isDown || k.W.isDown || k.UP.isDown) iy = vertical;
    }
    if (bus.paused) { ix = 0; iy = 0; }
    const len = Math.hypot(ix, iy); if (len > 1) { ix /= len; iy /= len; }
    const blend = 1 - Math.exp(-ACCEL * dt);
    this.vel.x += (ix * SPEED - this.vel.x) * blend;
    this.vel.y += (iy * SPEED - this.vel.y) * blend;
    const p = this.player;
    const nx = p.x + this.vel.x * dt, ny = p.y + this.vel.y * dt;
    if (!this.blocked(nx, p.y)) p.x = nx; else this.vel.x = 0;
    if (!this.blocked(p.x, ny)) p.y = ny; else this.vel.y = 0;

    const moving = Math.hypot(this.vel.x, this.vel.y) > 20;
    if (moving) { this.walkT += dt * 12; if (Math.abs(this.vel.x) > 20) p.setFlipX(this.vel.x < 0); }
    const bob = moving && !this.reduced ? Math.abs(Math.sin(this.walkT)) * 5 : 0;
    p.setDisplaySize(62, 168 - bob * 0.6).setAngle(moving && !this.reduced ? Math.sin(this.walkT) * 2.5 : 0);
    p.setDepth(p.y); this.shadow.setPosition(p.x, p.y - 3).setDepth(p.y - 1);

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
    ] as const;
    let best: (typeof spots)[number] | null = null, bd = INTERACT_RADIUS;
    for (const sp of spots) { const d = Math.hypot(p.x - sp.x, p.y - sp.y); if (d < bd) { bd = d; best = sp; } }
    const near = best?.id ?? "";
    if (near !== this.lastNear) { this.lastNear = near; bus.emit("near", best ? { id: best.id, label: best.label } : null); }
    if ((this.posTick += dms) > 100) { this.posTick = 0; bus.emit("pos", { x: p.x, y: p.y }); }
  }
}
