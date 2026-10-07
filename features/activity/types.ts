import type { ActivityAction } from "@prisma/client";

export type ActivityLogDTO = {
  id: string;
  projectId: string | null;
  taskId: string | null;
  user: {
    id: string;
    name: string;
    image: string | null;
  };
  action: ActivityAction;
  description: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
};
