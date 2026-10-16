import "server-only";
import { db } from "@/lib/db/prisma";
import { awardXp } from "@/server/services/xp-service";
import { checkAchievements } from "@/server/services/achievement-service";
import { XP_AWARDS } from "@/server/services/gamification-rules";
import { gradeAnswers } from "@/server/services/quiz-grading";

export async function submitQuiz(
  userId: string,
  quizId: string,
  answers: { questionId: string; selectedOptionIds: string[] }[],
) {
  const quiz = await db.quiz.findUnique({
    where: { id: quizId },
    include: { questions: { include: { options: true } } },
  });
  if (!quiz) throw new Error("NOT_FOUND");

  if (quiz.maxAttempts != null) {
    const count = await db.quizAttempt.count({ where: { userId, quizId } });
    if (count >= quiz.maxAttempts) throw new Error("ATTEMPT_LIMIT");
  }

  let correctCount = 0;
  const graded = answers.map((a) => {
    const q = quiz.questions.find((qq) => qq.id === a.questionId);
    if (!q) return { ...a, correct: false };
    const { correct: flags } = gradeAnswers([
      {
        questionId: a.questionId,
        correctOptionIds: q.options.filter((o) => o.isCorrect).map((o) => o.id),
        selectedOptionIds: a.selectedOptionIds,
      },
    ]);
    const correct = flags[0] ?? false;
    if (correct) correctCount += 1;
    return { ...a, correct };
  });

  const score = quiz.questions.length
    ? Math.round((correctCount / quiz.questions.length) * 100)
    : 0;
  const passed = score >= quiz.passScore;

  const attempt = await db.quizAttempt.create({
    data: {
      userId,
      quizId,
      score,
      passed,
      responses: {
        create: graded.map((g) => ({
          questionId: g.questionId,
          selectedOptionIds: g.selectedOptionIds,
          correct: g.correct,
        })),
      },
    },
  });

  if (passed) {
    await awardXp({
      userId,
      amount: XP_AWARDS.QUIZ_PASS,
      reason: "quiz_pass",
      dedupeKey: `quiz:${userId}:${quizId}`,
    });
    await checkAchievements(userId);
  }

  const explanations = quiz.questions.map((q) => ({
    questionId: q.id,
    explanation: q.explanation,
  }));

  return { attemptId: attempt.id, score, passed, explanations };
}
