import { describe, it, expect } from "vitest";
import { levelForXp, xpForLevel } from "@/server/services/gamification-rules";

describe("levels", () => {
  it("starts at level 1 with zero thresholds", () => {
    expect(xpForLevel(1)).toBe(0);
    expect(levelForXp(0)).toMatchObject({ level: 1, xpIntoLevel: 0 });
  });
  it("uses xpForLevel(n) = 100*n*(n-1)/2 consistently", () => {
    expect(xpForLevel(2)).toBe(100);
    expect(xpForLevel(3)).toBe(300);
    expect(xpForLevel(5)).toBe(1000);
  });
  it("derives level and remainder from total XP", () => {
    expect(levelForXp(100)).toMatchObject({ level: 2, xpIntoLevel: 0, xpForNext: 200 });
    expect(levelForXp(150).level).toBe(2);
    expect(levelForXp(299).level).toBe(2);
    expect(levelForXp(300).level).toBe(3);
  });
  it("progresses monotonically", () => {
    const totals = [0, 50, 100, 250, 300, 999, 1000, 5000];
    const levels = totals.map((t) => levelForXp(t).level);
    expect([...levels].sort((a, b) => a - b)).toEqual(levels);
  });
});
