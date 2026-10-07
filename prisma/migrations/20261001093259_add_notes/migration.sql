-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ActivityAction" ADD VALUE 'NOTE_CREATED';
ALTER TYPE "ActivityAction" ADD VALUE 'NOTE_UPDATED';
ALTER TYPE "ActivityAction" ADD VALUE 'NOTE_DELETED';

-- CreateTable
CREATE TABLE "note" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "note_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "note_projectId_updatedAt_idx" ON "note"("projectId", "updatedAt");

-- CreateIndex
CREATE INDEX "note_createdById_idx" ON "note"("createdById");

-- AddForeignKey
ALTER TABLE "note" ADD CONSTRAINT "note_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "note" ADD CONSTRAINT "note_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
