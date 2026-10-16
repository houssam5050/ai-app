import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { cardClasses, buttonClasses } from "@/components/ui/primitives";

export const dynamic = "force-dynamic";

async function enroll(courseId: string) {
  "use server";
  const { requireUser } = await import("@/lib/auth/session");
  const { user } = await requireUser();
  await db.enrollment.upsert({
    where: { userId_courseId: { userId: user.id, courseId } },
    update: {},
    create: { userId: user.id, courseId },
  });
  redirect(`/courses/enrolled`);
}

export default async function CourseDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = await db.course.findUnique({
    where: { slug },
    include: { category: true, chapters: { include: { lessons: true }, orderBy: { position: "asc" } } },
  });
  if (!course || course.status !== "PUBLISHED") notFound();

  const session = await getSession().catch(() => null);
  const enrolled = session?.user
    ? await db.enrollment.findUnique({
        where: { userId_courseId: { userId: session.user.id, courseId: course.id } },
      })
    : null;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
          {course.category?.name} · {course.difficulty}
        </p>
        <h1 className="mt-1 text-3xl font-bold">{course.title}</h1>
        <p className="mt-2 text-zinc-600">{course.description}</p>
      </div>

      {!enrolled ? (
        <form action={enroll.bind(null, course.id)}>
          <button className={buttonClasses("primary")} type="submit">Enroll now</button>
        </form>
      ) : (
        <p className="text-sm font-semibold text-emerald-700">You&apos;re enrolled ✓</p>
      )}

      <div className="flex flex-col gap-4">
        {course.chapters.map((ch) => (
          <div key={ch.id} className={cardClasses()}>
            <h2 className="font-semibold">{ch.title}</h2>
            <ul className="mt-3 flex flex-col gap-2">
              {ch.lessons.map((l) => (
                <li key={l.id} className="flex items-center justify-between text-sm">
                  <span>{l.title} · {l.type}</span>
                  {enrolled ? (
                    <Link href={`/learn/${l.id}`} className="font-semibold text-emerald-700">Open →</Link>
                  ) : (
                    <span className="text-zinc-400">Enroll to open</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
