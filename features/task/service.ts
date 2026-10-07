import {
  createTask,
  deleteTaskWithActivity,
  findProjectForUser,
  findTaskForUser,
  listProjectTasks,
  updateTaskWithActivity,
} from "@/features/task/repository";
import type { CreateTaskInput, UpdateTaskInput } from "@/features/task/schemas";
import type { TaskDTO } from "@/features/task/types";

function toTaskDTO(task: Awaited<ReturnType<typeof createTask>>): TaskDTO {
  return {
    id: task.id,
    projectId: task.projectId,
    title: task.title,
    description: task.description,
    status: task.status,
    assignedTo: task.assignedTo,
    createdBy: task.createdBy,
    dueDate: task.dueDate?.toISOString() ?? null,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
    completedAt: task.completedAt?.toISOString() ?? null,
  };
}

export async function createTaskForUser(
  userId: string,
  input: CreateTaskInput,
): Promise<TaskDTO | null> {
  const project = await findProjectForUser(input.projectId, userId);

  if (!project) return null;

  const task = await createTask({
    project: { connect: { id: input.projectId } },
    title: input.title,
    description: input.description || null,
    status: input.status,
    dueDate: input.dueDate ? new Date(input.dueDate) : null,
    ...(input.assignedToId
      ? { assignedTo: { connect: { id: input.assignedToId } } }
      : {}),
    createdBy: { connect: { id: userId } },
  });

  return toTaskDTO(task);
}

export async function listProjectTasksForUser(
  userId: string,
  projectId: string,
): Promise<TaskDTO[] | null> {
  const project = await findProjectForUser(projectId, userId);

  if (!project) return null;

  const tasks = await listProjectTasks(projectId);
  return tasks.map(toTaskDTO);
}

export async function updateTaskForUser(
  userId: string,
  input: UpdateTaskInput,
): Promise<TaskDTO | null> {
  const existing = await findTaskForUser(input.taskId, userId);

  if (!existing) return null;

  // change status based on status
  // if status is "DONE", set completedAt to the current date
  const completedAt =
    input.status === "DONE" ? new Date() : input.status ? null : undefined;
  const action =
    input.status && input.status !== existing.status
      ? input.status === "DONE"
        ? "TASK_COMPLETED"
        : "TASK_STATUS_CHANGED"
      : input.assignedToId !== undefined &&
          input.assignedToId !== existing.assignedToId
        ? input.assignedToId
          ? "TASK_ASSIGNED"
          : "TASK_UNASSIGNED"
        : "TASK_UPDATED";

  const updated = await updateTaskWithActivity(
    input.taskId,
    userId,
    existing.projectId,
    {
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.description !== undefined
        ? { description: input.description }
        : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.assignedToId !== undefined
        ? input.assignedToId
          ? { assignedTo: { connect: { id: input.assignedToId } } }
          : { assignedTo: { disconnect: true } }
        : {}),
      ...(input.dueDate !== undefined
        ? { dueDate: input.dueDate ? new Date(input.dueDate) : null }
        : {}),
      ...(completedAt !== undefined ? { completedAt } : {}),
    },
    action,
  );

  return toTaskDTO(updated);
}

export async function deleteTaskForUser(
  userId: string,
  taskId: string,
): Promise<boolean> {
  const existing = await findTaskForUser(taskId, userId);

  if (!existing) return false;

  await deleteTaskWithActivity(
    taskId,
    userId,
    existing.projectId,
    existing.title,
  );

  return true;
}
