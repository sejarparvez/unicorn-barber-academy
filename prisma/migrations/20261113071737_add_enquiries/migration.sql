-- CreateEnum
CREATE TYPE "EnquiryStatus" AS ENUM ('new', 'in_progress', 'resolved', 'spam');

-- CreateTable
CREATE TABLE "enquiry" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "interest" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "EnquiryStatus" NOT NULL DEFAULT 'new',
    "note" TEXT,
    "handledById" TEXT,
    "handledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "enquiry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "enquiry_status_idx" ON "enquiry"("status");

-- CreateIndex
CREATE INDEX "enquiry_createdAt_idx" ON "enquiry"("createdAt");

-- AddForeignKey
ALTER TABLE "enquiry" ADD CONSTRAINT "enquiry_handledById_fkey" FOREIGN KEY ("handledById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

