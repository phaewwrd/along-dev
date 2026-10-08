import { signOut } from "@/app/actions/auth";
import {
  CreateProjectControl,
  TaskStatusControl,
  WorkspaceControls,
} from "@/components/workspace/workspace-controls";
import { getDashboardForUser } from "@/features/dashboard/service";
import { listWorkspaceUsersForUser } from "@/features/project/service";
import { requireCurrentUser } from "@/lib/current-user";
import { LogOut } from 'lucide-react';

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function percentage(value: number, total: number) {
  return total === 0 ? 0 : Math.round((value / total) * 100);
}

export default async function Home() {
  const user = await requireCurrentUser();
  const [dashboard, users] = await Promise.all([
    getDashboardForUser(user.id),
    listWorkspaceUsersForUser(),
  ]);
  const now = new Date();
  const {
    recentProjects: projects,
    recentActivities: activities,
    myTasks,
  } = dashboard;
  const projectCounts = dashboard.stats;

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">A</span>
          <span>along</span>
        </div>
        <nav className="nav-links" aria-label="Main navigation">
          <a className="nav-link active" href="#overview">
            <span className="nav-icon">/</span> Overview
          </a>
          <a className="nav-link" href="#projects">
            <span className="nav-icon">[]</span> Projects{" "}
            <span className="nav-count">{projectCounts.totalProjects}</span>
          </a>
          <a className="nav-link" href="#tasks">
            <span className="nav-icon">=</span> My tasks{" "}
            <span className="nav-count">{myTasks.length}</span>
          </a>
          <a className="nav-link" href="#activity">
            <span className="nav-icon">~</span> Activity
          </a>
        </nav>
        <div className="sidebar-bottom">
          <div className="profile">
            <span className="avatar dark-avatar">
              {user.name.slice(0, 2).toUpperCase()}
            </span>
            <span>
              <strong>{user.name}</strong>
              <small>{user.email}</small>
            </span>
            <form action={signOut}>
              <button className="more" type="submit" aria-label="Sign out">
                <LogOut />
              </button>
            </form>
          </div>
        </div>
      </aside>

      <section className="content" id="overview">
        <header className="topbar">
          <div className="breadcrumb">
            Workspace <span>/</span> Overview
          </div>
          <div className="top-actions">
            <CreateProjectControl users={users} />
          </div>
        </header>
        <div className="page-heading">
          <div>
            <p className="eyebrow">
              {now.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
            <h1>Good morning, {user.name}.</h1>
            <p className="subheading">
              Here is what is happening across your workspace.
            </p>
          </div>
          <a className="filter-button" href="#projects">
            Browse projects <span>↓</span>
          </a>
        </div>

        <section className="stats-grid" aria-label="Project statistics">
          <article className="stat-card featured">
            <span className="stat-label">Total projects</span>
            <strong>{projectCounts.totalProjects}</strong>
            <span className="stat-note">Across your workspace</span>
          </article>
          <article className="stat-card">
            <span className="stat-label">Planning</span>
            <strong>{projectCounts.planning}</strong>
            <span className="stat-note">
              <b className="line blue" />
              {percentage(projectCounts.planning, projectCounts.totalProjects)}%
              of total
            </span>
          </article>
          <article className="stat-card">
            <span className="stat-label">In progress</span>
            <strong>{projectCounts.inProgress}</strong>
            <span className="stat-note">
              <b className="line green" />
              {percentage(
                projectCounts.inProgress,
                projectCounts.totalProjects,
              )}
              % of total
            </span>
          </article>
          <article className="stat-card">
            <span className="stat-label">On hold</span>
            <strong>{projectCounts.onHold}</strong>
            <span className="stat-note">
              <b className="line amber" />
              {percentage(projectCounts.onHold, projectCounts.totalProjects)}%
              of total
            </span>
          </article>
          <article className="stat-card">
            <span className="stat-label">Completed</span>
            <strong>{projectCounts.completed}</strong>
            <span className="stat-note">
              {percentage(projectCounts.completed, projectCounts.totalProjects)}
              % of total
            </span>
          </article>
          <article className="stat-card">
            <span className="stat-label">Cancelled</span>
            <strong>{projectCounts.cancelled}</strong>
            <span className="stat-note">
              {percentage(projectCounts.cancelled, projectCounts.totalProjects)}
              % of total
            </span>
          </article>
        </section>

        <div className="section-grid">
          <section className="panel projects-panel" id="projects">
            <div className="panel-heading">
              <div>
                <h2>Projects</h2>
                <p>Your active work at a glance.</p>
              </div>
              <a href="#projects-list">
                View all <span>→</span>
              </a>
            </div>
            <div className="project-list" id="projects-list">
              <WorkspaceControls projects={projects} users={users} />
            </div>
          </section>
          <section className="panel activity-panel" id="activity">
            <div className="panel-heading">
              <div>
                <h2>Recent activity</h2>
                <p>The latest changes from your team.</p>
              </div>
              <a href="#activity-list">
                View all <span>→</span>
              </a>
            </div>
            <div className="activity-list" id="activity-list">
              {activities.length === 0 ? (
                <p className="empty-state">
                  Project and task updates will appear here.
                </p>
              ) : (
                activities.map((activity) => (
                  <div className="activity-row" key={activity.id}>
                    <span className="avatar">
                      {activity.user.name.slice(0, 2).toUpperCase()}
                    </span>
                    <div>
                      <strong>{activity.description}</strong>
                      <small>{formatDate(activity.createdAt)}</small>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <section className="panel tasks-panel" id="tasks">
          <div className="panel-heading">
            <div>
              <h2>My tasks</h2>
              <p>Keep the momentum going.</p>
            </div>
            <a className="quiet-button" href="#tasks-list">
              Open task list <span>→</span>
            </a>
          </div>
          <div className="task-list" id="tasks-list">
            {myTasks.length === 0 ? (
              <p className="empty-state">
                You are all caught up. New open tasks will appear here.
              </p>
            ) : (
              myTasks.map((task) => (
                <TaskStatusControl key={task.id} task={task} users={users} />
              ))
            )}
          </div>
        </section>
      </section>
    </main>
  );
}
