import "server-only";
import { randomBytes } from "node:crypto";
import { db } from "@/lib/db/prisma";

export async function issueCertificate(userId: string, courseId: string) {
  const progress = await db.courseProgress.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });
  if (!progress || progress.percent < 100) throw new Error("NOT_ELIGIBLE");

  const existing = await db.certificate.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });
  if (existing) return existing;

  return db.certificate.create({
    data: {
      userId,
      courseId,
      verificationId: randomBytes(8).toString("hex"),
      status: "ISSUED",
    },
  });
}

export async function verifyCertificate(verificationId: string) {
  const cert = await db.certificate.findUnique({
    where: { verificationId },
    include: { user: { select: { name: true } }, course: { select: { title: true } } },
  });
  if (!cert || cert.status !== "ISSUED") return null;
  return {
    holderName: cert.user.name,
    courseTitle: cert.course.title,
    issuedAt: cert.issuedAt,
  };
}
