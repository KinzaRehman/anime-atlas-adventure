import { describe, expect, it } from "vitest";
import { authDestination } from "@/lib/auth-destination";

describe("login return destination", () => {
  it("returns the player to Chat or Profile after sign-in", () => {
    expect(authDestination("/chat")).toBe("/chat");
    expect(authDestination("/profile")).toBe("/profile");
  });
  it("rejects outside destinations and authentication loops", () => {
    for (const path of ["https://other.example", "//other.example", "/\\other.example", "/auth?redirect=/chat", "/reset-password"]) {
      expect(authDestination(path)).toBeUndefined();
    }
  });
});