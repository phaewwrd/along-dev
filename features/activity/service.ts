import {
  findProjectForUser,
  listProjectActivities,
} from "@/features/activity/repository";
import type { ActivityLogDTO } from "@/features/activity/types";

function toActivityDTO(
  activity: Awaited<ReturnType<typeof listProjectActivities>>[number],
): ActivityLogDTO {
  const metadata =
    activity.metadata &&
    typeof activity.metadata === "object" &&
    !Array.isArray(activity.metadata)
      ? (activity.metadata as Record<string, unknown>)
      : null;

  return {
    id: activity.id,
    projectId: activity.projectId,
    taskId: activity.taskId,
    user: activity.user,
    action: activity.action,
    description: activity.description,
    metadata,
    createdAt: activity.createdAt.toISOString(),
  };
}

export async function listProjectActivitiesForUser(
  userId: string,
  projectId: string,
): Promise<ActivityLogDTO[] | null> {
  const project = await findProjectForUser(projectId, userId);

  if (!project) return null;

  const activities = await listProjectActivities(projectId);
  return activities.map(toActivityDTO);
}
