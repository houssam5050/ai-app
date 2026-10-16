import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { ok, errorToResponse } from "@/lib/api-response";
import { totalXp } from "@/server/services/xp-service";
import { paginationSchema } from "@/lib/validation/schemas";
import { db } from "@/lib/db/prisma";

export async function GET(req: NextRequest) {
  try {
    const { user } = await requireUser();
    const { page, pageSize } = paginationSchema.parse(
      Object.fromEntries(req.nextUrl.searchParams.entries()),
    );
    const [total, items] = await Promise.all([
      db.xPTransaction.count({ where: { userId: user.id } }),
      db.xPTransaction.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);
    const balance = await totalXp(user.id);
    return ok({ items, total, page, pageSize, balance });
  } catch (e) {
    return errorToResponse(e);
  }
}

export async function POST() {
  return NextResponse.json({ ok: false, error: { code: "GONE", message: "Use lesson/quiz endpoints." } }, { status: 410 });
}
