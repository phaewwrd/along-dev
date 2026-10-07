import {
  createProject,
  deleteProjectForUser as deleteProject,
  findProjectForUser,
  listProjects,
  listWorkspaceUsers,
  updateProjectForUser as updateProject,
} from "@/features/project/repository";
import type {
  CreateProjectInput,
  UpdateProjectInput,
} from "@/features/project/schemas";
import type { ProjectDTO } from "@/features/project/types";

function toProjectDTO(
  project: Awaited<ReturnType<typeof createProject>>,
): ProjectDTO {
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
  };
}

export async function createProjectForUser(
  userId: string,
  input: CreateProjectInput,
): Promise<ProjectDTO> {
  const project = await createProject({
    name: input.name,
    description: input.description || null,
    status: input.status,
    ...(input.assignedToId
      ? { assignedTo: { connect: { id: input.assignedToId } } }
      : {}),
    createdBy: { connect: { id: userId } },
  });

  return toProjectDTO(project);
}

export async function listProjectsForUser(
  userId: string,
): Promise<ProjectDTO[]> {
  const projects = await listProjects(userId);
  return projects.map(toProjectDTO);
}

export async function listWorkspaceUsersForUser() {
  return listWorkspaceUsers();
}

export async function getProjectForUser(userId: string, projectId: string) {
  const project = await findProjectForUser(projectId, userId);
  return project ? toProjectDTO(project) : null;
}

export async function updateProjectForUser(
  userId: string,
  input: UpdateProjectInput,
): Promise<ProjectDTO | null> {
  const completedAt =
    input.status === "COMPLETED" ? new Date() : input.status ? null : undefined;
  const project = await updateProject(input.projectId, userId, {
    ...(input.name !== undefined ? { name: input.name } : {}),
    ...(input.description !== undefined
      ? { description: input.description }
      : {}),
    ...(input.status !== undefined ? { status: input.status } : {}),
    ...(input.assignedToId !== undefined
      ? input.assignedToId
        ? { assignedTo: { connect: { id: input.assignedToId } } }
        : { assignedTo: { disconnect: true } }
      : {}),
    ...(completedAt !== undefined ? { completedAt } : {}),
  });

  return project ? toProjectDTO(project) : null;
}

export function deleteProjectForUser(userId: string, projectId: string) {
  return deleteProject(projectId, userId);
}
