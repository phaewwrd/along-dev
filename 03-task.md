# F03 --- Task Management

## Goal

Manage tasks inside each project.

## Task Fields

``` text
id
projectId
title
description
status
assignedToId
createdById
dueDate
createdAt
updatedAt
completedAt
```

## Task Status

``` ts
TODO
IN_PROGRESS
BLOCKED
DONE
WAITING_FOR_REVIEW
WAITING_FOR_DEPLOY
WAITING_FOR_TESTING
```

## CRUD

-   Create task inside a project
-   Read project tasks
-   Update task
-   Delete task
-   Assign task
-   Change status
-   Set due date

## Request Types

``` ts
export interface CreateTaskRequest {
  projectId: string;
  title: string;
  description?: string;
  assignedToId?: string;
  dueDate?: string;
}

export interface UpdateTaskRequest {
  taskId: string;
  title?: string;
  description?: string;
  status?: TaskStatus;
  assignedToId?: string | null;
  dueDate?: string | null;
}

export interface DeleteTaskRequest {
  taskId: string;
}

export interface GetProjectTasksRequest {
  projectId: string;
}
```

## Response Types

``` ts
export interface TaskDTO {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  assignedTo: UserSummary | null;
  createdBy: UserSummary;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}
```

## Actions

``` text
create-task.action.ts
update-task.action.ts
delete-task.action.ts
assign-task.action.ts
update-task-status.action.ts
list-project-tasks.action.ts
```

## Service

``` text
createTask()
getTask()
listProjectTasks()
updateTask()
deleteTask()
assignTask()
changeTaskStatus()
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

-   A task must belong to an existing project.
-   Assigned user must exist.
-   Task status changes create an activity log.
-   Completing a task sets completedAt.
-   Moving a completed task back to another status clears completedAt.
-   Deleting a task creates an activity log before deletion if the
    project remains available.

## Project Progress

``` text
completed tasks / total tasks × 100
```

If there are no tasks, progress is 0%.

## UI

Inside Project Detail:

``` text
Tasks
────────────────────────────
[ + Add Task ]

□ Design Homepage       TODO
□ Implement API         IN PROGRESS
✓ Deploy                DONE
```

## Acceptance Criteria

-   [ ] Task CRUD works
-   [ ] Tasks are scoped to a project
-   [ ] Task assignment works
-   [ ] Task status works
-   [ ] Due date works
-   [ ] Activity log is created for important mutations
