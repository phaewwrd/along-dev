import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

const activityInclude = {
  user: { select: { id: true, name: true, image: true } },
} satisfies Prisma.ActivityInclude;

export function findProjectForUser(projectId: string, userId: string) {
  return db.project.findFirst({
    where: {
      id: projectId,
      OR: [{ createdById: userId }, { assignedToId: userId }],
    },
    select: { id: true },
  });
}

export function listProjectActivities(projectId: string) {
  return db.activity.findMany({
    where: { projectId },
    include: activityInclude,
    orderBy: { createdAt: "desc" },
  });
}
