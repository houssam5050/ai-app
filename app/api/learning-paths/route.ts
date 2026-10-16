import { db } from "@/lib/db/prisma";
import { ok, errorToResponse } from "@/lib/api-response";

export async function GET() {
  try {
    const paths = await db.learningPath.findMany({
      include: { courses: { include: { course: true }, orderBy: { position: "asc" } } },
      orderBy: { createdAt: "desc" },
    });
    return ok(paths);
  } catch (e) {
    return errorToResponse(e);
  }
}
