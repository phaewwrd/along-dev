import type { ProjectStatus } from "./schemas";

export type UserSummary = {
  id: string;
  name: string;
  image: string | null;
};

export type ProjectDTO = {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  assignedTo: UserSummary | null;
  createdBy: UserSummary;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
};
