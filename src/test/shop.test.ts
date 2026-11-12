import { beforeEach, expect, it, vi } from "vitest";
beforeEach(() => { localStorage.clear(); vi.resetModules(); });
const saved = () => JSON.parse(localStorage.getItem("animeatlas-progress-v1") ?? "{}");
it("buys a 25 XP pin with first-chat earnings without lowering level XP", async () => {
  const store = await import("@/lib/progress");
  store.rewardFirstChat("mochi", true);
  expect(store.buyItem("book-club")).toBe("bought");
  expect(saved().xp).toBe(25);
  expect(saved().spentXp).toBe(25);
  expect(saved().equippedItem).toBe("book-club");
  expect(store.availableXp(saved())).toBe(0);
});
it("rejects insufficient funds and duplicate purchases", async () => {
  const store = await import("@/lib/progress");
  expect(store.buyItem("cafe-regular")).toBe("insufficient");
  store.addXp(100);
  expect(store.buyItem("town-guide")).toBe("bought");
  expect(store.buyItem("town-guide")).toBe("owned");
  expect(saved().spentXp).toBe(100);
});
it("persists purchases through reload and equips only owned items", async () => {
  const store = await import("@/lib/progress");
  store.addXp(75); store.buyItem("book-club"); store.buyItem("cafe-regular");
  vi.resetModules();
  const reloaded = await import("@/lib/progress");
  reloaded.equipItem("book-club");
  expect(saved().equippedItem).toBe("book-club");
  reloaded.equipItem("town-guide");
  expect(saved().equippedItem).toBe("book-club");
  expect(saved().items).toEqual(["book-club", "cafe-regular"]);
  expect(saved().spentXp).toBe(75);
});