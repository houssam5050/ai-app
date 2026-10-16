import "server-only";
import { db } from "@/lib/db/prisma";

export async function auditLog(input: {
  actorId: string;
  action: string;
  target?: string;
  metadata?: Record<string, unknown>;
}) {
  await db.auditLog.create({
    data: {
      actorId: input.actorId,
      action: input.action,
      target: input.target ?? "",
      metadataJson: JSON.stringify(input.metadata ?? {}),
    },
  });
}
