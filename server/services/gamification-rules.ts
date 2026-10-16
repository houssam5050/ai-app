// Single documented level formula used across the app.
// level(n) requires 100 * n * (n - 1) / 2 cumulative XP? We use simple thresholds:
// xpForLevel(level) = 100 * level * (level - 1) / 2 cumulative to REACH that level.
export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.floor((100 * level * (level - 1)) / 2);
}

export function levelForXp(totalXp: number): {
  level: number;
  xpIntoLevel: number;
  xpForNext: number;
} {
  let level = 1;
  while (xpForLevel(level + 1) <= totalXp) level += 1;
  const base = xpForLevel(level);
  const next = xpForLevel(level + 1);
  return { level, xpIntoLevel: totalXp - base, xpForNext: next - base };
}

export const XP_AWARDS = {
  LESSON_COMPLETE: 20,
  QUIZ_PASS: 50,
  EXERCISE_PASS: 60,
  COURSE_COMPLETE: 200,
  MISSION_BONUS_MULTIPLIER: 1,
} as const;
