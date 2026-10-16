export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { getDashboardSummary } from "@/server/services/dashboard-service";
import { cardClasses } from "@/components/ui/primitives";
import { Flame, Trophy, BookOpen, Target, Bell } from "lucide-react";
export default async function DashboardPage() {
  let summary;
  try {
    const { user } = await requireUser();
    summary = await getDashboardSummary(user.id);
  } catch {
    redirect("/signin");
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10">
      <header>
        <h1 className="text-3xl font-bold">Welcome back, {summary.profile.name || "Learner"}</h1>
        <p className="text-zinc-500">
          Level {summary.xp.level} · {summary.xp.total} XP · {summary.xp.xpIntoLevel}/{summary.xp.xpForNext} to next level
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-4">
        <div className={cardClasses()}>
          <Flame className="text-orange-500" size={20} />
          <p className="mt-2 text-2xl font-bold">{summary.streak.current} days</p>
          <p className="text-sm text-zinc-500">Current streak (best {summary.streak.longest})</p>
        </div>
        <div className={cardClasses()}>
          <BookOpen className="text-emerald-600" size={20} />
          <p className="mt-2 text-2xl font-bold">{summary.counts.enrolled}</p>
          <p className="text-sm text-zinc-500">Enrolled · {summary.counts.completedCourses} completed</p>
        </div>
        <div className={cardClasses()}>
          <Target className="text-blue-600" size={20} />
          <p className="mt-2 text-2xl font-bold">
            {summary.goal.todayMinutes}/{summary.goal.dailyMinutes} min
          </p>
          <p className="text-sm text-zinc-500">Today&apos;s goal · {summary.counts.minutes} total min</p>
        </div>
        <div className={cardClasses()}>
          <Trophy className="text-amber-500" size={20} />
          <p className="mt-2 text-2xl font-bold">{summary.achievements.length}</p>
          <p className="text-sm text-zinc-500">Recent achievements</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className={cardClasses()}>
          <h2 className="font-semibold">Weekly activity</h2>
          {summary.weeklyActivity.length === 0 && (
            <p className="mt-2 text-sm text-zinc-500">No activity yet — complete a lesson to start your streak.</p>
          )}
          <ul className="mt-3 flex flex-col gap-2">
            {summary.weeklyActivity.map((d) => (
              <li key={d.date} className="flex justify-between text-sm">
                <span>{d.date}</span>
                <span className="font-semibold">{d.minutes} min</span>
              </li>
            ))}
          </ul>
        </div>
        <div className={cardClasses()}>
          <h2 className="flex items-center gap-2 font-semibold"><Bell size={16} /> Notifications</h2>
          {summary.notifications.length === 0 && (
            <p className="mt-2 text-sm text-zinc-500">You&apos;re all caught up.</p>
          )}
          <ul className="mt-3 flex flex-col gap-2">
            {summary.notifications.map((n) => (
              <li key={n.id} className="text-sm">
                <span className="font-semibold">{n.title}</span>
                <span className="text-zinc-500"> — {n.body}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className={cardClasses()}>
        <h2 className="font-semibold">Recommended next</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {summary.recommended.map((c) => (
            <div key={c.id} className="rounded-xl border p-4">
              <p className="font-semibold">{c.title}</p>
              <p className="text-sm text-zinc-500">{c.description.slice(0, 120)}</p>
            </div>
          ))}
          {summary.recommended.length === 0 && (
            <p className="text-sm text-zinc-500">Enroll in a course to get tailored picks.</p>
          )}
        </div>
      </div>
    </div>
  );
}

