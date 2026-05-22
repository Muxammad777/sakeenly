/**
 * One-off CLI to grant admin role to an existing user.
 *
 * Usage:
 *   npx tsx scripts/promote-admin.ts you@example.com
 *
 * Requires DATABASE_URL in the environment. The user must already exist
 * (created by their first sign-in). Idempotent — running twice is fine.
 */

import { PrismaClient } from "@prisma/client";

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("usage: tsx scripts/promote-admin.ts <email>");
    process.exit(1);
  }

  const db = new PrismaClient();
  try {
    const user = await db.user.findUnique({ where: { email }, select: { id: true, role: true } });
    if (!user) {
      console.error(`user not found: ${email}`);
      console.error("they must sign in at least once before being promoted.");
      process.exit(2);
    }
    if (user.role === "admin") {
      console.log(`${email} is already admin (id=${user.id}). nothing to do.`);
      return;
    }
    await db.user.update({ where: { id: user.id }, data: { role: "admin" } });
    console.log(`promoted ${email} -> admin (id=${user.id})`);
  } finally {
    await db.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(99);
});
