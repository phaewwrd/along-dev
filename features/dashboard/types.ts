import type { ActivityLogDTO } from "@/features/activity/types";
import type { ProjectDTO } from "@/features/project/types";
import type { TaskDTO } from "@/features/task/types";

export type DashboardStatsDTO = {
  totalProjects: number;
  planning: number;
  inProgress: number;
  onHold: number;
  completed: number;
  cancelled: number;
};

export type DashboardDTO = {
  stats: DashboardStatsDTO;
  recentProjects: (ProjectDTO & {
    taskProgress: {
      completed: number;
      total: number;
      percentage: number;
    };
  })[];
  recentActivities: ActivityLogDTO[];
  myTasks: (TaskDTO & { projectName: string })[];
};
