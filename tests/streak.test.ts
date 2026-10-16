import { describe, it, expect } from "vitest";
import { countCurrentStreak, utcDayKey } from "@/server/services/streak-calc";

describe("streak calculation", () => {
  it("counts consecutive days ending today", () => {
    const today = new Date();
    const days = [0, 1, 2].map((n) => {
      const d = new Date(today);
      d.setUTCDate(d.getUTCDate() - n);
      return utcDayKey(d);
    });
    expect(countCurrentStreak(days, today)).toBe(3);
  });

  it("tolerates a missing today when yesterday exists", () => {
    const today = new Date();
    const days = [1, 2].map((n) => {
      const d = new Date(today);
      d.setUTCDate(d.getUTCDate() - n);
      return utcDayKey(d);
    });
    expect(countCurrentStreak(days, today)).toBe(2);
  });

  it("breaks on a gap", () => {
    const today = new Date();
    const mk = (n: number) => {
      const d = new Date(today);
      d.setUTCDate(d.getUTCDate() - n);
      return utcDayKey(d);
    };
    expect(countCurrentStreak([mk(0), mk(2), mk(3)], today)).toBe(1);
  });

  it("deduplicates same-day activity", () => {
    const today = new Date();
    const key = utcDayKey(today);
    expect(countCurrentStreak([key, key, key], today)).toBe(1);
  });
});
