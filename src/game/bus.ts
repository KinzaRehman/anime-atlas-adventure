// Tiny bridge between the Phaser scene and the React HUD (no React/Phaser imports).
export type Target = { id: "mochi" | "library" | "sora" | "cafe" | "tetsu" | "arcade" | "yuzu" | "plaza" | "ren" | "workshop" | "hana" | "studio" | "kaito" | "garden" | "nami" | "paper"; label: string } | null;
type Events = { near: Target; pos: { x: number; y: number }; ready: true; destination: { x: number; y: number }; avatar: { url: string; sparkly: boolean } };
type Fn<K extends keyof Events> = (v: Events[K]) => void;
const listeners: { [K in keyof Events]?: Set<Fn<K>> } = {};
export const bus = {
  input: { x: 0, y: 0 },
  paused: false,
  on<K extends keyof Events>(k: K, f: Fn<K>) { ((listeners[k] ??= new Set() as never) as Set<Fn<K>>).add(f); return () => (listeners[k] as Set<Fn<K>>).delete(f); },
  emit<K extends keyof Events>(k: K, v: Events[K]) { (listeners[k] as Set<Fn<K>> | undefined)?.forEach((f) => f(v)); },
};
