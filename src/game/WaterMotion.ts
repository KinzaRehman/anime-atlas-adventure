import Phaser from "phaser";
import { HUB } from "./world";

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
    // Flow remains inside the new stream and never crosses either bridge.
    for(let i=0;i<48;i++) {
      const x=(i*47+this.time*38)%1920;
      if((x>520&&x<760)||(x>1160&&x<1400)) continue;
      const y=1390+Math.sin(i*13)*25;
      g.lineStyle(1.5,WATER_LIGHT,0.4).lineBetween(x,y,x+20,y+2);
    }
    for(let i=0;i<3;i++) {
      const radius=48+(this.time*12+i*17)%48;
      g.lineStyle(1,WATER_LIGHT,0.25).strokeEllipse(HUB.x,HUB.y+7,radius*2,radius);
    }
  }
}
