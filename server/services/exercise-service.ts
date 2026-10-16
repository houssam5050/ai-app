import "server-only";
import { db } from "@/lib/db/prisma";
import { awardXp } from "@/server/services/xp-service";
import { checkAchievements } from "@/server/services/achievement-service";
import { XP_AWARDS } from "@/server/services/gamification-rules";

export interface CodeRunner {
  evaluate(input: {
    language: string;
    code: string;
    testsJson: string;
  }): Promise<{ passed: boolean; feedback: string }>;
}

class UnconfiguredRunner implements CodeRunner {
  async evaluate() {
    return {
      passed: false,
      feedback:
        "Code execution provider is not configured. Set JUDGE0_API_URL / JUDGE0_API_KEY to enable sandboxed execution.",
    };
  }
}

class Judge0Runner implements CodeRunner {
  async evaluate(input: { language: string; code: string; testsJson: string }) {
    // Minimal stub: real Judge0 integration requires language mapping + polling.
    // Keep behind interface; report unconfigured until fully wired.
    void input;
    return {
      passed: false,
      feedback:
        "Judge0 runner skeleton: configure language IDs and polling before use.",
    };
  }
}

export function getCodeRunner(): CodeRunner {
  if (process.env.JUDGE0_API_URL) return new Judge0Runner();
  return new UnconfiguredRunner();
}

/** Naive local checks for deterministic seed tests (never exec user code). */
function localCheck(code: string, testsJson: string): { passed: boolean; feedback: string } | null {
  try {
    const tests = JSON.parse(testsJson) as { contains?: string[] }[];
    const required: string[] = Array.isArray(tests)
      ? tests.flatMap((t) => t.contains ?? [])
      : [];
    if (!required.length) return null;
    const missing = required.filter((s) => !code.includes(s));
    if (missing.length)
      return { passed: false, feedback: `Missing expected code: ${missing.join(", ")}` };
    return { passed: true, feedback: "All static checks passed." };
  } catch {
    return null;
  }
}

export async function submitExercise(userId: string, exerciseId: string, code: string) {
  const exercise = await db.codingExercise.findUnique({ where: { id: exerciseId } });
  if (!exercise) throw new Error("NOT_FOUND");

  const staticResult = localCheck(code, exercise.testsJson);
  let status: "PASSED" | "FAILED" | "PENDING" = "PENDING";
  let feedback = "";

  if (staticResult) {
    status = staticResult.passed ? "PASSED" : "FAILED";
    feedback = staticResult.feedback;
  } else {
    const runner = getCodeRunner();
    const result = await runner.evaluate({
      language: exercise.language,
      code,
      testsJson: exercise.testsJson,
    });
    status = result.passed ? "PASSED" : "FAILED";
    feedback = result.feedback;
    if (!process.env.JUDGE0_API_URL) status = "PENDING";
  }

  const submission = await db.exerciseSubmission.create({
    data: { userId, exerciseId, code, status, feedback },
  });

  if (status === "PASSED") {
    await awardXp({
      userId,
      amount: XP_AWARDS.EXERCISE_PASS,
      reason: "exercise_pass",
      dedupeKey: `exercise:${userId}:${exerciseId}`,
    });
    await checkAchievements(userId);
  }

  return { submissionId: submission.id, status, feedback };
}
