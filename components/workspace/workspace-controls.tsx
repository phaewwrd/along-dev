"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { DashboardDTO } from "@/features/dashboard/types";
import {
    createNoteAction,
    deleteNoteAction,
    listProjectNotesAction,
    updateNoteAction,
} from "@/features/note/actions";
import type { ProjectNoteDTO } from "@/features/note/types";
import {
    createProjectAction,
    deleteProjectAction,
    updateProjectAction,
} from "@/features/project/actions";
import type { ProjectStatus } from "@/features/project/schemas";
import type { UserSummary } from "@/features/project/types";
import {
    createTaskAction,
    deleteTaskAction,
    listProjectTasksAction,
    updateTaskAction,
} from "@/features/task/actions";
import type { TaskDTO } from "@/features/task/types";

const projectStatuses: ProjectStatus[] = [
    "PLANNING",
    "IN_PROGRESS",
    "ON_HOLD",
    "COMPLETED",
    "CANCELLED",
];
const taskStatuses = [
    "TODO",
    "IN_PROGRESS",
    "BLOCKED",
    "DONE",
    "WAITING_FOR_REVIEW",
    "WAITING_FOR_DEPLOY",
    "WAITING_FOR_TESTING",
] as const;
type ProjectWithProgress = DashboardDTO["recentProjects"][number];

function label(value: string) {
    return value
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(/^./, (letter) => letter.toUpperCase());
}

function ResultMessage({ message }: { message: string }) {
    if (!message) return null;
    const isError = message.startsWith("Error:");
    return (
        <output
            className={isError ? "workspace-error" : "workspace-success"}
            aria-live="polite"
        >
            {message}
        </output>
    );
}

