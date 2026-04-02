"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { KNOWN_STREAMS } from "@/lib/known-streams";
import { ExpandedCaptureModal } from "@/features/editor/expanded-capture-modal";

/* ── Types ── */

interface GlobalTask {
  id: string;
  title: string;
  dueDate: string | null;
  dueDateObj: Date | null;
  priority: "urgent" | "high" | "normal" | "low";
  status: "todo" | "in_progress" | "done";
  streamId: string | null;
  streamName: string;
}

const priorityColors: Record<GlobalTask["priority"], string> = {
  urgent: "#DC2626",
  high: "#F59E0B",
  normal: "#0D9488",
  low: "#6B7280",
};

const priorityLabels: Record<GlobalTask["priority"], string> = {
  urgent: "Urgent",
  high: "High",
  normal: "Normal",
  low: "Low",
};

/* ── Mock data ── */

const today = new Date();
const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
const twoDaysAgo = new Date(today); twoDaysAgo.setDate(today.getDate() - 2);
const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
const inThreeDays = new Date(today); inThreeDays.setDate(today.getDate() + 3);
const nextWeek = new Date(today); nextWeek.setDate(today.getDate() + 10);

function fmtDate(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const initialTasks: GlobalTask[] = [
  { id: "gt1", title: "Refactor auth hooks", dueDate: fmtDate(yesterday), dueDateObj: yesterday, priority: "high", status: "in_progress", streamId: "webdev", streamName: "Web Development" },
  { id: "gt2", title: "Update README docs", dueDate: fmtDate(twoDaysAgo), dueDateObj: twoDaysAgo, priority: "normal", status: "todo", streamId: "webdev", streamName: "Web Development" },
  { id: "gt3", title: "CI/CD Pipeline Fix", dueDate: null, dueDateObj: null, priority: "urgent", status: "todo", streamId: "webdev", streamName: "Web Development" },
  { id: "gt4", title: "Mood board for landing page", dueDate: fmtDate(today), dueDateObj: today, priority: "normal", status: "todo", streamId: "design", streamName: "Design Projects" },
  { id: "gt5", title: "Review component library", dueDate: fmtDate(today), dueDateObj: today, priority: "high", status: "in_progress", streamId: "design", streamName: "Design Projects" },
  { id: "gt6", title: "Write blog post outline", dueDate: fmtDate(tomorrow), dueDateObj: tomorrow, priority: "normal", status: "todo", streamId: "growth", streamName: "Personal Growth" },
  { id: "gt7", title: "Schedule team retro", dueDate: fmtDate(inThreeDays), dueDateObj: inThreeDays, priority: "low", status: "todo", streamId: null, streamName: "Inbox" },
  { id: "gt8", title: "Plan Q2 goals", dueDate: fmtDate(nextWeek), dueDateObj: nextWeek, priority: "normal", status: "todo", streamId: "growth", streamName: "Personal Growth" },
  { id: "gt9", title: "Initial Project Setup", dueDate: fmtDate(twoDaysAgo), dueDateObj: twoDaysAgo, priority: "normal", status: "done", streamId: "webdev", streamName: "Web Development" },
];

/* ── Date grouping ── */

interface DateGroup {
  key: string;
  label: string;
  color?: string;
  tasks: GlobalTask[];
}

function groupByDueDate(tasks: GlobalTask[]): DateGroup[] {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrowStart = new Date(todayStart); tomorrowStart.setDate(todayStart.getDate() + 1);
  const weekEnd = new Date(todayStart); weekEnd.setDate(todayStart.getDate() + 7);

  const overdue: GlobalTask[] = [];
  const todayTasks: GlobalTask[] = [];
  const thisWeek: GlobalTask[] = [];
  const later: GlobalTask[] = [];
  const noDate: GlobalTask[] = [];

  for (const t of tasks) {
    if (!t.dueDateObj) { noDate.push(t); continue; }
    const d = new Date(t.dueDateObj.getFullYear(), t.dueDateObj.getMonth(), t.dueDateObj.getDate());
    if (d < todayStart) overdue.push(t);
    else if (d < tomorrowStart) todayTasks.push(t);
    else if (d < weekEnd) thisWeek.push(t);
    else later.push(t);
  }

  const groups: DateGroup[] = [];
  if (overdue.length) groups.push({ key: "overdue", label: "Overdue", color: "#DC2626", tasks: overdue });
  if (todayTasks.length) groups.push({ key: "today", label: "Today", tasks: todayTasks });
  if (thisWeek.length) groups.push({ key: "week", label: "This week", tasks: thisWeek });
  if (later.length) groups.push({ key: "later", label: "Later", tasks: later });
  if (noDate.length) groups.push({ key: "nodate", label: "No date", tasks: noDate });
  return groups;
}

/* ── New task modal ── */

function NewTaskModal({ open, onClose, onCreate }: {
  open: boolean;
  onClose: () => void;
  onCreate: (task: GlobalTask) => void;
}) {
  const [name, setName] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<GlobalTask["priority"]>("normal");
  const [streamId, setStreamId] = useState<string>("");

  if (!open) return null;

  function handleCreate() {
    if (!name.trim()) return;
    const dueDateObj = dueDate ? new Date(dueDate) : null;
    const stream = KNOWN_STREAMS.find((s) => s.id === streamId);
    onCreate({
      id: crypto.randomUUID(),
      title: name.trim(),
      dueDate: dueDateObj ? fmtDate(dueDateObj) : null,
      dueDateObj,
      priority,
      status: "todo",
      streamId: streamId || null,
      streamName: stream?.name ?? "Inbox",
    });
    setName("");
    setDueDate("");
    setPriority("normal");
    setStreamId("");
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-8">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <h2 className="text-lg font-bold text-on-surface">New Task</h2>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface p-1.5 rounded-lg hover:bg-surface-variant transition-colors">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
        <div className="px-6 pb-6 space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface-variant">Task name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="What needs to be done?"
              autoFocus
              className="w-full bg-surface-container rounded-lg px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:ring-2 focus:ring-tertiary/30"
              onKeyDown={(e) => { if (e.key === "Enter" && name.trim()) handleCreate(); }}
            />
          </div>

          {/* Due date */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface-variant">Due date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-surface-container rounded-lg px-4 py-2.5 text-sm text-on-surface outline-none focus:ring-2 focus:ring-tertiary/30"
            />
          </div>

          {/* Priority */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface-variant">Priority</label>
            <div className="flex gap-2">
              {(["urgent", "high", "normal", "low"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border",
                    priority === p
                      ? "border-current bg-surface-container-highest"
                      : "border-transparent hover:bg-surface-variant"
                  )}
                  style={priority === p ? { color: priorityColors[p] } : undefined}
                >
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: priorityColors[p] }} />
                  {priorityLabels[p]}
                </button>
              ))}
            </div>
          </div>

          {/* Stream selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface-variant">Stream</label>
            <select
              value={streamId}
              onChange={(e) => setStreamId(e.target.value)}
              className="w-full bg-surface-container rounded-lg px-4 py-2.5 text-sm text-on-surface outline-none focus:ring-2 focus:ring-tertiary/30"
            >
              <option value="">Inbox (no stream)</option>
              {KNOWN_STREAMS.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={onClose} className="text-on-surface-variant text-sm px-4 py-2 hover:bg-surface-variant rounded-lg transition-colors">
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={!name.trim()}
              className="bg-inverse-surface text-inverse-on-surface text-sm font-semibold px-5 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-30"
            >
              Create Task
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Task detail modal ── */

function TaskDetailModal({ task, open, onClose, onUpdate }: {
  task: GlobalTask | null;
  open: boolean;
  onClose: () => void;
  onUpdate: (task: GlobalTask) => void;
}) {
  const [title, setTitle] = useState(task?.title ?? "");
  const [priority, setPriority] = useState<GlobalTask["priority"]>(task?.priority ?? "normal");

  if (!open || !task) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-8">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <h2 className="text-lg font-bold text-on-surface">Task Details</h2>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface p-1.5 rounded-lg hover:bg-surface-variant transition-colors">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
        <div className="px-6 pb-6 space-y-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-surface-container rounded-lg px-4 py-2.5 text-sm text-on-surface outline-none focus:ring-2 focus:ring-tertiary/30 font-semibold"
          />

          <div className="flex items-center gap-4 text-sm text-on-surface-variant">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">calendar_today</span>
              {task.dueDate ?? "No date"}
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: priorityColors[task.priority] }} />
              {priorityLabels[task.priority]}
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-on-surface-variant">
            <span className="material-symbols-outlined text-[16px]">folder</span>
            {task.streamName}
            {task.streamId && (
              <a
                href={`/s/${task.streamId}`}
                className="text-tertiary text-xs font-medium hover:underline ml-auto flex items-center gap-1"
              >
                Go to location
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </a>
            )}
          </div>

          {/* Priority selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface-variant">Priority</label>
            <div className="flex gap-2">
              {(["urgent", "high", "normal", "low"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border",
                    priority === p
                      ? "border-current bg-surface-container-highest"
                      : "border-transparent hover:bg-surface-variant"
                  )}
                  style={priority === p ? { color: priorityColors[p] } : undefined}
                >
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: priorityColors[p] }} />
                  {priorityLabels[p]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button onClick={onClose} className="text-on-surface-variant text-sm px-4 py-2 hover:bg-surface-variant rounded-lg transition-colors">
              Cancel
            </button>
            <button
              onClick={() => { onUpdate({ ...task, title, priority }); onClose(); }}
              className="bg-inverse-surface text-inverse-on-surface text-sm font-semibold px-5 py-2 rounded-lg hover:opacity-90 transition-opacity"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main component ── */

export function TasksPage() {
  const [tasks, setTasks] = useState<GlobalTask[]>(initialTasks);
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [detailTask, setDetailTask] = useState<GlobalTask | null>(null);
  const [showDone, setShowDone] = useState(false);

  const activeTasks = tasks.filter((t) => t.status !== "done");
  const doneTasks = tasks.filter((t) => t.status === "done");
  const groups = groupByDueDate(activeTasks);

  function toggleTask(taskId: string) {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        return { ...t, status: t.status === "done" ? "todo" as const : "done" as const };
      })
    );
  }

  function updateTask(updated: GlobalTask) {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-on-surface">Tasks</h1>
          <span className="bg-surface-container text-on-surface-variant text-xs font-bold px-2.5 py-1 rounded-full">
            {activeTasks.length}
          </span>
        </div>
        <button
          onClick={() => setNewTaskOpen(true)}
          className="bg-inverse-surface text-inverse-on-surface text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          New task
        </button>
      </div>

      {/* Task groups */}
      <div className="space-y-6">
        {groups.map((group) => (
          <section key={group.key} className="space-y-2">
            <div className="flex items-center gap-3">
              <span
                className="text-[10px] font-bold tracking-widest uppercase"
                style={group.color ? { color: group.color } : undefined}
              >
                {group.label}
              </span>
              <span className="text-[10px] text-on-surface-variant/40 font-semibold">{group.tasks.length}</span>
              <div className="h-[1px] flex-grow bg-outline-variant opacity-10" />
            </div>

            <div className="space-y-1">
              {group.tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between px-4 py-3 rounded-lg bg-surface-container-lowest hover:bg-surface-variant/30 transition-colors group"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <button
                      onClick={() => toggleTask(task.id)}
                      className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors shrink-0",
                        "border-outline-variant hover:border-tertiary"
                      )}
                    >
                      {task.status === "done" && (
                        <span className="material-symbols-outlined text-[14px] text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                      )}
                    </button>
                    <button
                      onClick={() => setDetailTask(task)}
                      className="text-sm font-medium text-on-surface truncate text-left hover:underline"
                    >
                      {task.title}
                    </button>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className="text-[10px] font-medium text-on-surface-variant/50">{task.streamName}</span>
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: priorityColors[task.priority] }} title={task.priority} />
                    <span className="text-[10px] font-bold text-on-surface-variant whitespace-nowrap w-16 text-right">
                      {task.dueDate ?? "No date"}
                    </span>
                    {task.streamId && (
                      <a
                        href={`/s/${task.streamId}`}
                        className="opacity-0 group-hover:opacity-100 text-tertiary text-[10px] font-medium flex items-center gap-0.5 transition-opacity"
                      >
                        <span className="material-symbols-outlined text-[12px]">arrow_forward</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Done section — collapsed */}
      {doneTasks.length > 0 && (
        <section className="space-y-2">
          <button
            onClick={() => setShowDone(!showDone)}
            className="flex items-center gap-2 text-on-surface-variant/50 hover:text-on-surface-variant transition-colors"
          >
            <span className={cn("material-symbols-outlined text-[16px] transition-transform", showDone && "rotate-90")}>
              chevron_right
            </span>
            <span className="text-[10px] font-bold tracking-widest uppercase">Done</span>
            <span className="text-[10px] font-semibold">{doneTasks.length}</span>
          </button>

          {showDone && (
            <div className="space-y-1">
              {doneTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between px-4 py-3 rounded-lg bg-surface-container-lowest/50"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <button
                      onClick={() => toggleTask(task.id)}
                      className="w-5 h-5 rounded-full border-2 border-tertiary text-tertiary flex items-center justify-center shrink-0"
                    >
                      <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                    </button>
                    <span className="text-sm font-medium text-on-surface/40 line-through truncate">{task.title}</span>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className="text-[10px] text-on-surface-variant/30">{task.streamName}</span>
                    <span className="text-[10px] text-on-surface-variant/30 w-16 text-right">{task.dueDate ?? "No date"}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Modals */}
      <NewTaskModal
        open={newTaskOpen}
        onClose={() => setNewTaskOpen(false)}
        onCreate={(task) => setTasks((prev) => [...prev, task])}
      />
      <TaskDetailModal
        task={detailTask}
        open={detailTask !== null}
        onClose={() => setDetailTask(null)}
        onUpdate={updateTask}
      />
    </div>
  );
}
