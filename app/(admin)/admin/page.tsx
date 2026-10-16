export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { db } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/session";
import { hasRole } from "@/server/permissions/rbac";
import { auditLog } from "@/server/services/audit-service";
import { cardClasses, buttonClasses } from "@/components/ui/primitives";
async function setRole(formData: FormData) {
  "use server";
  const { user } = await requireUser();
  if (!hasRole(user.role, "ADMIN")) throw new Error("FORBIDDEN");
  const targetId = String(formData.get("userId"));
  const role = String(formData.get("role")) as "STUDENT" | "INSTRUCTOR" | "ADMIN" | "SUPER_ADMIN";
  if (role === "SUPER_ADMIN" && user.role !== "SUPER_ADMIN") throw new Error("FORBIDDEN");
  await db.user.update({ where: { id: targetId }, data: { role } });
  await auditLog({ actorId: user.id, action: "role.update", target: targetId, metadata: { role } });
  redirect("/admin");
}

export default async function AdminPage() {
  let me;
  try {
    me = (await requireUser()).user;
  } catch {
    redirect("/signin");
  }
  if (!hasRole(me.role, "ADMIN")) redirect("/dashboard");

  const [users, courses, analytics] = await Promise.all([
    db.user.findMany({ orderBy: { createdAt: "desc" }, take: 20 }),
    db.course.findMany({ orderBy: { updatedAt: "desc" }, take: 20 }),
    Promise.all([
      db.user.count(),
      db.enrollment.count(),
      db.xPTransaction.aggregate({ _sum: { amount: true } }),
    ]),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10">
      <h1 className="text-3xl font-bold">Admin</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <div className={cardClasses()}><p className="text-2xl font-bold">{analytics[0]}</p><p className="text-sm text-zinc-500">Users</p></div>
        <div className={cardClasses()}><p className="text-2xl font-bold">{analytics[1]}</p><p className="text-sm text-zinc-500">Enrollments</p></div>
        <div className={cardClasses()}><p className="text-2xl font-bold">{analytics[2]._sum.amount ?? 0}</p><p className="text-sm text-zinc-500">Total XP</p></div>
      </div>

      <div className={cardClasses()}>
        <h2 className="font-semibold">Users (latest 20)</h2>
        <ul className="mt-3 flex flex-col gap-2">
          {users.map((u) => (
            <li key={u.id} className="flex flex-wrap items-center gap-2 text-sm">
              <span className="font-semibold">{u.name}</span>
              <span className="text-zinc-500">{u.email} · {u.role} · {u.status}</span>
              <form action={setRole} className="flex gap-2">
                <input type="hidden" name="userId" value={u.id} />
                <select name="role" defaultValue={u.role} className="rounded-full border px-2 py-1 text-xs">
                  <option value="STUDENT">STUDENT</option>
                  <option value="INSTRUCTOR">INSTRUCTOR</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                </select>
                <button className={buttonClasses("secondary")} type="submit">Save</button>
              </form>
            </li>
          ))}
        </ul>
      </div>

      <div className={cardClasses()}>
        <h2 className="font-semibold">Courses (latest 20)</h2>
        <ul className="mt-3 flex flex-col gap-2 text-sm">
          {courses.map((c) => (
            <li key={c.id}>{c.title} · {c.status} · {c.difficulty}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

