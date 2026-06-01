-- CreateEnum
CREATE TYPE "HifzStage" AS ENUM ('new', 'sabaq', 'sabqi', 'manzil', 'mastered');

-- CreateEnum
CREATE TYPE "HifzGrade" AS ENUM ('forgot', 'hard', 'good', 'easy');

-- CreateTable
CREATE TABLE "HifzProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ayahKey" TEXT NOT NULL,
    "surah" INTEGER NOT NULL,
    "ayah" INTEGER NOT NULL,
    "stage" "HifzStage" NOT NULL DEFAULT 'new',
    "srsInterval" INTEGER NOT NULL DEFAULT 0,
    "srsEase" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "srsLapses" INTEGER NOT NULL DEFAULT 0,
    "srsReps" INTEGER NOT NULL DEFAULT 0,
    "firstLearnedAt" TIMESTAMP(3),
    "lastReviewedAt" TIMESTAMP(3),
    "dueAt" TIMESTAMP(3),
    "consecutiveOk" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HifzProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HifzSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "newCount" INTEGER NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "forgotCount" INTEGER NOT NULL DEFAULT 0,
    "juzz" INTEGER,
    "page" INTEGER,
    "surah" INTEGER,

    CONSTRAINT "HifzSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HifzSettings" (
    "userId" TEXT NOT NULL,
    "dailyTargetDenom" INTEGER NOT NULL DEFAULT 2,
    "hifzReciter" TEXT NOT NULL DEFAULT 'husary',
    "loopCount" INTEGER NOT NULL DEFAULT 7,
    "speedX100" INTEGER NOT NULL DEFAULT 85,
    "startFromSurah" INTEGER NOT NULL DEFAULT 78,
    "startFromAyah" INTEGER NOT NULL DEFAULT 1,
    "showTajweed" BOOLEAN NOT NULL DEFAULT true,
    "showTranslation" BOOLEAN NOT NULL DEFAULT true,
    "showTransliteration" BOOLEAN NOT NULL DEFAULT false,
    "defaultHideStage" INTEGER NOT NULL DEFAULT 0,
    "hifzStreakCurrent" INTEGER NOT NULL DEFAULT 0,
    "hifzStreakLongest" INTEGER NOT NULL DEFAULT 0,
    "lastHifzDate" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HifzSettings_pkey" PRIMARY KEY ("userId")
);

-- CreateIndex
CREATE INDEX "HifzProgress_userId_dueAt_idx" ON "HifzProgress"("userId", "dueAt");

-- CreateIndex
CREATE INDEX "HifzProgress_userId_stage_idx" ON "HifzProgress"("userId", "stage");

-- CreateIndex
CREATE INDEX "HifzProgress_userId_surah_ayah_idx" ON "HifzProgress"("userId", "surah", "ayah");

-- CreateIndex
CREATE UNIQUE INDEX "HifzProgress_userId_ayahKey_key" ON "HifzProgress"("userId", "ayahKey");

-- CreateIndex
CREATE INDEX "HifzSession_userId_startedAt_idx" ON "HifzSession"("userId", "startedAt");

-- AddForeignKey
ALTER TABLE "HifzProgress" ADD CONSTRAINT "HifzProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HifzSession" ADD CONSTRAINT "HifzSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HifzSettings" ADD CONSTRAINT "HifzSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
