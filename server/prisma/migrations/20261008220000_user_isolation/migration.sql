CREATE TYPE "UserRole" AS ENUM ('OWNER', 'GUEST');

CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "label" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "User_role_idx" ON "User"("role");

INSERT INTO "User" ("id", "role", "label")
VALUES ('owner-legacy', 'OWNER', 'Owner');

INSERT INTO "User" ("id", "role", "label")
SELECT CONCAT('guest-', "id"), 'GUEST', "label"
FROM "AccessPassword";

ALTER TABLE "AccessPassword" ADD COLUMN "userId" TEXT;

UPDATE "AccessPassword" SET "userId" = CONCAT('guest-', "id");

ALTER TABLE "AccessPassword" ALTER COLUMN "userId" SET NOT NULL;
CREATE UNIQUE INDEX "AccessPassword_userId_key" ON "AccessPassword"("userId");
ALTER TABLE "AccessPassword" ADD CONSTRAINT "AccessPassword_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Game" ADD COLUMN "userId" TEXT;
UPDATE "Game" SET "userId" = 'owner-legacy';
ALTER TABLE "Game" ALTER COLUMN "userId" SET NOT NULL;
CREATE INDEX "Game_userId_idx" ON "Game"("userId");
ALTER TABLE "Game" ADD CONSTRAINT "Game_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Media" ADD COLUMN "userId" TEXT;
UPDATE "Media" SET "userId" = 'owner-legacy';
ALTER TABLE "Media" ALTER COLUMN "userId" SET NOT NULL;
CREATE INDEX "Media_userId_idx" ON "Media"("userId");
ALTER TABLE "Media" ADD CONSTRAINT "Media_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Travel" ADD COLUMN "userId" TEXT;
UPDATE "Travel" SET "userId" = 'owner-legacy';
ALTER TABLE "Travel" ALTER COLUMN "userId" SET NOT NULL;
CREATE INDEX "Travel_userId_idx" ON "Travel"("userId");
ALTER TABLE "Travel" ADD CONSTRAINT "Travel_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Project" ADD COLUMN "userId" TEXT;
UPDATE "Project" SET "userId" = 'owner-legacy';
ALTER TABLE "Project" ALTER COLUMN "userId" SET NOT NULL;
CREATE INDEX "Project_userId_idx" ON "Project"("userId");
ALTER TABLE "Project" ADD CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Task" ADD COLUMN "userId" TEXT;
UPDATE "Task" SET "userId" = 'owner-legacy';
ALTER TABLE "Task" ALTER COLUMN "userId" SET NOT NULL;
CREATE INDEX "Task_userId_idx" ON "Task"("userId");
ALTER TABLE "Task" ADD CONSTRAINT "Task_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Countdown" ADD COLUMN "userId" TEXT;
UPDATE "Countdown" SET "userId" = 'owner-legacy';
ALTER TABLE "Countdown" ALTER COLUMN "userId" SET NOT NULL;
CREATE INDEX "Countdown_userId_idx" ON "Countdown"("userId");
ALTER TABLE "Countdown" ADD CONSTRAINT "Countdown_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PomodoroSession" ADD COLUMN "userId" TEXT;
UPDATE "PomodoroSession" SET "userId" = 'owner-legacy';
ALTER TABLE "PomodoroSession" ALTER COLUMN "userId" SET NOT NULL;
CREATE INDEX "PomodoroSession_userId_idx" ON "PomodoroSession"("userId");
ALTER TABLE "PomodoroSession" ADD CONSTRAINT "PomodoroSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "BuyItem" ADD COLUMN "userId" TEXT;
UPDATE "BuyItem" SET "userId" = 'owner-legacy';
ALTER TABLE "BuyItem" ALTER COLUMN "userId" SET NOT NULL;
CREATE INDEX "BuyItem_userId_idx" ON "BuyItem"("userId");
ALTER TABLE "BuyItem" ADD CONSTRAINT "BuyItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
