import { requireUser } from "@/lib/auth/session";
import { ok, errorToResponse } from "@/lib/api-response";
import { quizSubmitSchema } from "@/lib/validation/schemas";
import { submitQuiz } from "@/server/services/quiz-service";
import { rateLimit } from "@/server/services/rate-limit";

export async function POST(req: Request) {
  try {
    const { user } = await requireUser();
    if (!rateLimit(`quiz:${user.id}`, 20, 60_000))
      return errorToResponse(new Error("RATE_LIMITED"));
    const body = quizSubmitSchema.parse(await req.json());
    const result = await submitQuiz(user.id, body.quizId, body.answers);
    return ok(result);
  } catch (e) {
    return errorToResponse(e);
  }
}
