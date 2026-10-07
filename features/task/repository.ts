import type { Prisma, TaskStatus } from "@prisma/client";
import { db } from "@/lib/db";

const taskInclude = {
  assignedTo: { select: { id: true, name: true, image: true } },
  createdBy: { select: { id: true, name: true, image: true } },
} satisfies Prisma.TaskInclude;

export function createTask(data: Prisma.TaskCreateInput) {
  return db.$transaction(async (transaction) => {
    const task = await transaction.task.create({ data, include: taskInclude });
    await transaction.activity.create({
      data: {
        project: { connect: { id: task.projectId } },
        task: { connect: { id: task.id } },
        user: { connect: { id: task.createdById } },
        action: "TASK_CREATED",
        description: `task created: ${task.title}`,
      },
    });
    return task;
  });
}

export function findProjectForUser(projectId: string, userId: string) {
  return db.project.findFirst({
    where: {
      id: projectId,
      OR: [{ createdById: userId }, { assignedToId: userId }],
    },
    select: { id: true },
  });
}

export function findTaskForUser(taskId: string, userId: string) {
  return db.task.findFirst({
    where: {
      id: taskId,
      project: {
        OR: [{ createdById: userId }, { assignedToId: userId }],
      },
    },
    include: taskInclude,
  });
}

export function updateTask(taskId: string, data: Prisma.TaskUpdateInput) {
  return db.task.update({ where: { id: taskId }, data, include: taskInclude });
}

export function updateTaskWithActivity(
  taskId: string,
  userId: string,
  projectId: string,
  data: Prisma.TaskUpdateInput,
  action: Prisma.ActivityCreateInput["action"],
) {
  return db.$transaction(async (transaction) => {
    const task = await transaction.task.update({
      where: { id: taskId },
      data,
      include: taskInclude,
    });
    await transaction.activity.create({
      data: {
        project: { connect: { id: projectId } },
        task: { connect: { id: taskId } },
        user: { connect: { id: userId } },
        action,
        description: `${action.replaceAll("_", " ").toLowerCase()}: ${task.title}`,
      },
    });
    return task;
  });
}

export function deleteTask(taskId: string) {
  return db.task.delete({ where: { id: taskId } });
}

export function deleteTaskWithActivity(
  taskId: string,
  userId: string,
  projectId: string,
  title: string,
) {
  return db.$transaction(async (transaction) => {
    await transaction.activity.create({
      data: {
        project: { connect: { id: projectId } },
        task: { connect: { id: taskId } },
        user: { connect: { id: userId } },
        action: "TASK_DELETED",
        description: `task deleted: ${title}`,
      },
    });
    await transaction.task.delete({ where: { id: taskId } });
  });
}

export function createActivity(data: Prisma.ActivityCreateInput) {
  return db.activity.create({ data });
}

export function listProjectTasks(projectId: string, status?: TaskStatus) {
  return db.task.findMany({
    where: { projectId, ...(status ? { status } : {}) },
    include: taskInclude,
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
  });
}
