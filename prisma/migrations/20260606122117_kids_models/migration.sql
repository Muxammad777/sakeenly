-- CreateEnum
CREATE TYPE "KidProgressType" AS ENUM ('letter', 'surah', 'story');

-- CreateEnum
CREATE TYPE "KidProgressStatus" AS ENUM ('in_progress', 'learned');

-- CreateTable
CREATE TABLE "KidProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "ageBand" TEXT NOT NULL DEFAULT '4-6',
    "avatarSlug" TEXT NOT NULL DEFAULT 'star',
    "streakCurrent" INTEGER NOT NULL DEFAULT 0,
    "streakLongest" INTEGER NOT NULL DEFAULT 0,
    "lastActiveDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KidProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KidProgress" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "type" "KidProgressType" NOT NULL,
    "key" TEXT NOT NULL,
    "status" "KidProgressStatus" NOT NULL DEFAULT 'in_progress',
    "traceScore" INTEGER NOT NULL DEFAULT 0,
    "reciteScore" INTEGER NOT NULL DEFAULT 0,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "masteredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KidProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KidBadge" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "awardedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KidBadge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "KidProfile_userId_idx" ON "KidProfile"("userId");

-- CreateIndex
CREATE INDEX "KidProgress_profileId_type_idx" ON "KidProgress"("profileId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "KidProgress_profileId_type_key_key" ON "KidProgress"("profileId", "type", "key");

-- CreateIndex
CREATE INDEX "KidBadge_profileId_idx" ON "KidBadge"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "KidBadge_profileId_slug_key" ON "KidBadge"("profileId", "slug");

-- AddForeignKey
ALTER TABLE "KidProfile" ADD CONSTRAINT "KidProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KidProgress" ADD CONSTRAINT "KidProgress_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "KidProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KidBadge" ADD CONSTRAINT "KidBadge_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "KidProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
