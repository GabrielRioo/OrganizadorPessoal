-- CreateEnum
CREATE TYPE "BuyStatus" AS ENUM ('WANT', 'RESEARCHING', 'WAITING_DEAL', 'BOUGHT', 'DROPPED');

-- CreateEnum
CREATE TYPE "BuyPriority" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "BuyCurrency" AS ENUM ('BRL', 'USD', 'EUR');

-- CreateTable
CREATE TABLE "BuyItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "currentPrice" DECIMAL(12,2),
    "targetPrice" DECIMAL(12,2),
    "currency" "BuyCurrency" NOT NULL DEFAULT 'BRL',
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "priority" "BuyPriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "BuyStatus" NOT NULL DEFAULT 'WANT',
    "links" JSONB NOT NULL DEFAULT '[]',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BuyItem_pkey" PRIMARY KEY ("id")
);
