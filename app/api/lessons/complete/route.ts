import { requireUser } from "@/lib/auth/session";
import { ok, errorToResponse } from "@/lib/api-response";
import { completeLessonSchema } from "@/lib/validation/schemas";
import { completeLesson } from "@/server/services/progress-service";

export async function POST(req: Request) {
  try {
    const { user } = await requireUser();
    const body = completeLessonSchema.parse(await req.json());
    const result = await completeLesson(user.id, body.lessonId, body.timeSpentMin);
    return ok(result);
  } catch (e) {
    return errorToResponse(e);
  }
}
