-- Keep project deletion activity records after the project row is removed.
ALTER TABLE "activity" DROP CONSTRAINT "activity_projectId_fkey";
ALTER TABLE "activity" ALTER COLUMN "projectId" DROP NOT NULL;
ALTER TABLE "activity"
  ADD CONSTRAINT "activity_projectId_fkey"
  FOREIGN KEY ("projectId") REFERENCES "project"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
