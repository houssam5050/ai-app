import { requireUser } from "@/lib/auth/session";
import { ok, errorToResponse } from "@/lib/api-response";
import { exerciseSubmitSchema } from "@/lib/validation/schemas";
import { submitExercise } from "@/server/services/exercise-service";
import { rateLimit } from "@/server/services/rate-limit";

export async function POST(req: Request) {
  try {
    const { user } = await requireUser();
    if (!rateLimit(`exercise:${user.id}`, 20, 60_000))
      return errorToResponse(new Error("RATE_LIMITED"));
    const body = exerciseSubmitSchema.parse(await req.json());
    const result = await submitExercise(user.id, body.exerciseId, body.code);
    return ok(result);
  } catch (e) {
    return errorToResponse(e);
  }
}
