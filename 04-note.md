# F04 --- Project Notes

## Goal

Allow users to store additional information related to a project.

## Note Fields

``` text
id
projectId
content
createdById
createdAt
updatedAt
```

## CRUD

-   Create note
-   Read notes
-   Update note
-   Delete note

## Request Types

``` ts
export interface CreateNoteRequest {
  projectId: string;
  content: string;
}

export interface UpdateNoteRequest {
  noteId: string;
  content: string;
}

export interface DeleteNoteRequest {
  noteId: string;
}

export interface ListProjectNotesRequest {
  projectId: string;
}
```

## Response Type

``` ts
export interface ProjectNoteDTO {
  id: string;
  projectId: string;
  content: string;
  createdBy: UserSummary;
  createdAt: string;
  updatedAt: string;
}
```

## Actions

``` text
create-note.action.ts
update-note.action.ts
delete-note.action.ts
list-project-notes.action.ts
```

## Service

``` text
createNote()
updateNote()
deleteNote()
listProjectNotes()
```

## Repository

``` text
create()
findById()
findManyByProjectId()
update()
delete()
```

## Business Rules

-   Note must belong to an existing project.
-   Content cannot be empty.
-   Author is taken from the authenticated session.
-   Users must not provide createdById from the client.
-   Note mutations create activity logs.

## UI

Project Detail → Notes

``` text
Notes
────────────────────────────

Need client confirmation before development.

Praew
01 Oct 2026, 14:20

[Edit] [Delete]
```

## Acceptance Criteria

-   [ ] Create note
-   [ ] Edit note
-   [ ] Delete note
-   [ ] Show author
-   [ ] Show date-time
-   [ ] Activity is logged
