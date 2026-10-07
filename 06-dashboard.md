# F06 --- Dashboard

## Goal

Provide a simple overview of project status and recent activity.

## Dashboard Statistics

Display: - Total projects - Planning - In Progress - On Hold -
Completed - Cancelled

## Recent Projects

Display: - Project name - Status - Assigned user - Task progress -
Updated date

## Recent Activity

Display latest project/task activity.

## Request Types

``` ts
export interface GetDashboardRequest {}

export interface DashboardStatsDTO {
  totalProjects: number;
  planning: number;
  inProgress: number;
  onHold: number;
  completed: number;
  cancelled: number;
}
```

``` ts
export interface DashboardDTO {
  stats: DashboardStatsDTO;
  recentProjects: ProjectDTO[];
  recentActivities: ActivityLogDTO[];
}
```

## Service

``` text
getDashboard()
getDashboardStats()
getRecentProjects()
getRecentActivities()
```

## Repository

Dashboard repositories should use efficient aggregated queries where
possible.

Avoid loading every project into memory just to calculate counts.

## UI

Example:

``` text
Projects
────────────────────────────────

Total       24
Planning     5
In Progress  8
On Hold      2
Completed    7
Cancelled    2
```

Then:

``` text
Recent Projects

Website Redesign
IN PROGRESS · Praew · Updated today

POS System
PLANNING · John · Updated yesterday
```

And:

``` text
Recent Activity

Praew changed Website Redesign to IN PROGRESS
John created a task
Mike completed a task
```

## Design

Use only: - Black - Gray - White

Cards should be clean with subtle borders and spacing.

## Performance

-   Prefer Server Components for initial dashboard rendering.
-   Use Prisma aggregation for counts.
-   Avoid N+1 queries.
-   Use TanStack Query only where interactive refresh/filter behavior
    requires it.

## Acceptance Criteria

-   [ ] Dashboard loads authenticated user's project data
-   [ ] Status counts are accurate
-   [ ] Recent projects are displayed
-   [ ] Recent activities are displayed
-   [ ] Responsive layout
-   [ ] Minimal black/gray/white UI
