import { z } from "zod";

export const createNoteSchema = z.object({
  projectId: z.string().min(1),
  content: z.string().trim().min(1).max(10000),
});

export const updateNoteSchema = z.object({
  noteId: z.string().min(1),
  content: z.string().trim().min(1).max(10000),
});

export const deleteNoteSchema = z.object({ noteId: z.string().min(1) });

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
