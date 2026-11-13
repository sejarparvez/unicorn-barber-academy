-- CreateEnum
CREATE TYPE "BatchStatus" AS ENUM ('upcoming', 'running', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "EnrollmentStatus" AS ENUM ('applied', 'waitlisted', 'rejected', 'active', 'completed', 'withdrawn');

-- AlterTable
ALTER TABLE "program" DROP COLUMN "schedule";

-- CreateTable
CREATE TABLE "batch" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "schedule" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "status" "BatchStatus" NOT NULL DEFAULT 'upcoming',
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "batch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enrollment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "status" "EnrollmentStatus" NOT NULL DEFAULT 'applied',
    "phone" TEXT NOT NULL,
    "experience" TEXT,
    "message" TEXT,
    "decidedAt" TIMESTAMP(3),
    "decidedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "enrollment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "batch_programId_status_idx" ON "batch"("programId", "status");

-- CreateIndex
CREATE INDEX "enrollment_batchId_status_idx" ON "enrollment"("batchId", "status");

-- CreateIndex
CREATE INDEX "enrollment_userId_idx" ON "enrollment"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "enrollment_userId_batchId_key" ON "enrollment"("userId", "batchId");

-- AddForeignKey
ALTER TABLE "batch" ADD CONSTRAINT "batch_programId_fkey" FOREIGN KEY ("programId") REFERENCES "program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollment" ADD CONSTRAINT "enrollment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollment" ADD CONSTRAINT "enrollment_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "batch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

