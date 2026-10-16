export const dynamic = "force-dynamic";

import { db } from "@/lib/db/prisma";
import { cardClasses } from "@/components/ui/primitives";
export default async function LeaderboardPage() {
  let rows: { userId: string; _sum: { amount: number | null } }[] = [];
  let names = new Map<string, string>();
  let unavailable = false;
  try {
    const grouped = await db.xPTransaction.groupBy({
      by: ["userId"],
      _sum: { amount: true },
      orderBy: { _sum: { amount: "desc" } },
      take: 25,
    });
    rows = grouped;
    const users = await db.user.findMany({
      where: { id: { in: grouped.map((r) => r.userId) } },
      select: { id: true, name: true },
    });
    names = new Map(users.map((u) => [u.id, u.name]));
  } catch {
    unavailable = true;
  }
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-6 py-10">
      <h1 className="text-3xl font-bold">Leaderboard</h1>
      <div className={cardClasses()}>
        <ol className="flex flex-col gap-2 text-sm">
          {rows.map((r, i) => (
            <li key={r.userId} className="flex justify-between">
              <span>#{i + 1} {names.get(r.userId) ?? "Learner"}</span>
              <span className="font-bold">{r._sum.amount ?? 0} XP</span>
            </li>
          ))}
          {unavailable && <li className="text-amber-700">Leaderboard unavailable — database not reachable.</li>}
          {!unavailable && rows.length === 0 && <li className="text-zinc-500">No XP awarded yet.</li>}
        </ol>
      </div>
    </div>
  );
}

