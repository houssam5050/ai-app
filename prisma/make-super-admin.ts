import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const email = process.argv[2];
if (!email) {
  console.error("Usage: npx tsx prisma/make-super-admin.ts <email>");
  process.exit(1);
}

const db = new PrismaClient({
  adapter: new PrismaPg({
    connectionString:
      process.env.DATABASE_URL ??
      "postgresql://postgres:postgres@localhost:5432/edtech?schema=public",
  }),
});
async function main() {
  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    console.error(`No user found for ${email}. Register first, then rerun.`);
    process.exit(1);
  }
  await db.user.update({ where: { email }, data: { role: "SUPER_ADMIN" } });
  await db.auditLog.create({
    data: { actorId: user.id, action: "role.grant", target: user.id, metadataJson: JSON.stringify({ role: "SUPER_ADMIN" }) },
  });
  console.log(`Promoted ${email} to SUPER_ADMIN`);
}
main().finally(() => db.$disconnect());
