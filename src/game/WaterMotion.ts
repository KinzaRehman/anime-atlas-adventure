import Phaser from "phaser";

// Water highlights use the town's ivory and matcha roles, matching the painted ground.
const WATER_LIGHT = 0xf6f0e6;
const WATER_SHADE = 0x8fa678;
export class WaterMotion {
  private graphics: Phaser.GameObjects.Graphics;
  private time = 0;
  constructor(scene: Phaser.Scene) {
    this.graphics = scene.add.graphics().setDepth(-8);
  }
  update(dt: number) {
    this.time += dt;
    const g = this.graphics; g.clear();
    // Current follows the exposed river, leaving the bridge and banks untouched.
    for (let i = 0; i < 36; i++) {
      const t = ((i / 36 + this.time * 0.045) % 1);
      const lane = Math.sin(i * 19) * 24;
      const x = 1820 - t * 990;
      const y = 1340 + Math.sin(t * Math.PI / 2) * 300 + lane;
      g.lineStyle(1.6, WATER_LIGHT, 0.18 + Math.sin(t * Math.PI) * 0.18);
      g.beginPath(); g.moveTo(x, y); g.lineTo(x - 12, y + 4); g.lineTo(x - 27, y + 3); g.strokePath();
    }
    for (let i = 0; i < 8; i++) {
      const t = (i / 8 + this.time * 0.07) % 1;
      g.lineStyle(1.4, WATER_LIGHT, 0.3);
      g.beginPath(); g.moveTo(315 - t * 280, 1480 + i * 8); g.lineTo(290 - t * 280, 1484 + i * 8); g.strokePath();
    }
    // Expanding ripples in the fountain basin and falling threads below each tier.
    for (let i = 0; i < 3; i++) {
      const phase = (this.time * 0.55 + i / 3) % 1;
      g.lineStyle(1.5, WATER_LIGHT, (1 - phase) * 0.6);
      g.strokeEllipse(975, 714, 80 + phase * 150, 32 + phase * 56);
    }
    for (let i = 0; i < 7; i++) {
      const phase = (this.time * 1.4 + i * 0.17) % 1;
      g.lineStyle(1.3, i % 2 ? WATER_SHADE : WATER_LIGHT, 0.5);
      const x = 943 + i * 10;
      g.lineBetween(x, 648 + phase * 45, x + Math.sin(this.time * 3 + i) * 2, 658 + phase * 45);
    }
  }
}