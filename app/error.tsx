"use client";

export default function WorkspaceError({ retry }: { retry: () => void }) {
  return (
    <main className="route-error" role="alert">
      <p className="eyebrow">Workspace unavailable</p>
      <h1>We couldn’t load your workspace.</h1>
      <p>Try again in a moment. Your saved projects and tasks are unchanged.</p>
      <button type="button" onClick={retry}>
        Try again
      </button>
    </main>
  );
}
