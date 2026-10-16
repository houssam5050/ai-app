import "server-only";
import { db } from "@/lib/db/prisma";
import { awardXp } from "@/server/services/xp-service";
import { recordLearningActivity } from "@/server/services/streak-service";
import { checkAchievements } from "@/server/services/achievement-service";
import { XP_AWARDS } from "@/server/services/gamification-rules";

export async function completeLesson(userId: string, lessonId: string, timeSpentMin: number) {
  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    include: { chapter: { select: { courseId: true } }, quiz: true, exercise: true },
  });
  if (!lesson) throw new Error("NOT_FOUND");

  // Gate: quiz/coding lessons require a passing attempt/submission first.
  if (lesson.type === "QUIZ" && lesson.quiz) {
    const passed = await db.quizAttempt.findFirst({
      where: { userId, quizId: lesson.quiz.id, passed: true },
    });
    if (!passed) throw new Error("QUIZ_REQUIRED");
  }
  if (lesson.type === "CODING" && lesson.exercise) {
    const passed = await db.exerciseSubmission.findFirst({
      where: { userId, exerciseId: lesson.exercise.id, status: "PASSED" },
    });
    if (!passed) throw new Error("EXERCISE_REQUIRED");
  }

  const existing = await db.lessonProgress.findUnique({
    where: { userId_lessonId: { userId, lessonId } },
  });
  const alreadyCompleted = existing?.completed ?? false;

  await db.lessonProgress.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    update: {
      completed: true,
      completedAt: existing?.completedAt ?? new Date(),
      timeSpentMin: { increment: timeSpentMin },
    },
    create: {
      userId,
      lessonId,
      completed: true,
      completedAt: new Date(),
      timeSpentMin,
    },
  });

  // Idempotent XP: dedupe key per user+lesson.
  if (!alreadyCompleted) {
    await awardXp({
      userId,
      amount: XP_AWARDS.LESSON_COMPLETE,
      reason: "lesson_complete",
      dedupeKey: `lesson:${userId}:${lessonId}`,
    });
  }

  await recordLearningActivity(userId, timeSpentMin);
  await recalcCourseProgress(userId, lesson.chapter.courseId);
  await checkAchievements(userId);
  return { completed: true, alreadyCompleted };
}

export async function recalcCourseProgress(userId: string, courseId: string) {
  const lessons = await db.lesson.findMany({
    where: { chapter: { courseId }, required: true },
    select: { id: true },
  });
  const total = lessons.length;
  const done = total
    ? await db.lessonProgress.count({
        where: {
          userId,
          completed: true,
          lessonId: { in: lessons.map((l) => l.id) },
        },
      })
    : 0;
  const percent = total ? Math.round((done / total) * 100) : 0;
  await db.courseProgress.upsert({
    where: { userId_courseId: { userId, courseId } },
    update: { percent, completedLessons: done, totalLessons: total },
    create: { userId, courseId, percent, completedLessons: done, totalLessons: total },
  });
  if (total > 0 && done === total) {
    await awardXp({
      userId,
      amount: XP_AWARDS.COURSE_COMPLETE,
      reason: "course_complete",
      dedupeKey: `course:${userId}:${courseId}`,
    });
    await db.notification.create({
      data: {
        userId,
        title: "Course completed",
        body: "You finished all required lessons.",
        kind: "course",
      },
    });
    await checkAchievements(userId);
  }
  return { percent, done, total };
}
