import { z } from "zod";

export const projectStatusSchema = z.enum([
  "PLANNING",
  "IN_PROGRESS",
  "ON_HOLD",
  "COMPLETED",
  "CANCELLED",
]);
export type ProjectStatus = z.infer<typeof projectStatusSchema>;

export const createProjectSchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(5000).optional(),
  assignedToId: z.string().min(1).optional(),
  status: projectStatusSchema.default("PLANNING"),
});

export const updateProjectSchema = z.object({
  projectId: z.string().min(1),
  name: z.string().trim().min(1).max(120).optional(),
  description: z.string().trim().max(5000).nullable().optional(),
  assignedToId: z.string().min(1).nullable().optional(),
  status: projectStatusSchema.optional(),
});

export const deleteProjectSchema = z.object({ projectId: z.string().min(1) });

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
