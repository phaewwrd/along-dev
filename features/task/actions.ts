"use server";

import { revalidatePath } from "next/cache";
import {
  createTaskSchema,
  deleteTaskSchema,
  updateTaskSchema,
} from "@/features/task/schemas";
import {
  createTaskForUser,
  deleteTaskForUser,
  listProjectTasksForUser,
  updateTaskForUser,
} from "@/features/task/service";
import type { TaskDTO } from "@/features/task/types";
import { getCurrentUser } from "@/lib/current-user";
import type { ActionResponse } from "@/types/action-response";

export async function createTaskAction(
  formData: FormData,
): Promise<ActionResponse<TaskDTO>> {
  const user = await getCurrentUser();

  if (!user) {
    return {
      success: false,
      error: { code: "UNAUTHENTICATED", message: "You must be signed in." },
    };
  }

  const parsed = createTaskSchema.safeParse({
    projectId: formData.get("projectId"),
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    assignedToId: formData.get("assignedToId") || undefined,
    dueDate: formData.get("dueDate") || undefined,
    status: formData.get("status") || undefined,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: parsed.error.issues[0]?.message ?? "Invalid task data.",
      },
    };
  }

  let task: TaskDTO | null;
  try {
    task = await createTaskForUser(user.id, parsed.data);
  } catch {
    return {
      success: false,
      error: {
        code: "TASK_CREATE_FAILED",
        message: "Unable to create task. Check that the assignee exists.",
      },
    };
  }

  if (!task) {
    return {
      success: false,
      error: { code: "PROJECT_NOT_FOUND", message: "Project not found." },
    };
  }

  revalidatePath("/");
  return { success: true, data: task };
}

export async function listProjectTasksAction(
  projectId: string,
): Promise<ActionResponse<TaskDTO[]>> {
  const user = await getCurrentUser();

  if (!user) {
    return {
      success: false,
      error: { code: "UNAUTHENTICATED", message: "You must be signed in." },
    };
  }

  let tasks: TaskDTO[] | null;
  try {
    tasks = await listProjectTasksForUser(user.id, projectId);
  } catch {
    return {
      success: false,
      error: { code: "TASK_LIST_FAILED", message: "Unable to load tasks." },
    };
  }

  if (!tasks) {
    return {
      success: false,
      error: { code: "PROJECT_NOT_FOUND", message: "Project not found." },
    };
  }

  return { success: true, data: tasks };
}

export async function updateTaskAction(
  formData: FormData,
): Promise<ActionResponse<TaskDTO>> {
  const user = await getCurrentUser();

  if (!user) {
    return {
      success: false,
      error: { code: "UNAUTHENTICATED", message: "You must be signed in." },
    };
  }

  const parsed = updateTaskSchema.safeParse({
    taskId: formData.get("taskId"),
    title: formData.get("title") || undefined,
    description: formData.has("description")
      ? formData.get("description")
      : undefined,
    status: formData.get("status") || undefined,
    assignedToId: formData.has("assignedToId")
      ? formData.get("assignedToId") || null
      : undefined,
    dueDate: formData.has("dueDate")
      ? formData.get("dueDate") || null
      : undefined,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Invalid task data." },
    };
  }

  let task: TaskDTO | null;
  try {
    task = await updateTaskForUser(user.id, parsed.data);
  } catch {
    return {
      success: false,
      error: {
        code: "TASK_UPDATE_FAILED",
        message: "Unable to update task. Check that the assignee exists.",
      },
    };
  }

  if (!task) {
    return {
      success: false,
      error: { code: "TASK_NOT_FOUND", message: "Task not found." },
    };
  }
  revalidatePath("/");
  return { success: true, data: task };
}

export async function deleteTaskAction(
  formData: FormData,
): Promise<ActionResponse<{ deleted: true }>> {
  const user = await getCurrentUser();

  if (!user) {
    return {
      success: false,
      error: { code: "UNAUTHENTICATED", message: "You must be signed in." },
    };
  }

  const parsed = deleteTaskSchema.safeParse({ taskId: formData.get("taskId") });

  if (!parsed.success) {
    return {
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Invalid task id." },
    };
  }

  let deleted: boolean;
  try {
    deleted = await deleteTaskForUser(user.id, parsed.data.taskId);
  } catch {
    return {
      success: false,
      error: { code: "TASK_DELETE_FAILED", message: "Unable to delete task." },
    };
  }

  if (!deleted) {
    return {
      success: false,
      error: { code: "TASK_NOT_FOUND", message: "Task not found." },
    };
  }
  revalidatePath("/");
  return { success: true, data: { deleted: true } };
}
