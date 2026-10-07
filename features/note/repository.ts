import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

const noteInclude = {
  createdBy: { select: { id: true, name: true, image: true } },
} satisfies Prisma.NoteInclude;

export function findProjectForUser(projectId: string, userId: string) {
  return db.project.findFirst({
    where: {
      id: projectId,
      OR: [{ createdById: userId }, { assignedToId: userId }],
    },
    select: { id: true },
  });
}

export function createNote(data: Prisma.NoteCreateInput) {
  return db.$transaction(async (transaction) => {
    const note = await transaction.note.create({ data, include: noteInclude });
    await transaction.activity.create({
      data: {
        project: { connect: { id: note.projectId } },
        user: { connect: { id: note.createdById } },
        action: "NOTE_CREATED",
        description: `note created: ${note.content.slice(0, 80)}`,
      },
    });
    return note;
  });
}

export function updateNoteWithActivity(
  noteId: string,
  projectId: string,
  userId: string,
  content: string,
) {
  return db.$transaction(async (transaction) => {
    const note = await transaction.note.update({
      where: { id: noteId },
      data: { content },
      include: noteInclude,
    });
    await transaction.activity.create({
      data: {
        project: { connect: { id: projectId } },
        user: { connect: { id: userId } },
        action: "NOTE_UPDATED",
        description: `note updated: ${note.content.slice(0, 80)}`,
      },
    });
    return note;
  });
}

export function deleteNoteWithActivity(
  noteId: string,
  projectId: string,
  userId: string,
  content: string,
) {
  return db.$transaction(async (transaction) => {
    await transaction.activity.create({
      data: {
        project: { connect: { id: projectId } },
        user: { connect: { id: userId } },
        action: "NOTE_DELETED",
        description: `note deleted: ${content.slice(0, 80)}`,
      },
    });
    await transaction.note.delete({ where: { id: noteId } });
  });
}

export function findNoteForUser(noteId: string, userId: string) {
  return db.note.findFirst({
    where: {
      id: noteId,
      project: {
        OR: [{ createdById: userId }, { assignedToId: userId }],
      },
    },
    include: noteInclude,
  });
}

export function listProjectNotes(projectId: string) {
  return db.note.findMany({
    where: { projectId },
    include: noteInclude,
    orderBy: { updatedAt: "desc" },
  });
}
