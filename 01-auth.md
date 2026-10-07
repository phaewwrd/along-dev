# F01 --- Authentication

## Goal

Provide secure authentication using Better Auth.

## Requirements

-   Login
-   Logout
-   Session management
-   Protected routes
-   Current authenticated user
-   Server-side session validation

## User

Better Auth owns authentication/session tables.

Application features reference the Better Auth user ID.

## Architecture

``` text
Login UI
→ Better Auth
→ Session
→ Protected Server Component / Action
```

## Security

-   Never trust user identity from the client.
-   Validate the session on the server.
-   Never expose passwords or secrets.
-   Protected mutations must require an authenticated session.

## Types

``` ts
export interface CurrentUserDTO {
  id: string;
  name: string;
  email: string;
  image: string | null;
}
```

## Acceptance Criteria

-   [ ] User can login
-   [ ] User can logout
-   [ ] Invalid session cannot access protected pages
-   [ ] Server Actions reject unauthenticated requests
