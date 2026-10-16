/** Pure streak helpers — no database, safe to unit test. */

export function utcDayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Count consecutive active days ending today (or yesterday if today is missing). */
export function countCurrentStreak(dayKeys: string[], now = new Date()): number {
  const days = new Set(dayKeys);
  const cursor = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  if (!days.has(utcDayKey(cursor))) {
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  let current = 0;
  while (days.has(utcDayKey(cursor))) {
    current += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return current;
}
