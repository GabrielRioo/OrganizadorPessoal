import { prisma } from "../lib/prisma.js";

export async function ensureOwnerUser() {
  const existing = await prisma.user.findFirst({
    where: { role: "OWNER" },
    orderBy: { createdAt: "asc" },
  });
  if (existing) {
    return existing;
  }
  return prisma.user.create({
    data: { role: "OWNER", label: "Owner" },
  });
}

export async function createGuestUser(label: string) {
  return prisma.user.create({
    data: { role: "GUEST", label },
  });
}
