import { NextRequest } from "next/server";
import { db } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/session";
import { ok, errorToResponse } from "@/lib/api-response";
import { notificationPatchSchema, paginationSchema } from "@/lib/validation/schemas";

export async function GET(req: NextRequest) {
  try {
    const { user } = await requireUser();
    const { page, pageSize } = paginationSchema.parse(
      Object.fromEntries(req.nextUrl.searchParams.entries()),
    );
    const [total, items] = await Promise.all([
      db.notification.count({ where: { userId: user.id } }),
      db.notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);
    return ok({ items, total, page, pageSize });
  } catch (e) {
    return errorToResponse(e);
  }
}

export async function PATCH(req: Request) {
  try {
    const { user } = await requireUser();
    const body = notificationPatchSchema.parse(await req.json());
    await db.notification.updateMany({
      where: { userId: user.id, id: { in: body.ids } },
      data: { read: body.read },
    });
    return ok({ updated: true });
  } catch (e) {
    return errorToResponse(e);
  }
}
