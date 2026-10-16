import { NextResponse } from "next/server";

export function ok(data: unknown, status = 200) {
  return NextResponse.json({ ok: true, data }, { status });
}

export function fail(code: string, message: string, status = 400) {
  return NextResponse.json({ ok: false, error: { code, message } }, { status });
}

export function errorToResponse(e: unknown) {
  const message = e instanceof Error ? e.message : "Unknown error";
  if (message === "UNAUTHORIZED") return fail("UNAUTHORIZED", "Sign in required.", 401);
  if (message === "FORBIDDEN") return fail("FORBIDDEN", "Not allowed.", 403);
  if (message === "NOT_FOUND") return fail("NOT_FOUND", "Not found.", 404);
  if (message === "QUIZ_REQUIRED")
    return fail("QUIZ_REQUIRED", "Pass the quiz before completing this lesson.", 409);
  if (message === "EXERCISE_REQUIRED")
    return fail("EXERCISE_REQUIRED", "Pass the coding exercise before completing this lesson.", 409);
  if (message === "ATTEMPT_LIMIT")
    return fail("ATTEMPT_LIMIT", "No attempts remaining.", 409);
  if (message === "NOT_ELIGIBLE")
    return fail("NOT_ELIGIBLE", "Completion requirements not met.", 409);
  if (message === "RATE_LIMITED")
    return fail("RATE_LIMITED", "Too many requests. Slow down.", 429);
  return fail("INTERNAL", "Something went wrong.", 500);
}
