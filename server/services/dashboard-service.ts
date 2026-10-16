import "server-only";
import { db } from "@/lib/db/prisma";
import { levelForXp } from "@/server/services/gamification-rules";
import { totalXp } from "@/server/services/xp-service";
import { utcDate } from "@/server/services/streak-service";

export async function getDashboardSummary(userId: string) {
  const [user, xp, streak, enrollments, completedLessons, goal, missions, achievements, notifications, activity] =
    await Promise.all([
      db.user.findUnique({
        where: { id: userId },
        include: { profile: true },
      }),
      totalXp(userId),
      db.userStreak.findUnique({ where: { userId } }),
      db.enrollment.findMany({
        where: { userId },
        include: {
          course: {
            include: {
              category: true,
            },
          },
        },
        orderBy: { enrolledAt: "desc" },
      }),
      db.lessonProgress.count({ where: { userId, completed: true } }),
      db.userLearningGoal.findFirst({ where: { userId }, orderBy: { createdAt: "desc" } }),
      db.userMissionProgress.findMany({
        where: { userId, date: utcDate() },
        include: { mission: true },
      }),
      db.userAchievement.findMany({
        where: { userId },
        include: { achievement: true },
        orderBy: { unlockedAt: "desc" },
        take: 5,
      }),
      db.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      db.learningActivity.findMany({
        where: { userId },
        orderBy: { date: "desc" },
        take: 7,
      }),
    ]);

  const completedCourses = await db.courseProgress.count({
    where: { userId, percent: 100 },
  });
  const timeMinutes = await db.learningActivity.aggregate({
    where: { userId },
    _sum: { minutes: true },
  });

  const today = activity.find(
    (a) => a.date.toISOString().slice(0, 10) === utcDate().toISOString().slice(0, 10),
  );
  const level = levelForXp(xp);

  const activeCourse = enrollments[0]?.course ?? null;

  const recommended = await db.course.findMany({
    where: { status: "PUBLISHED", id: { notIn: enrollments.map((e) => e.courseId) } },
    take: 4,
    orderBy: { createdAt: "desc" },
  });

  return {
    profile: { name: user?.name ?? "", email: user?.email ?? "" },
    xp: { total: xp, ...level },
    streak: { current: streak?.current ?? 0, longest: streak?.longest ?? 0 },
    counts: {
      enrolled: enrollments.length,
      completedCourses,
      completedLessons,
      minutes: timeMinutes._sum.minutes ?? 0,
    },
    goal: {
      dailyMinutes: goal?.dailyMinutes ?? 30,
      todayMinutes: today?.minutes ?? 0,
    },
    weeklyActivity: activity.reverse().map((a) => ({
      date: a.date.toISOString().slice(0, 10),
      minutes: a.minutes,
    })),
    activeCourse,
    achievements: achievements.map((a) => a.achievement),
    missions: missions.map((m) => ({
      id: m.missionId,
      title: m.mission.title,
      progress: m.progress,
      target: m.mission.target,
      done: m.done,
    })),
    notifications,
    recommended,
  };
}
