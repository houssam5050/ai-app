import { requireUser } from "@/lib/auth/session";
import { ok, errorToResponse } from "@/lib/api-response";
import { db } from "@/lib/db/prisma";

export async function GET() {
  try {
    const { user } = await requireUser();
    const [xp, achievements, progress] = await Promise.all([
      db.xPTransaction.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      db.userAchievement.findMany({
        where: { userId: user.id },
        include: { achievement: true },
        orderBy: { unlockedAt: "desc" },
      }),
      db.courseProgress.findMany({ where: { userId: user.id } }),
    ]);
    return ok({ xp, achievements: achievements.map((a) => a.achievement), progress });
  } catch (e) {
    return errorToResponse(e);
  }
}
