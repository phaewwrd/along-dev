import { z } from "zod";

export const taskStatusSchema = z.enum([
  "TODO",
  "IN_PROGRESS",
  "BLOCKED",
  "DONE",
  "WAITING_FOR_REVIEW",
  "WAITING_FOR_DEPLOY",
  "WAITING_FOR_TESTING",
]);

const taskDateSchema = z.union([z.iso.datetime(), z.iso.date()]);

export const createTaskSchema = z.object({
  projectId: z.string().min(1),
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().max(5000).optional(),
  assignedToId: z.string().min(1).optional(),
  dueDate: taskDateSchema.optional(),
  status: taskStatusSchema.default("TODO"),
});

export const updateTaskSchema = z.object({
  taskId: z.string().min(1),
  title: z.string().trim().min(1).max(160).optional(),
  description: z.string().trim().max(5000).nullable().optional(),
  status: taskStatusSchema.optional(),
  assignedToId: z.string().min(1).nullable().optional(),
  dueDate: taskDateSchema.nullable().optional(),
});

export const deleteTaskSchema = z.object({ taskId: z.string().min(1) });

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TaskStatus = z.infer<typeof taskStatusSchema>;
