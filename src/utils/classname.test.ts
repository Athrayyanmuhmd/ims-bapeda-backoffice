import { describe, expect, it } from "vitest";
import { cn } from "./classname";

describe("cn", () => {
  it("joins plain class strings", () => {
    expect(cn("flex", "items-center")).toBe("flex items-center");
  });

  it("drops falsy values", () => {
    expect(cn("flex", false && "hidden", undefined, null, "gap-2")).toBe("flex gap-2");
  });

  it("resolves conflicting Tailwind utilities to the last one", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  it("keeps non-conflicting utilities from conditional objects", () => {
    expect(cn("text-sm", { "font-bold": true, italic: false })).toBe("text-sm font-bold");
  });
});
