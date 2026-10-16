import { NextRequest } from "next/server";
import { db } from "@/lib/db/prisma";
import { ok, errorToResponse } from "@/lib/api-response";
import { courseFilterSchema } from "@/lib/validation/schemas";

export async function GET(req: NextRequest) {
  try {
    const params = Object.fromEntries(req.nextUrl.searchParams.entries());
    const filters = courseFilterSchema.parse(params);
    const where = {
      status: "PUBLISHED" as const,
      ...(filters.q
        ? {
            OR: [
              { title: { contains: filters.q, mode: "insensitive" as const } },
              { description: { contains: filters.q, mode: "insensitive" as const } },
            ],
          }
        : {}),
      ...(filters.category ? { category: { slug: filters.category } } : {}),
      ...(filters.difficulty ? { difficulty: filters.difficulty } : {}),
    };
    const [total, courses] = await Promise.all([
      db.course.count({ where }),
      db.course.findMany({
        where,
        include: { category: true },
        orderBy: { createdAt: "desc" },
        skip: (filters.page - 1) * filters.pageSize,
        take: filters.pageSize,
      }),
    ]);
    return ok({ courses, total, page: filters.page, pageSize: filters.pageSize });
  } catch (e) {
    return errorToResponse(e);
  }
}
