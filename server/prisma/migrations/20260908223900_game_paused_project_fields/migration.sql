-- AlterEnum
ALTER TYPE "GameStatus" ADD VALUE 'PAUSED';

-- AlterTable
ALTER TABLE "Project" ADD COLUMN "deadline" DATE,
ADD COLUMN "published" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "monetize" BOOLEAN NOT NULL DEFAULT false;
