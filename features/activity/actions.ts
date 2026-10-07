"use server";

import { listProjectActivitiesForUser } from "@/features/activity/service";
import type { ActivityLogDTO } from "@/features/activity/types";
import { getCurrentUser } from "@/lib/current-user";
import type { ActionResponse } from "@/types/action-response";

export async function listProjectActivitiesAction(
  projectId: string,
): Promise<ActionResponse<ActivityLogDTO[]>> {
  const user = await getCurrentUser();

  if (!user) {
    return {
      success: false,
      error: { code: "UNAUTHENTICATED", message: "You must be signed in." },
    };
  }

  const activities = await listProjectActivitiesForUser(user.id, projectId);

  return activities
    ? { success: true, data: activities }
    : {
        success: false,
        error: { code: "PROJECT_NOT_FOUND", message: "Project not found." },
      };
}
