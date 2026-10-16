import "server-only";
import { db } from "@/lib/db/prisma";
import { countCurrentStreak, utcDayKey } from "@/server/services/streak-calc";

/** Timezone policy: streak days are computed in UTC date boundaries. */
export function utcDate(d = new Date()): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export async function recordLearningActivity(userId: string, minutes: number) {
  const date = utcDate();
  await db.learningActivity.upsert({
    where: { userId_date: { userId, date } },
    update: { minutes: { increment: minutes } },
    create: { userId, date, minutes },
  });

  const activities = await db.learningActivity.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    take: 400,
  });

  const current = countCurrentStreak(activities.map((a) => utcDayKey(a.date)));
  const longest = Math.max(
    current,
    (await db.userStreak.findUnique({ where: { userId } }))?.longest ?? 0,
  );

  await db.userStreak.upsert({
    where: { userId },
    update: { current, longest, lastActiveDate: new Date() },
    create: { userId, current, longest, lastActiveDate: new Date() },
  });

  return { current, longest };
}
