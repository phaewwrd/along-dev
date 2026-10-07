# Along Project --- Architecture

## Overview

Along Project is a project tracking web application built with Next.js,
TypeScript, Better Auth, Prisma ORM, Neon Serverless PostgreSQL,
TanStack Query, Zod, and Tailwind CSS.

## Core Architecture

UI → Server Action → Service → Repository → Prisma → Neon PostgreSQL

### Rules

-   UI must never access Prisma directly.
-   Server Actions handle authentication, validation, and
    request/response.
-   Services contain business logic.
-   Repositories contain database access only.
-   Zod validates every incoming request.
-   DTOs are returned to the UI instead of raw Prisma models.
-   Use Server Components by default.
-   Use Client Components only when interaction is required.
-   Use TanStack Query for client-side server state where useful.

## Suggested Structure

``` text
src/
├── app/
│   ├── (auth)/login/
│   └── (dashboard)/
│       ├── dashboard/
│       └── projects/
├── components/
│   ├── ui/
│   └── shared/
├── features/
│   ├── auth/
│   ├── project/
│   ├── task/
│   ├── note/
│   ├── activity/
│   └── dashboard/
├── lib/
│   ├── auth/
│   ├── db/
│   └── validations/
├── types/
└── prisma/
    └── schema.prisma
```

## Feature Structure

``` text
features/project/
├── actions/
├── components/
├── repositories/
├── schemas/
├── services/
└── types/
```

## Standard Response

``` ts
export type ActionResponse<T> =
  | { success: true; data: T }
  | {
      success: false;
      error: {
        code: string;
        message: string;
        field?: string;
      };
    };
```

## UI Design

Use only: - Black - Gray - White

The UI should be modern, minimal, responsive, and simple.
