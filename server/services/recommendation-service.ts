import "server-only";
import { db } from "@/lib/db/prisma";

/** Transparent rule-based recommendations (interests → difficulty → freshness). */
export async function recommendCourses(userId: string, limit = 4) {
  const [profile, enrollments] = await Promise.all([
    db.userProfile.findUnique({ where: { userId } }),
    db.enrollment.findMany({ where: { userId }, select: { courseId: true } }),
  ]);
  const enrolledIds = new Set(enrollments.map((e) => e.courseId));
  const interests = profile?.interests ?? [];

  const candidates = await db.course.findMany({
    where: { status: "PUBLISHED" },
    include: { category: true },
    take: 50,
    orderBy: { createdAt: "desc" },
  });

  return candidates
    .filter((c) => !enrolledIds.has(c.id))
    .map((c) => ({
      course: c,
      score:
        (interests.includes(c.category?.slug ?? "") ? 2 : 0) +
        (c.difficulty === "BEGINNER" ? 1 : 0),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((r) => r.course);
}
