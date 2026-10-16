import { z } from "zod";
import { NextRequest } from "next/server";
import { db } from "@/lib/db/prisma";
import { ok, errorToResponse } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const period = z.enum(["weekly", "all"]).parse(req.nextUrl.searchParams.get("period") ?? "all");
    const since = period === "weekly" ? new Date(Date.now() - 7 * 24 * 3600 * 1000) : new Date(0);
    const rows = await db.xPTransaction.groupBy({
      by: ["userId"],
      where: { createdAt: { gte: since } },
      _sum: { amount: true },
      orderBy: { _sum: { amount: "desc" } },
      take: 50,
    });
    const users = await db.user.findMany({
      where: { id: { in: rows.map((r) => r.userId) } },
      select: { id: true, name: true },
    });
    const names = new Map(users.map((u) => [u.id, u.name]));
    return ok(
      rows.map((r, i) => ({
        rank: i + 1,
        userId: r.userId,
        name: names.get(r.userId) ?? "Learner",
        xp: r._sum.amount ?? 0,
      })),
    );
  } catch (e) {
    return errorToResponse(e);
  }
}
