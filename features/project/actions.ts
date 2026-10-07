"use server";

import { revalidatePath } from "next/cache";
import {
  createProjectSchema,
  deleteProjectSchema,
  updateProjectSchema,
} from "@/features/project/schemas";
import {
  createProjectForUser,
  deleteProjectForUser,
  getProjectForUser,
  listProjectsForUser,
  listWorkspaceUsersForUser,
  updateProjectForUser,
} from "@/features/project/service";
import type { ProjectDTO } from "@/features/project/types";
import { getCurrentUser } from "@/lib/current-user";
import type { ActionResponse } from "@/types/action-response";

export async function createProjectAction(
  formData: FormData,
): Promise<ActionResponse<ProjectDTO>> {
  const user = await getCurrentUser();

  if (!user) {
    return {
      success: false,
      error: { code: "UNAUTHENTICATED", message: "You must be signed in." },
    };
  }

  const parsed = createProjectSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    assignedToId: formData.get("assignedToId") || undefined,
    status: formData.get("status") || undefined,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: parsed.error.issues[0]?.message ?? "Invalid project data.",
      },
    };
  }

  try {
    const project = await createProjectForUser(user.id, parsed.data);
    revalidatePath("/");
    return {
      success: true,
      data: project,
    };
  } catch (error) {
    console.error("Project creation failed.", error);
    return {
      success: false,
      error: {
        code: "PROJECT_CREATE_FAILED",
        message:
          "Unable to create project. Check database availability and apply pending schema migrations.",
      },
    };
  }
}

export async function updateProjectAction(
  formData: FormData,
): Promise<ActionResponse<ProjectDTO>> {
  const user = await getCurrentUser();
  if (!user) {
    return {
      success: false,
      error: { code: "UNAUTHENTICATED", message: "You must be signed in." },
    };
  }

  const parsed = updateProjectSchema.safeParse({
    projectId: formData.get("projectId"),
    name: formData.has("name") ? formData.get("name") : undefined,
    description: formData.has("description")
      ? formData.get("description") || null
      : undefined,
    assignedToId: formData.has("assignedToId")
      ? formData.get("assignedToId") || null
      : undefined,
    status: formData.get("status") || undefined,
  });
  if (!parsed.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: parsed.error.issues[0]?.message ?? "Invalid project data.",
      },
    };
  }

  try {
    const project = await updateProjectForUser(user.id, parsed.data);
    if (!project) {
      return {
        success: false,
        error: { code: "PROJECT_NOT_FOUND", message: "Project not found." },
      };
    }
    revalidatePath("/");
    return { success: true, data: project };
  } catch {
    return {
      success: false,
      error: {
        code: "PROJECT_UPDATE_FAILED",
        message: "Unable to update project. Check that the assignee exists.",
      },
    };
  }
}

export async function deleteProjectAction(
  formData: FormData,
): Promise<ActionResponse<{ deleted: true }>> {
  const user = await getCurrentUser();
  if (!user) {
    return {
      success: false,
      error: { code: "UNAUTHENTICATED", message: "You must be signed in." },
    };
  }
  const parsed = deleteProjectSchema.safeParse({
    projectId: formData.get("projectId"),
  });
  if (!parsed.success) {
    return {
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Invalid project id." },
    };
  }
  try {
    const deleted = await deleteProjectForUser(user.id, parsed.data.projectId);
    if (!deleted) {
      return {
        success: false,
        error: { code: "PROJECT_NOT_FOUND", message: "Project not found." },
      };
    }
    revalidatePath("/");
    return { success: true, data: { deleted: true } };
  } catch {
    return {
      success: false,
      error: {
        code: "PROJECT_DELETE_FAILED",
        message: "Unable to delete project.",
      },
    };
  }
}

export async function getProjectAction(
  projectId: string,
): Promise<ActionResponse<ProjectDTO>> {
  const user = await getCurrentUser();
  if (!user) {
    return {
      success: false,
      error: { code: "UNAUTHENTICATED", message: "You must be signed in." },
    };
  }
  try {
    const project = await getProjectForUser(user.id, projectId);
    return project
      ? { success: true, data: project }
      : {
          success: false,
          error: { code: "PROJECT_NOT_FOUND", message: "Project not found." },
        };
  } catch {
    return {
      success: false,
      error: {
        code: "PROJECT_READ_FAILED",
        message: "Unable to load project.",
      },
    };
  }
}

export async function listWorkspaceUsersAction(): Promise<
  ActionResponse<Awaited<ReturnType<typeof listWorkspaceUsersForUser>>>
> {
  const user = await getCurrentUser();
  if (!user) {
    return {
      success: false,
      error: { code: "UNAUTHENTICATED", message: "You must be signed in." },
    };
  }
  try {
    return { success: true, data: await listWorkspaceUsersForUser() };
  } catch {
    return {
      success: false,
      error: { code: "USER_LIST_FAILED", message: "Unable to load members." },
    };
  }
}

export async function listProjectsAction(): Promise<
  ActionResponse<ProjectDTO[]>
> {
  const user = await getCurrentUser();

  if (!user) {
    return {
      success: false,
      error: { code: "UNAUTHENTICATED", message: "You must be signed in." },
    };
  }

  try {
    return { success: true, data: await listProjectsForUser(user.id) };
  } catch {
    return {
      success: false,
      error: {
        code: "PROJECT_LIST_FAILED",
        message: "Unable to load projects.",
      },
    };
  }
}
