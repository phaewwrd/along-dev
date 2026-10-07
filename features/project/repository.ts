import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import type { ProjectStatus } from "./schemas";

const projectInclude = {
  assignedTo: { select: { id: true, name: true, image: true } },
  createdBy: { select: { id: true, name: true, image: true } },
} satisfies Prisma.ProjectInclude;

export function createProject(data: Prisma.ProjectCreateInput) {
  return db.$transaction(async (transaction) => {
    const project = await transaction.project.create({
      data,
      include: projectInclude,
    });
    await transaction.activity.create({
      data: {
        project: { connect: { id: project.id } },
        user: { connect: { id: project.createdById } },
        action: "PROJECT_CREATED",
        description: `project created: ${project.name}`,
      },
    });
    return project;
  });
}

export function listProjects(userId: string, status?: ProjectStatus) {
  return db.project.findMany({
    where: {
      OR: [{ createdById: userId }, { assignedToId: userId }],
      ...(status ? { status } : {}),
    },
    include: projectInclude,
    orderBy: { updatedAt: "desc" },
  });
}

export function listWorkspaceUsers() {
  return db.user.findMany({
    select: { id: true, name: true, image: true },
    orderBy: { name: "asc" },
  });
}

export async function findProjectForUser(projectId: string, userId: string) {
  return db.project.findFirst({
    where: {
      id: projectId,
      OR: [{ createdById: userId }, { assignedToId: userId }],
    },
    include: projectInclude,
  });
}

export async function updateProjectForUser(
  projectId: string,
  userId: string,
  data: Prisma.ProjectUpdateInput,
) {
  return db.$transaction(async (transaction) => {
    const existing = await transaction.project.findFirst({
      where: {
        id: projectId,
        OR: [{ createdById: userId }, { assignedToId: userId }],
      },
      include: projectInclude,
    });
    if (!existing) return null;

    const updated = await transaction.project.update({
      where: { id: projectId },
      data,
      include: projectInclude,
    });
    const action =
      data.status && data.status !== existing.status
        ? "PROJECT_STATUS_CHANGED"
        : data.assignedTo
          ? data.assignedTo.connect
            ? "PROJECT_ASSIGNED"
            : "PROJECT_UNASSIGNED"
          : "PROJECT_UPDATED";
    await transaction.activity.create({
      data: {
        project: { connect: { id: projectId } },
        user: { connect: { id: userId } },
        action,
        description: `${action.replaceAll("_", " ").toLowerCase()}: ${updated.name}`,
      },
    });
    return updated;
  });
}

export async function deleteProjectForUser(projectId: string, userId: string) {
  return db.$transaction(async (transaction) => {
    const existing = await transaction.project.findFirst({
      where: {
        id: projectId,
        OR: [{ createdById: userId }, { assignedToId: userId }],
      },
      select: { id: true, name: true },
    });
    if (!existing) return false;

    await transaction.activity.create({
      data: {
        project: { connect: { id: existing.id } },
        user: { connect: { id: userId } },
        action: "PROJECT_DELETED",
        description: `project deleted: ${existing.name}`,
      },
    });
    await transaction.project.delete({ where: { id: projectId } });
    return true;
  });
}