export function WorkspaceControls({
    projects,
    users,
}: {
    projects: ProjectWithProgress[];
    users: UserSummary[];
}) {
    const [query, setQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [assigneeFilter, setAssigneeFilter] = useState("ALL");
    const [page, setPage] = useState(0);
    const [message, setMessage] = useState("");
    const [pending, startTransition] = useTransition();
    const router = useRouter();
    const visibleProjects = projects.filter((project) => {
        const matchesQuery = project.name
            .toLowerCase()
            .includes(query.toLowerCase());
        const matchesAssignee =
            assigneeFilter === "ALL" ||
            (assigneeFilter === "UNASSIGNED"
                ? project.assignedTo === null
                : project.assignedTo?.id === assigneeFilter);
        return (
            matchesQuery &&
            (statusFilter === "ALL" || project.status === statusFilter) &&
            matchesAssignee
        );
    });
    const pageSize = 10;
    const pageCount = Math.ceil(visibleProjects.length / pageSize);
    const currentPage = Math.min(page, Math.max(0, pageCount - 1));
    const pageProjects = visibleProjects.slice(
        currentPage * pageSize,
        (currentPage + 1) * pageSize,
    );

    function runMutation(
        action: (
            data: FormData,
        ) => Promise<{ success: boolean; error?: { message: string } }>,
        formData: FormData,
        successMessage: string,
    ) {
        setMessage("");
        startTransition(async () => {
            try {
                const response = await action(formData);
                setMessage(
                    response.success
                        ? successMessage
                        : `Error: ${response.error?.message ?? "Unable to complete this action."}`,
                );
                if (response.success) router.refresh();
            } catch {
                setMessage(
                    "Error: Request failed. Check your connection and try again.",
                );
            }
        });
    }

    return (
        <>
            <div className="workspace-toolbar">
                <label>
                    <span className="sr-only">Search projects</span>
                    <input
                        value={query}
                        onChange={(event) => {
                            setQuery(event.target.value);
                            setPage(0);
                        }}
                        placeholder="Search projects"
                    />
                </label>
                <label>
                    <span className="sr-only">Filter projects by status</span>
                    <select
                        value={statusFilter}
                        onChange={(event) => {
                            setStatusFilter(event.target.value);
                            setPage(0);
                        }}
                    >
                        <option value="ALL">All statuses</option>
                        {projectStatuses.map((status) => (
                            <option key={status} value={status}>
                                {label(status)}
                            </option>
                        ))}
                    </select>
                </label>
                <label>
                    <span className="sr-only">Filter projects by assignee</span>
                    <select
                        value={assigneeFilter}
                        onChange={(event) => {
                            setAssigneeFilter(event.target.value);
                            setPage(0);
                        }}
                    >
                        <option value="ALL">All assignees</option>
                        <option value="UNASSIGNED">Unassigned</option>
                        {users.map((user) => (
                            <option key={user.id} value={user.id}>
                                {user.name}
                            </option>
                        ))}
                    </select>
                </label>
            </div>
            <ResultMessage message={message} />
            {visibleProjects.length === 0 ? (
                <p className="empty-state">
                    {projects.length
                        ? "No projects match your search."
                        : "Projects you create or join will appear here."}
                </p>
            ) : (
                pageProjects.map((project) => (
                    <ProjectRow
                        key={project.id}
                        project={project}
                        users={users}
                        pending={pending}
                        runMutation={runMutation}
                    />
                ))
            )}
            {pageCount > 1 && (
                <nav className="project-pagination" aria-label="Project pages">
                    <button
                        type="button"
                        disabled={currentPage === 0}
                        onClick={() => setPage(currentPage - 1)}
                    >
                        Previous
                    </button>
                    <span>
                        Page {currentPage + 1} of {pageCount}
                    </span>
                    <button
                        type="button"
                        disabled={currentPage + 1 >= pageCount}
                        onClick={() => setPage(currentPage + 1)}
                    >
                        Next
                    </button>
                </nav>
            )}
        </>
    );
}

export function CreateProjectControl({ users }: { users: UserSummary[] }) {
    const [message, setMessage] = useState("");
    const [pending, startTransition] = useTransition();
    const router = useRouter();

    return (
        <details className="create-project-control">
            <summary className="new-button">+ New project</summary>
            <form
                action={(formData) => {
                    setMessage("");
                    startTransition(async () => {
                        try {
                            const response = await createProjectAction(formData);
                            setMessage(
                                response.success
                                    ? "Project created."
                                    : `Error: ${response.error.message}`,
                            );
                            if (response.success) router.refresh();
                        } catch {
                            setMessage(
                                "Error: Request failed. Check your connection and try again.",
                            );
                        }
                    });
                }}
                className="workspace-form compact-form"
            >
                <label>
                    Project name
                    <input name="name" required maxLength={120} />
                </label>
                <label>
                    Description
                    <textarea name="description" maxLength={5000} />
                </label>
                <label>
                    Status
                    <select name="status" defaultValue="PLANNING">
                        {projectStatuses.map((status) => (
                            <option key={status} value={status}>
                                {label(status)}
                            </option>
                        ))}
                    </select>
                </label>
                <label>
                    Assignee
                    <select name="assignedToId" defaultValue="">
                        <option value="">Unassigned</option>
                        {users.map((user) => (
                            <option key={user.id} value={user.id}>
                                {user.name}
                            </option>
                        ))}
                    </select>
                </label>
                <button type="submit" disabled={pending}>
                    {pending ? "Creating…" : "Create project"}
                </button>
                <ResultMessage message={message} />
            </form>
        </details>
    );
}

function ProjectRow({
    project,
    users,
    pending,
    runMutation,
}: {
    project: ProjectWithProgress;
    users: UserSummary[];
    pending: boolean;
    runMutation: (
        action: (
            data: FormData,
        ) => Promise<{ success: boolean; error?: { message: string } }>,
        formData: FormData,
        successMessage: string,
    ) => void;
}) {
    const status = project.status.toLowerCase().replace("_", "-");
    const owner = project.assignedTo ?? project.createdBy;
    const [open, setOpen] = useState(false);
    const [tasks, setTasks] = useState<TaskDTO[]>([]);
    const [notes, setNotes] = useState<ProjectNoteDTO[]>([]);
    const [detailMessage, setDetailMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [busy, startBusy] = useTransition();
    const router = useRouter();

    async function toggleDetails() {
        const nextOpen = !open;
        setOpen(nextOpen);
        if (nextOpen && tasks.length === 0 && notes.length === 0) {
            setLoading(true);
            try {
                const [taskResult, noteResult] = await Promise.all([
                    listProjectTasksAction(project.id),
                    listProjectNotesAction(project.id),
                ]);
                if (taskResult.success) setTasks(taskResult.data);
                if (noteResult.success) setNotes(noteResult.data);
                setDetailMessage(
                    !taskResult.success
                        ? `Error: ${taskResult.error.message}`
                        : !noteResult.success
                            ? `Error: ${noteResult.error.message}`
                            : "",
                );
            } catch {
                setDetailMessage("Error: Unable to load project details.");
            } finally {
                setLoading(false);
            }
        }
    }

    function mutateDetail(
        action: (data: FormData) => Promise<{
            success: boolean;
            data?: unknown;
            error?: { message: string };
        }>,
        formData: FormData,
        successText: string,
        onSuccess?: (data: unknown) => void,
    ) {
        setDetailMessage("");
        startBusy(async () => {
            try {
                const result = await action(formData);
                setDetailMessage(
                    result.success
                        ? successText
                        : `Error: ${result.error?.message ?? "Unable to complete this action."}`,
                );
                if (result.success) {
                    onSuccess?.(result.data);
                    router.refresh();
                }
            } catch {
                setDetailMessage(
                    "Error: Request failed. Check your connection and try again.",
                );
            }
        });
    }

    function refreshTasks() {
        startBusy(async () => {
            try {
                const result = await listProjectTasksAction(project.id);
                if (result.success) setTasks(result.data);
            } catch {
                setDetailMessage("Error: Unable to refresh tasks.");
            }
        });
    }

    function refreshNotes() {
        startBusy(async () => {
            try {
                const result = await listProjectNotesAction(project.id);
                if (result.success) setNotes(result.data);
            } catch {
                setDetailMessage("Error: Unable to refresh notes.");
            }
        });
    }

    return (
        <div className="project-entry">
            <div className="project-row">
                <div className="project-title">
                    <span className={`project-dot ${status}`} />
                    <div>
                        <strong>{project.name}</strong>
                        <small>
                            Updated{" "}
                            {new Date(project.updatedAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                            })}
                        </small>
                    </div>
                </div>
                <span className={`status ${status}`}>{label(project.status)}</span>
                <span className="owner avatar" title={owner.name}>
                    {owner.name.slice(0, 2).toUpperCase()}
                </span>
                <div className="progress-wrap">
                    <div
                        className="progress"
                        role="progressbar"
                        aria-label={`${project.name} task completion`}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={project.taskProgress.percentage}
                    >
                        <span style={{ width: `${project.taskProgress.percentage}%` }} />
                    </div>
                    <small>{project.taskProgress.percentage}%</small>
                </div>
                <button
                    className="manage-project"
                    type="button"
                    aria-expanded={open}
                    onClick={toggleDetails}
                >
                    {open ? "Close" : "Manage"}
                </button>
            </div>
            {open && (
                <div className="project-management">
                    <ResultMessage message={detailMessage} />
                    {loading ? (
                        <p className="empty-state">Loading project details…</p>
                    ) : (
                        <>
                            <details>
                                <summary>Edit project</summary>
                                <form
                                    action={(formData) =>
                                        runMutation(
                                            updateProjectAction,
                                            formData,
                                            "Project updated.",
                                        )
                                    }
                                    className="workspace-form"
                                >
                                    <input type="hidden" name="projectId" value={project.id} />
                                    <label>
                                        Name
                                        <input
                                            name="name"
                                            defaultValue={project.name}
                                            required
                                            maxLength={120}
                                        />
                                    </label>
                                    <label>
                                        Description
                                        <textarea
                                            name="description"
                                            defaultValue={project.description ?? ""}
                                            maxLength={5000}
                                        />
                                    </label>
                                    <label>
                                        Status
                                        <select name="status" defaultValue={project.status}>
                                            {projectStatuses.map((item) => (
                                                <option key={item} value={item}>
                                                    {label(item)}
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                    <label>
                                        Assignee
                                        <select
                                            name="assignedToId"
                                            defaultValue={project.assignedTo?.id ?? ""}
                                        >
                                            <option value="">Unassigned</option>
                                            {users.map((user) => (
                                                <option key={user.id} value={user.id}>
                                                    {user.name}
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                    <button type="submit" disabled={pending}>
                                        {pending ? "Saving…" : "Save changes"}
                                    </button>
                                </form>
                            </details>
                            <details>
                                <summary>
                                    Tasks <span className="detail-count">{tasks.length}</span>
                                </summary>
                                <form
                                    action={(formData) =>
                                        mutateDetail(
                                            createTaskAction,
                                            formData,
                                            "Task created.",
                                            refreshTasks,
                                        )
                                    }
                                    className="workspace-form"
                                >
                                    <input type="hidden" name="projectId" value={project.id} />
                                    <label>
                                        New task
                                        <input
                                            name="title"
                                            required
                                            maxLength={160}
                                            placeholder="Task title"
                                        />
                                    </label>
                                    <label>
                                        Assignee
                                        <select name="assignedToId" defaultValue="">
                                            <option value="">Unassigned</option>
                                            {users.map((user) => (
                                                <option key={user.id} value={user.id}>
                                                    {user.name}
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                    <label>
                                        Due date
                                        <input name="dueDate" type="date" />
                                    </label>
                                    <button type="submit" disabled={busy}>
                                        {busy ? "Adding…" : "Add task"}
                                    </button>
                                </form>
                                {tasks.length === 0 ? (
                                    <p className="empty-state">No tasks in this project yet.</p>
                                ) : (
                                    tasks.map((task) => (
                                        <form
                                            key={task.id}
                                            action={(formData) =>
                                                mutateDetail(
                                                    updateTaskAction,
                                                    formData,
                                                    "Task updated.",
                                                    refreshTasks,
                                                )
                                            }
                                            className="managed-item"
                                        >
                                            <input type="hidden" name="taskId" value={task.id} />
                                            <input
                                                aria-label="Task title"
                                                name="title"
                                                defaultValue={task.title}
                                                required
                                                maxLength={160}
                                            />
                                            <input
                                                aria-label="Task due date"
                                                type="date"
                                                name="dueDate"
                                                defaultValue={task.dueDate?.slice(0, 10) ?? ""}
                                            />
                                            <select
                                                aria-label="Task status"
                                                name="status"
                                                defaultValue={task.status}
                                            >
                                                {taskStatuses.map((item) => (
                                                    <option key={item} value={item}>
                                                        {label(item)}
                                                    </option>
                                                ))}
                                            </select>
                                            <select
                                                aria-label="Task assignee"
                                                name="assignedToId"
                                                defaultValue={task.assignedTo?.id ?? ""}
                                            >
                                                <option value="">Unassigned</option>
                                                {users.map((user) => (
                                                    <option key={user.id} value={user.id}>
                                                        {user.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <button type="submit" disabled={busy}>
                                                Save
                                            </button>
                                            <button
                                                type="button"
                                                className="danger-button"
                                                disabled={busy}
                                                onClick={() => {
                                                    if (!window.confirm(`Delete “${task.title}”?`))
                                                        return;
                                                    const formData = new FormData();
                                                    formData.set("taskId", task.id);
                                                    mutateDetail(
                                                        deleteTaskAction,
                                                        formData,
                                                        "Task deleted.",
                                                        refreshTasks,
                                                    );
                                                }}
                                            >
                                                Delete
                                            </button>
                                        </form>
                                    ))
                                )}
                            </details>
                            <details>
                                <summary>
                                    Notes <span className="detail-count">{notes.length}</span>
                                </summary>
                                <form
                                    action={(formData) =>
                                        mutateDetail(
                                            createNoteAction,
                                            formData,
                                            "Note added.",
                                            refreshNotes,
                                        )
                                    }
                                    className="workspace-form"
                                >
                                    <input type="hidden" name="projectId" value={project.id} />
                                    <label>
                                        New note
                                        <textarea name="content" required maxLength={10000} />
                                    </label>
                                    <button type="submit" disabled={busy}>
                                        {busy ? "Adding…" : "Add note"}
                                    </button>
                                </form>
                                {notes.length === 0 ? (
                                    <p className="empty-state">No notes in this project yet.</p>
                                ) : (
                                    notes.map((note) => (
                                        <div className="managed-note" key={note.id}>
                                            <form
                                                action={(formData) =>
                                                    mutateDetail(
                                                        updateNoteAction,
                                                        formData,
                                                        "Note updated.",
                                                        refreshNotes,
                                                    )
                                                }
                                                className="workspace-form"
                                            >
                                                <input type="hidden" name="noteId" value={note.id} />
                                                <label>
                                                    <span>
                                                        {note.createdBy.name} ·{" "}
                                                        {new Date(note.updatedAt).toLocaleString()}
                                                    </span>
                                                    <textarea
                                                        name="content"
                                                        defaultValue={note.content}
                                                        required
                                                        maxLength={10000}
                                                    />
                                                </label>
                                                <button type="submit" disabled={busy}>
                                                    Save note
                                                </button>
                                                <button
                                                    type="button"
                                                    className="danger-button"
                                                    disabled={busy}
                                                    onClick={() => {
                                                        if (!window.confirm("Delete this note?")) return;
                                                        const formData = new FormData();
                                                        formData.set("noteId", note.id);
                                                        mutateDetail(
                                                            deleteNoteAction,
                                                            formData,
                                                            "Note deleted.",
                                                            refreshNotes,
                                                        );
                                                    }}
                                                >
                                                    Delete note
                                                </button>
                                            </form>
                                        </div>
                                    ))
                                )}
                            </details>
                            <button
                                type="button"
                                className="danger-button project-delete"
                                disabled={busy}
                                onClick={() => {
                                    if (
                                        !window.confirm(
                                            `Delete “${project.name}” and its tasks and notes?`,
                                        )
                                    )
                                        return;
                                    const formData = new FormData();
                                    formData.set("projectId", project.id);
                                    mutateDetail(
                                        deleteProjectAction,
                                        formData,
                                        "Project deleted.",
                                        () => router.refresh(),
                                    );
                                }}
                            >
                                Delete project
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

export function TaskStatusControl({
    task,
    users,
}: {
    task: DashboardDTO["myTasks"][number];
    users: UserSummary[];
}) {
    const [pending, startTransition] = useTransition();
    const [message, setMessage] = useState("");
    const router = useRouter();
    return (
        <form
            className="task-row task-interactive"
            action={(formData) => {
                setMessage("");
                startTransition(async () => {
                    const result = await updateTaskAction(formData);
                    setMessage(result.success ? "Saved" : result.error.message);
                    if (result.success) router.refresh();
                });
            }}
        >
            <input type="hidden" name="taskId" value={task.id} />
            <span className="task-title-text">{task.title}</span>
            <span className="task-project">{task.projectName}</span>
            <select
                aria-label={`${task.title} status`}
                name="status"
                defaultValue={task.status}
            >
                {taskStatuses.map((status) => (
                    <option key={status} value={status}>
                        {label(status)}
                    </option>
                ))}
            </select>
            <select
                aria-label={`${task.title} assignee`}
                name="assignedToId"
                defaultValue={task.assignedTo?.id ?? ""}
            >
                <option value="">Unassigned</option>
                {users.map((user) => (
                    <option key={user.id} value={user.id}>
                        {user.name}
                    </option>
                ))}
            </select>
            <input
                aria-label={`${task.title} due date`}
                type="date"
                name="dueDate"
                defaultValue={task.dueDate?.slice(0, 10) ?? ""}
            />
            <button type="submit" disabled={pending}>
                {pending ? "Saving…" : "Save"}
            </button>
            {message && (
                <output
                    className={
                        message.startsWith("Error:")
                            ? "workspace-error"
                            : "workspace-success"
                    }
                    aria-live="polite"
                >
                    {message}
                </output>
            )}
        </form>
    );
}
