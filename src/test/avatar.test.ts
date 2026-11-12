import { describe, it, expect, beforeEach } from "vitest";
import { buyAvatarItem, setAvatarPart, addXp, reset } from "@/lib/progress";
describe("avatar shop", () => {
  beforeEach(() => { localStorage.clear(); reset(); });
  it("free options can be worn, paid ones need purchase", () => {
    expect(setAvatarPart("boy")).toBe(true);
    expect(setAvatarPart("hair-sakura")).toBe(false);
    expect(buyAvatarItem("hair-sakura")).toBe("insufficient");
    addXp(50);
    expect(buyAvatarItem("hair-sakura")).toBe("bought");
    expect(buyAvatarItem("hair-sakura")).toBe("owned");
    expect(setAvatarPart("hair-sakura")).toBe(true);
    const saved = JSON.parse(localStorage.getItem("animeatlas-progress-v1")!);
    expect(saved.spentXp).toBe(40); expect(saved.xp).toBe(50); expect(saved.avatar.hair).toBe("hair-sakura");
  });
});
