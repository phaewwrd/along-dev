-- Replace the legacy task-style project statuses with project-specific values.
ALTER TABLE "project" ALTER COLUMN "status" DROP DEFAULT;
UPDATE "project"
SET "completedAt" = COALESCE("completedAt", "updatedAt")
WHERE "status"::text = 'DONE' AND "completedAt" IS NULL;
ALTER TYPE "ProjectStatus" RENAME TO "ProjectStatus_legacy";
CREATE TYPE "ProjectStatus" AS ENUM (
  'PLANNING',
  'IN_PROGRESS',
  'ON_HOLD',
  'COMPLETED',
  'CANCELLED'
);

ALTER TABLE "project"
  ALTER COLUMN "status" TYPE "ProjectStatus"
  USING (
    CASE "status"::text
      WHEN 'TODO' THEN 'PLANNING'
      WHEN 'IN_PROGRESS' THEN 'IN_PROGRESS'
      WHEN 'BLOCKED' THEN 'ON_HOLD'
      WHEN 'DONE' THEN 'COMPLETED'
      WHEN 'WAITING_FOR_REVIEW' THEN 'IN_PROGRESS'
      WHEN 'WAITING_FOR_DEPLOY' THEN 'IN_PROGRESS'
      WHEN 'WAITING_FOR_TESTING' THEN 'IN_PROGRESS'
    END
  )::"ProjectStatus";

ALTER TABLE "project" ALTER COLUMN "status" SET DEFAULT 'PLANNING';
DROP TYPE "ProjectStatus_legacy";
