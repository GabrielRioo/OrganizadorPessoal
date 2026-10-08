import { prisma } from "../lib/prisma.js";

export async function isAccessGateEnabled(): Promise<boolean> {
  const count = await prisma.accessPassword.count({
    where: { revokedAt: null },
  });
  return count > 0;
}
