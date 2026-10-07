import type { TaskStatus } from "./schemas";

export type TaskDTO = {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  assignedTo: {
    id: string;
    name: string;
    image: string | null;
  } | null;
  createdBy: {
    id: string;
    name: string;
    image: string | null;
  };
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
};
