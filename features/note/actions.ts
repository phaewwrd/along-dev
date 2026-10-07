"use server";

import { revalidatePath } from "next/cache";
import {
  createNoteSchema,
  deleteNoteSchema,
  updateNoteSchema,
} from "@/features/note/schemas";
import {
  createNoteForUser,
  deleteNoteForUser,
  listProjectNotesForUser,
  updateNoteForUser,
} from "@/features/note/service";
import type { ProjectNoteDTO } from "@/features/note/types";
import { getCurrentUser } from "@/lib/current-user";
import type { ActionResponse } from "@/types/action-response";

export async function createNoteAction(
  formData: FormData,
): Promise<ActionResponse<ProjectNoteDTO>> {
  const user = await getCurrentUser();

  if (!user) {
    return {
      success: false,
      error: { code: "UNAUTHENTICATED", message: "You must be signed in." },
    };
  }

  const parsed = createNoteSchema.safeParse({
    projectId: formData.get("projectId"),
    content: formData.get("content"),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Note content is required." },
    };
  }

  let note: ProjectNoteDTO | null;
  try {
    note = await createNoteForUser(user.id, parsed.data);
  } catch {
    return {
      success: false,
      error: { code: "NOTE_CREATE_FAILED", message: "Unable to create note." },
    };
  }

  if (!note) {
    return {
      success: false,
      error: { code: "PROJECT_NOT_FOUND", message: "Project not found." },
    };
  }
  revalidatePath("/");
  return { success: true, data: note };
}

export async function listProjectNotesAction(
  projectId: string,
): Promise<ActionResponse<ProjectNoteDTO[]>> {
  const user = await getCurrentUser();

  if (!user) {
    return {
      success: false,
      error: { code: "UNAUTHENTICATED", message: "You must be signed in." },
    };
  }

  let notes: ProjectNoteDTO[] | null;
  try {
    notes = await listProjectNotesForUser(user.id, projectId);
  } catch {
    return {
      success: false,
      error: { code: "NOTE_LIST_FAILED", message: "Unable to load notes." },
    };
  }

  return notes
    ? { success: true, data: notes }
    : {
        success: false,
        error: { code: "PROJECT_NOT_FOUND", message: "Project not found." },
      };
}

export async function updateNoteAction(
  formData: FormData,
): Promise<ActionResponse<ProjectNoteDTO>> {
  const user = await getCurrentUser();

  if (!user) {
    return {
      success: false,
      error: { code: "UNAUTHENTICATED", message: "You must be signed in." },
    };
  }

  const parsed = updateNoteSchema.safeParse({
    noteId: formData.get("noteId"),
    content: formData.get("content"),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Note content is required." },
    };
  }

  let note: ProjectNoteDTO | null;
  try {
    note = await updateNoteForUser(user.id, parsed.data);
  } catch {
    return {
      success: false,
      error: { code: "NOTE_UPDATE_FAILED", message: "Unable to update note." },
    };
  }

  if (!note) {
    return {
      success: false,
      error: { code: "NOTE_NOT_FOUND", message: "Note not found." },
    };
  }
  revalidatePath("/");
  return { success: true, data: note };
}

export async function deleteNoteAction(
  formData: FormData,
): Promise<ActionResponse<{ deleted: true }>> {
  const user = await getCurrentUser();

  if (!user) {
    return {
      success: false,
      error: { code: "UNAUTHENTICATED", message: "You must be signed in." },
    };
  }

  const parsed = deleteNoteSchema.safeParse({ noteId: formData.get("noteId") });

  if (!parsed.success) {
    return {
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Invalid note id." },
    };
  }

  let deleted: boolean;
  try {
    deleted = await deleteNoteForUser(user.id, parsed.data.noteId);
  } catch {
    return {
      success: false,
      error: { code: "NOTE_DELETE_FAILED", message: "Unable to delete note." },
    };
  }

  if (!deleted) {
    return {
      success: false,
      error: { code: "NOTE_NOT_FOUND", message: "Note not found." },
    };
  }
  revalidatePath("/");
  return { success: true, data: { deleted: true } };
}
