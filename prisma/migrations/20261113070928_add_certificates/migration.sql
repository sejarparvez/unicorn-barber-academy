-- CreateTable
CREATE TABLE "certificate" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "certificateNo" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "issuedById" TEXT,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "certificate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "certificate_enrollmentId_key" ON "certificate"("enrollmentId");

-- CreateIndex
CREATE UNIQUE INDEX "certificate_certificateNo_key" ON "certificate"("certificateNo");

-- CreateIndex
CREATE INDEX "certificate_issuedAt_idx" ON "certificate"("issuedAt");

-- AddForeignKey
ALTER TABLE "certificate" ADD CONSTRAINT "certificate_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "enrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificate" ADD CONSTRAINT "certificate_issuedById_fkey" FOREIGN KEY ("issuedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

