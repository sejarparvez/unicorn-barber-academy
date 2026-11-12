-- CreateTable
CREATE TABLE "program" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "schedule" TEXT NOT NULL,
    "tagline" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "highlights" TEXT[],
    "outcome" TEXT NOT NULL,
    "whoFor" TEXT[],
    "careerPaths" TEXT[],
    "price" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "program_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "program_module" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "program_module_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "program_slug_key" ON "program"("slug");

-- CreateIndex
CREATE INDEX "program_category_idx" ON "program"("category");

-- CreateIndex
CREATE INDEX "program_position_idx" ON "program"("position");

-- CreateIndex
CREATE INDEX "program_module_programId_idx" ON "program_module"("programId");

-- CreateIndex
CREATE UNIQUE INDEX "program_module_programId_position_key" ON "program_module"("programId", "position");

-- AddForeignKey
ALTER TABLE "program_module" ADD CONSTRAINT "program_module_programId_fkey" FOREIGN KEY ("programId") REFERENCES "program"("id") ON DELETE CASCADE ON UPDATE CASCADE;
