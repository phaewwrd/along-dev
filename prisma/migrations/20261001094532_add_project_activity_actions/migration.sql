-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ActivityAction" ADD VALUE 'PROJECT_CREATED';
ALTER TYPE "ActivityAction" ADD VALUE 'PROJECT_UPDATED';
ALTER TYPE "ActivityAction" ADD VALUE 'PROJECT_ASSIGNED';
ALTER TYPE "ActivityAction" ADD VALUE 'PROJECT_UNASSIGNED';
ALTER TYPE "ActivityAction" ADD VALUE 'PROJECT_STATUS_CHANGED';
ALTER TYPE "ActivityAction" ADD VALUE 'PROJECT_DELETED';
