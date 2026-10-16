import { z } from "zod";
import { requireUser } from "@/lib/auth/session";
import { ok, errorToResponse } from "@/lib/api-response";
import { rateLimit } from "@/server/services/rate-limit";
import { getEnv } from "@/lib/env";

const tutorSchema = z.object({
  message: z.string().min(1).max(4000),
  lessonId: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const { user } = await requireUser();
    if (!rateLimit(`tutor:${user.id}`, 10, 60_000))
      return errorToResponse(new Error("RATE_LIMITED"));
    const body = tutorSchema.parse(await req.json());
    const env = getEnv();
    if (!env.AI_PROVIDER_API_KEY) {
      return ok({
        configured: false,
        reply:
          "AI tutor is not configured yet. Set AI_PROVIDER_API_KEY to enable it. Meanwhile, review the lesson content and try the hints in the exercise instructions.",
      });
    }
    // Provider integration point: stream from configured LLM here (hints-first).
    void body;
    return ok({
      configured: true,
      reply: "Tutor provider is configured but the connector is a stub in this build.",
    });
  } catch (e) {
    return errorToResponse(e);
  }
}
