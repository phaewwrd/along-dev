import type { ActivityLogDTO } from "@/features/activity/types";
import { getDashboardData } from "@/features/dashboard/repository";
import type { DashboardDTO } from "@/features/dashboard/types";
import type { TaskDTO } from "@/features/task/types";

export async function getDashboardForUser(
  userId: string,
): Promise<DashboardDTO> {
  const data = await getDashboardData(userId);
  const mapUser = (user: { id: string; name: string; image: string | null }) =>
    user;

  const toProject = (project: (typeof data.recentProjects)[number]) => {
    const counts = data.projectTaskCounts.filter(
      (count) => count.projectId === project.id,
    );
    const total = counts.reduce((sum, count) => sum + count._count._all, 0);
    const completed =
      counts.find((count) => count.status === "DONE")?._count._all ?? 0;

    return {
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status,
      assignedTo: project.assignedTo,
      createdBy: project.createdBy,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
      completedAt: project.completedAt?.toISOString() ?? null,
      taskProgress: {
        completed,
        total,
        percentage: total === 0 ? 0 : Math.round((completed / total) * 100),
      },
    };
  };

  const toActivity = (
    activity: (typeof data.recentActivities)[number],
  ): ActivityLogDTO => ({
    id: activity.id,
    projectId: activity.projectId,
    taskId: activity.taskId,
    user: mapUser(activity.user),
    action: activity.action,
    description: activity.description,
    metadata:
      activity.metadata &&
      typeof activity.metadata === "object" &&
      !Array.isArray(activity.metadata)
        ? (activity.metadata as Record<string, unknown>)
        : null,
    createdAt: activity.createdAt.toISOString(),
  });

  const toTask = (
    task: (typeof data.myTasks)[number],
  ): TaskDTO & {
    projectName: string;
  } => ({
    id: task.id,
    projectId: task.projectId,
    projectName: task.project.name,
    title: task.title,
    description: task.description,
    status: task.status,
    assignedTo: task.assignedTo,
    createdBy: task.createdBy,
    dueDate: task.dueDate?.toISOString() ?? null,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
    completedAt: task.completedAt?.toISOString() ?? null,
  });

  return {
    stats: {
      totalProjects: Object.values(data.statusCounts).reduce(
        (total, count) => total + Number(count),
        0,
      ),
      planning: data.statusCounts.PLANNING ?? 0,
      inProgress: data.statusCounts.IN_PROGRESS ?? 0,
      onHold: data.statusCounts.ON_HOLD ?? 0,
      completed: data.statusCounts.COMPLETED ?? 0,
      cancelled: data.statusCounts.CANCELLED ?? 0,
    },
    recentProjects: data.recentProjects.map(toProject),
    recentActivities: data.recentActivities.map(toActivity),
    myTasks: data.myTasks.map(toTask),
  };
}
