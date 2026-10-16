export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/session";
import { cardClasses } from "@/components/ui/primitives";
export default async function EnrolledPage() {
  let userId: string;
  try {
    userId = (await requireUser()).user.id;
  } catch {
    redirect("/signin");
  }
  const enrollments = await db.enrollment.findMany({
    where: { userId },
    include: { course: true },
    orderBy: { enrolledAt: "desc" },
  });
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-6 py-10">
      <h1 className="text-3xl font-bold">My learning</h1>
      {enrollments.length === 0 && (
        <div className={cardClasses()}>
          <p className="text-sm text-zinc-500">No enrollments yet. Browse the catalog to start.</p>
        </div>
      )}
      {enrollments.map((e) => (
        <div key={e.courseId} className={cardClasses()}>
          <h2 className="font-semibold">{e.course.title}</h2>
          <Link href={`/courses/${e.course.slug}`} className="text-sm font-semibold text-emerald-700">
            Continue →
          </Link>
        </div>
      ))}
    </div>
  );
}

