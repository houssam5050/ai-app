import { db } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/session";
import { ok, errorToResponse } from "@/lib/api-response";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ courseId: string }> },
) {
  try {
    const { user } = await requireUser();
    const { courseId } = await params;
    const course = await db.course.findUnique({ where: { id: courseId } });
    if (!course || course.status !== "PUBLISHED") return errorToResponse(new Error("NOT_FOUND"));
    await db.enrollment.upsert({
      where: { userId_courseId: { userId: user.id, courseId } },
      update: {},
      create: { userId: user.id, courseId },
    });
    return ok({ enrolled: true });
  } catch (e) {
    return errorToResponse(e);
  }
}
