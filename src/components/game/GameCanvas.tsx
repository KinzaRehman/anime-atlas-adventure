import { useEffect, useRef } from "react";
import type { TownScene } from "@/game/TownScene";

// Loads Phaser only in the browser, after mount.
export function GameCanvas({ onScene }: { onScene: (s: TownScene) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let game: import("phaser").Game | undefined; let dead = false;
    (async () => {
      const Phaser = (await import("phaser")).default;
      const { TownScene } = await import("@/game/TownScene");
      if (dead || !ref.current) return;
      const scene = new TownScene();
      game = new Phaser.Game({ type: Phaser.AUTO, parent: ref.current, backgroundColor: "#24212A", scene: [scene],
        scale: { mode: Phaser.Scale.RESIZE, width: "100%", height: "100%" }, render: { antialias: true }, banner: false });
      if (import.meta.env.DEV) (window as unknown as { __scene: unknown }).__scene = scene; // test hook
      onScene(scene);
    })();
    return () => { dead = true; game?.destroy(true); };
  }, [onScene]);
  return <div ref={ref} className="absolute inset-0 touch-none" role="application" aria-label="Explorable town. Move with WASD or arrow keys, interact with E." />;
}
