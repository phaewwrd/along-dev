# F05 --- Activity Log

## Goal

Maintain an immutable history of important project and task actions.

## Fields

``` text
id
projectId
taskId
userId
action
description
metadata
createdAt
```

`taskId` is nullable for project-level activities.

## Actions

Project: - PROJECT_CREATED - PROJECT_UPDATED - PROJECT_ASSIGNED -
PROJECT_UNASSIGNED - PROJECT_STATUS_CHANGED - PROJECT_DELETED

Task: - TASK_CREATED - TASK_UPDATED - TASK_ASSIGNED - TASK_UNASSIGNED -
TASK_STATUS_CHANGED - TASK_COMPLETED - TASK_DELETED

Note: - NOTE_CREATED - NOTE_UPDATED - NOTE_DELETED

## Request Types

Activity logs should normally be generated internally by services rather
than directly from client input.

``` ts
export interface CreateActivityLogRequest {
  projectId: string;
  taskId?: string;
  userId: string;
  action: ActivityAction;
  description: string;
  metadata?: Record<string, unknown>;
}
```

## Response Type

``` ts
export interface ActivityLogDTO {
  id: string;
  projectId: string;
  taskId: string | null;
  user: UserSummary;
  action: ActivityAction;
  description: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}
```

## Repository

``` text
create()
findManyByProjectId()
```

Activity logs should be treated as immutable.

## Service Rules

Services are responsible for creating logs.

Example:

``` text
assignProject()
├── update project assignment
└── create PROJECT_ASSIGNED log
```

## Transaction

When an important mutation and its activity log must succeed together,
use a Prisma transaction.

Example:

``` text
Update project
+
Create activity log
```

## UI

Display newest activities first.

``` text
Activity
────────────────────────────

01 Oct 2026 14:20
Praew changed project status
PLANNING → IN PROGRESS

01 Oct 2026 13:50
Praew assigned project to John

01 Oct 2026 13:30
Praew created project
```

## Acceptance Criteria

-   [ ] Project actions are logged
-   [ ] Task actions are logged
-   [ ] Note actions are logged
-   [ ] User and timestamp are displayed
-   [ ] Logs cannot be edited from UI
-   [ ] Logs are ordered newest first
