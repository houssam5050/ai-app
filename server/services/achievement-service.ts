import "server-only";
import { db } from "@/lib/db/prisma";
import { awardXp } from "@/server/services/xp-service";

async function unlock(userId: string, key: string) {
  const achievement = await db.achievement.findUnique({ where: { key } });
  if (!achievement) return;
  const existing = await db.userAchievement.findUnique({
    where: { userId_achievementId: { userId, achievementId: achievement.id } },
  });
  if (existing) return;
  await db.userAchievement.create({
    data: { userId, achievementId: achievement.id },
  });
  if (achievement.xpReward > 0) {
    await awardXp({
      userId,
      amount: achievement.xpReward,
      reason: `achievement:${key}`,
      dedupeKey: `achievement:${userId}:${key}`,
    });
  }
  await db.notification.create({
    data: {
      userId,
      title: `Achievement unlocked: ${achievement.title}`,
      body: achievement.description,
      kind: "achievement",
    },
  });
}

export async function checkAchievements(userId: string) {
  const [lessons, passedQuizzes, streak, courses, exercises] = await Promise.all([
    db.lessonProgress.count({ where: { userId, completed: true } }),
    db.quizAttempt.count({ where: { userId, passed: true } }),
    db.userStreak.findUnique({ where: { userId } }),
    db.courseProgress.count({ where: { userId, percent: 100 } }),
    db.exerciseSubmission.count({ where: { userId, status: "PASSED" } }),
  ]);

  if (lessons >= 1) await unlock(userId, "first-lesson");
  if (passedQuizzes >= 1) await unlock(userId, "first-quiz-pass");
  if ((streak?.current ?? 0) >= 7) await unlock(userId, "streak-7");
  if (courses >= 1) await unlock(userId, "first-course");
  if (exercises >= 5) await unlock(userId, "coder-5");
}
