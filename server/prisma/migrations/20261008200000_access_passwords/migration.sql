-- CreateTable
CREATE TABLE "AccessPassword" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "AccessPassword_pkey" PRIMARY KEY ("id")
);
