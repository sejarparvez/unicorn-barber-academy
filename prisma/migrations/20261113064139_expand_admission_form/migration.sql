-- AlterTable
ALTER TABLE "enrollment" DROP COLUMN "experience",
DROP COLUMN "message",
ADD COLUMN     "admissionNo" TEXT,
ADD COLUMN     "admittedAt" TIMESTAMP(3),
ADD COLUMN     "barberingExperienceDuration" TEXT,
ADD COLUMN     "dateOfBirth" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "education" TEXT NOT NULL,
ADD COLUMN     "emergencyAddress" TEXT,
ADD COLUMN     "emergencyMobile" TEXT NOT NULL,
ADD COLUMN     "emergencyName" TEXT NOT NULL,
ADD COLUMN     "emergencyRelation" TEXT NOT NULL,
ADD COLUMN     "fatherName" TEXT NOT NULL,
ADD COLUMN     "fullName" TEXT NOT NULL,
ADD COLUMN     "gender" TEXT NOT NULL,
ADD COLUMN     "goal" TEXT NOT NULL,
ADD COLUMN     "hasBarberingExperience" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasPreviousTraining" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "motherName" TEXT NOT NULL,
ADD COLUMN     "nationality" TEXT NOT NULL,
ADD COLUMN     "nidNumber" TEXT NOT NULL,
ADD COLUMN     "permanentAddress" TEXT NOT NULL,
ADD COLUMN     "presentAddress" TEXT NOT NULL,
ADD COLUMN     "previousTrainingInstitution" TEXT,
ADD COLUMN     "whatsapp" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "enrollment_admissionNo_key" ON "enrollment"("admissionNo");

