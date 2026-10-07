import type { TaskStatus } from "@prisma/client";
import { db } from "@/lib/db";

export async function getDashboardData(userId: string) {
  const projectWhere = {
    OR: [{ createdById: userId }, { assignedToId: userId }],
  };
  const taskInclude = {
    assignedTo: { select: { id: true, name: true, image: true } },
    createdBy: { select: { id: true, name: true, image: true } },
    project: { select: { name: true } },
  } as const;

  const [
    statusCounts,
    recentProjects,
    recentActivities,
    myTasks,
    projectTaskCounts,
  ] = await Promise.all([
    db.project.groupBy({
      by: ["status"],
      where: projectWhere,
      _count: { _all: true },
    }),
    db.project.findMany({
      where: projectWhere,
      include: {
        assignedTo: { select: { id: true, name: true, image: true } },
        createdBy: { select: { id: true, name: true, image: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
    db.activity.findMany({
      where: { project: projectWhere },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.task.findMany({
      where: {
        OR: [{ createdById: userId }, { assignedToId: userId }],
        status: { not: "DONE" as TaskStatus },
      },
      include: taskInclude,
      orderBy: [{ dueDate: "asc" }, { updatedAt: "desc" }],
    }),
    db.task.groupBy({
      by: ["projectId", "status"],
      where: { project: projectWhere },
      _count: { _all: true },
    }),
  ]);

  return {
    statusCounts: Object.fromEntries(
      statusCounts.map(({ status, _count }) => [status, _count._all]),
    ),
    recentProjects,
    recentActivities,
    myTasks,
    projectTaskCounts,
  };
}
