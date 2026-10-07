import {
  createNote,
  deleteNoteWithActivity,
  findNoteForUser,
  findProjectForUser,
  listProjectNotes,
  updateNoteWithActivity,
} from "@/features/note/repository";
import type { CreateNoteInput, UpdateNoteInput } from "@/features/note/schemas";
import type { ProjectNoteDTO } from "@/features/note/types";

function toNoteDTO(
  note: Awaited<ReturnType<typeof createNote>>,
): ProjectNoteDTO {
  return {
    id: note.id,
    projectId: note.projectId,
    content: note.content,
    createdBy: note.createdBy,
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString(),
  };
}

export async function createNoteForUser(
  userId: string,
  input: CreateNoteInput,
): Promise<ProjectNoteDTO | null> {
  const project = await findProjectForUser(input.projectId, userId);

  if (!project) return null;

  const note = await createNote({
    project: { connect: { id: input.projectId } },
    content: input.content,
    createdBy: { connect: { id: userId } },
  });

  return toNoteDTO(note);
}

export async function listProjectNotesForUser(
  userId: string,
  projectId: string,
): Promise<ProjectNoteDTO[] | null> {
  const project = await findProjectForUser(projectId, userId);

  if (!project) return null;

  const notes = await listProjectNotes(projectId);
  return notes.map(toNoteDTO);
}

export async function updateNoteForUser(
  userId: string,
  input: UpdateNoteInput,
): Promise<ProjectNoteDTO | null> {
  const existing = await findNoteForUser(input.noteId, userId);

  if (!existing) return null;

  const note = await updateNoteWithActivity(
    input.noteId,
    existing.projectId,
    userId,
    input.content,
  );

  return toNoteDTO(note);
}

export async function deleteNoteForUser(
  userId: string,
  noteId: string,
): Promise<boolean> {
  const existing = await findNoteForUser(noteId, userId);

  if (!existing) return false;

  await deleteNoteWithActivity(
    noteId,
    existing.projectId,
    userId,
    existing.content,
  );

  return true;
}
