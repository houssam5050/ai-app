import { db } from "@/lib/db/prisma";
import { ok, errorToResponse } from "@/lib/api-response";

export async function GET() {
  try {
    const achievements = await db.achievement.findMany({ orderBy: { title: "asc" } });
    return ok(achievements);
  } catch (e) {
    return errorToResponse(e);
  }
}
