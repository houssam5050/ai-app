import "server-only";
import { db } from "@/lib/db/prisma";

/** Idempotent XP award: dedupeKey must be unique per eligible event. */
export async function awardXp(input: {
  userId: string;
  amount: number;
  reason: string;
  dedupeKey: string;
}) {
  try {
    await db.xPTransaction.create({
      data: {
        userId: input.userId,
        amount: input.amount,
        reason: input.reason,
        dedupeKey: input.dedupeKey,
      },
    });
    return { awarded: true as const };
  } catch {
    // Unique violation => already awarded.
    return { awarded: false as const };
  }
}

export async function totalXp(userId: string): Promise<number> {
  const agg = await db.xPTransaction.aggregate({
    where: { userId },
    _sum: { amount: true },
  });
  return agg._sum.amount ?? 0;
}
