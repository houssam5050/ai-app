export const dynamic = "force-dynamic";

import Link from "next/link";
import { db } from "@/lib/db/prisma";
import type { Category, Chapter, Course, Lesson } from "@prisma/client";
import { cardClasses, buttonClasses } from "@/components/ui/primitives";
export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; difficulty?: string }>;
}) {
  const sp = await searchParams;
  type CourseWithRelations = Course & {
    category: Category | null;
    chapters: (Chapter & { lessons: Lesson[] })[];
  };
  let courses: CourseWithRelations[] = [];
  let categories: Category[] = [];
  let unavailable = false;
  try {
    [courses, categories] = await Promise.all([
      db.course.findMany({
        where: {
          status: "PUBLISHED",
          ...(sp.q
            ? {
                OR: [
                  { title: { contains: sp.q, mode: "insensitive" } },
                  { description: { contains: sp.q, mode: "insensitive" } },
                ],
              }
            : {}),
          ...(sp.category ? { category: { slug: sp.category } } : {}),
          ...(sp.difficulty && ["BEGINNER", "INTERMEDIATE", "ADVANCED"].includes(sp.difficulty)
            ? { difficulty: sp.difficulty as "BEGINNER" | "INTERMEDIATE" | "ADVANCED" }
            : {}),
        },
        include: { category: true, chapters: { include: { lessons: true } } },
        orderBy: { createdAt: "desc" },
      }),
      db.category.findMany({ orderBy: { name: "asc" } }),
    ]);
  } catch {
    unavailable = true;
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10">
      <h1 className="text-3xl font-bold">Course catalog</h1>
      <form className="flex flex-wrap gap-2" method="get">
        <input
          name="q"
          defaultValue={sp.q ?? ""}
          placeholder="Search courses…"
          className="rounded-full border px-4 py-2 text-sm"
        />
        <select name="category" defaultValue={sp.category ?? ""} className="rounded-full border px-4 py-2 text-sm">
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>{c.name}</option>
          ))}
        </select>
        <select name="difficulty" defaultValue={sp.difficulty ?? ""} className="rounded-full border px-4 py-2 text-sm">
          <option value="">All levels</option>
          <option value="BEGINNER">Beginner</option>
          <option value="INTERMEDIATE">Intermediate</option>
          <option value="ADVANCED">Advanced</option>
        </select>
        <button type="submit" className={buttonClasses("secondary")}>Filter</button>
      </form>

      {unavailable && (
        <div className={cardClasses()}>
          <p className="text-sm text-amber-700">
            Catalog is temporarily unavailable (database not reachable). Complete the setup steps in the README, then reload.
          </p>
        </div>
      )}
      {!unavailable && courses.length === 0 && (
        <div className={cardClasses()}>
          <p className="text-sm text-zinc-500">No published courses match your filters yet.</p>
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-3">
        {courses.map((c) => (
          <div key={c.id} className={cardClasses()}>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
              {c.category?.name ?? "General"} · {c.difficulty}
            </p>
            <h2 className="mt-1 font-semibold">{c.title}</h2>
            <p className="mt-1 text-sm text-zinc-500">{c.description.slice(0, 140)}</p>
            <Link href={`/courses/${c.slug}`} className="mt-4 inline-block text-sm font-semibold text-emerald-700">
              View course →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

