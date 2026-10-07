# F02 --- Project Management

## Goal

Provide complete CRUD and status/assignment management for projects.

## Project Fields

``` text
id
name
description
status
assignedToId
createdById
createdAt
updatedAt
completedAt
```

## Project Status

``` ts
PLANNING
IN_PROGRESS
ON_HOLD
COMPLETED
CANCELLED
```

## CRUD

### Create

Required: - name - description - status - optional assigned user

### Read

-   Project list
-   Project detail
-   Search
-   Status filter
-   Assigned-user filter
-   Pagination

### Update

-   name
-   description
-   status
-   assignment

### Delete

Delete project and dependent records according to Prisma relation rules.

## Assignment

A project can be assigned to any authenticated account.

Rules: - Assigned user must exist. - Assignment changes create an
activity log. - Unassignment is supported.

## Request Types

``` ts
export interface CreateProjectRequest {
  name: string;
  description?: string;
  assignedToId?: string;
}

export interface UpdateProjectRequest {
  projectId: string;
  name?: string;
  description?: string;
  status?: ProjectStatus;
  assignedToId?: string | null;
}

export interface DeleteProjectRequest {
  projectId: string;
}

export interface GetProjectRequest {
  projectId: string;
}
```

## Response Types

``` ts
export interface UserSummary {
  id: string;
  name: string;
  image: string | null;
}

export interface ProjectDTO {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  assignedTo: UserSummary | null;
  createdBy: UserSummary;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}
```

## Actions

``` text
create-project.action.ts
update-project.action.ts
delete-project.action.ts
assign-project.action.ts
update-project-status.action.ts
get-project.action.ts
list-projects.action.ts
```

## Service

``` text
createProject()
getProject()
listProjects()
updateProject()
deleteProject()
assignProject()
changeProjectStatus()
```

## Repository

Repository handles only Prisma operations.

``` text
create()
findById()
findMany()
update()
delete()
```

## UI

Project list should show: - Name - Status - Assigned user - Task
progress - Last updated

Project detail should show: - Project information - Status - Assigned
user - Progress - Tasks - Notes - Activity

## Acceptance Criteria

-   [ ] Project CRUD works
-   [ ] Status can be changed
-   [ ] Project can be assigned/unassigned
-   [ ] Every important mutation creates an activity log
-   [ ] UI is responsive
