import "server-only";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db/prisma";

export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

export async function requireUser() {
  const session = await getSession();
  if (!session?.user) throw new Error("UNAUTHORIZED");
  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user || user.status !== "ACTIVE") throw new Error("FORBIDDEN");
  return { session, user };
}
