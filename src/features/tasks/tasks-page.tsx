"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { KNOWN_STREAMS } from "@/lib/known-streams";
import {
  fetchTasks,
  createTask as dbCreateTask,
  toggleTaskDone,
  type DbTask,
} from "@/lib/supabase/db";

/* ── Types ── */

type Priority = "low" | "medium" | "high";

const priorityColors: Record<Priority, string> = {
  high: "#DC2626",
  medium: "#F59E0B",
  low: "#6B7280",
};

const priorityLabels: Record<Priority, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

function fmtDate(d: string): string {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/* ── Date grouping ── */

interface DateGroup {
  key: string;
  label: string;
  color?: string;
  tasks: DbTask[];
}

function groupByDueDate(tasks: DbTask[]): DateGroup[] {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrowStart = new Date(todayStart); tomorrowStart.setDate(todayStart.getDate() + 1);
  const weekEnd = new Date(todayStart); weekEnd.setDate(todayStart.getDate() + 7);

  const overdue: DbTask[] = [];
  const todayTasks: DbTask[] = [];
  const thisWeek: DbTask[] = [];
  const later: DbTask[] = [];
  const noDate: DbTask[] = [];

  for (const t of tasks) {
    if (!t.due_date) { noDate.push(t); continue; }
    const d = new Date(t.due_date);
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

function getStreamName(streamId: string | null): string {
  if (!streamId) return "Inbox";
  return KNOWN_STREAMS.find((s) => s.id === streamId)?.name ?? "Stream";
}

/* ── New task modal ── */

function NewTaskModal({ open, onClose, onCreate }: {
  open: boolean;
  onClose: () => void;
  onCreate: (input: { title: string; dueDate: string | null; priority: Priority; streamId: string | null }) => void;
}) {
  const [name, setName] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [streamId, setStreamId] = useState<string>("");

  if (!open) return null;

  function handleCreate() {
    if (!name.trim()) return;
    onCreate({
      title: name.trim(),
      dueDate: dueDate || null,
      priority,
      streamId: streamId || null,
    });
    setName("");
    setDueDate("");
    setPriority("medium");
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

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface-variant">Due date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-surface-container rounded-lg px-4 py-2.5 text-sm text-on-surface outline-none focus:ring-2 focus:ring-tertiary/30"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface-variant">Priority</label>
            <div className="flex gap-2">
              {(["high", "medium", "low"] as const).map((p) => (
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

/* ── Main component ── */

export function TasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<DbTask[]>([]);
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [showDone, setShowDone] = useState(false);

  useEffect(() => {
    fetchTasks().then(setTasks);
  }, []);

  const activeTasks = tasks.filter((t) => !t.done);
  const doneTasks = tasks.filter((t) => t.done);
  const groups = groupByDueDate(activeTasks);

  async function handleToggle(taskId: string) {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    const newDone = !task.done;
    // Optimistic update
    setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, done: newDone } : t));
    try {
      await toggleTaskDone(taskId, newDone);
    } catch (err) {
      console.error("Failed to toggle task:", err);
      // Revert
      setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, done: !newDone } : t));
    }
  }

  async function handleCreate(input: { title: string; dueDate: string | null; priority: Priority; streamId: string | null }) {
    try {
      const task = await dbCreateTask({
        title: input.title,
        dueDate: input.dueDate,
        priority: input.priority,
        streamId: input.streamId,
        pageId: null,
      });
      setTasks((prev) => [task, ...prev]);
    } catch (err) {
      console.error("Failed to create task:", err);
    }
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
          className="text-on-surface-variant text-sm font-semibold hover:text-on-surface transition-colors flex items-center gap-1.5 px-4 py-2 rounded-lg hover:bg-surface-variant"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          New task
        </button>
      </div>

      {/* Task groups */}
      {activeTasks.length === 0 && (
        <div className="text-center py-16">
          <span className="material-symbols-outlined text-[48px] text-on-surface-variant/20">check_circle</span>
          <p className="text-on-surface-variant/50 text-sm mt-3">No active tasks</p>
        </div>
      )}

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
                      onClick={(e) => { e.stopPropagation(); handleToggle(task.id); }}
                      className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 border-outline-variant hover:border-tertiary"
                    />
                    <span className="text-sm font-medium text-on-surface truncate">{task.title}</span>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className="text-[10px] font-medium text-on-surface-variant/50">{getStreamName(task.stream_id)}</span>
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: priorityColors[task.priority] }} title={task.priority} />
                    <span className="text-[10px] font-bold text-on-surface-variant whitespace-nowrap w-16 text-right">
                      {task.due_date ? fmtDate(task.due_date) : "No date"}
                    </span>
                    {task.stream_id && (
                      <button
                        onClick={(e) => { e.stopPropagation(); router.push(`/s/${task.stream_id}`); }}
                        className="opacity-0 group-hover:opacity-100 text-tertiary text-[10px] font-medium flex items-center gap-0.5 transition-opacity"
                      >
                        <span className="material-symbols-outlined text-[12px]">arrow_forward</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Done section */}
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
                      onClick={() => handleToggle(task.id)}
                      className="w-5 h-5 rounded-full border-2 border-tertiary text-tertiary flex items-center justify-center shrink-0"
                    >
                      <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                    </button>
                    <span className="text-sm font-medium text-on-surface/40 line-through truncate">{task.title}</span>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className="text-[10px] text-on-surface-variant/30">{getStreamName(task.stream_id)}</span>
                    <span className="text-[10px] text-on-surface-variant/30 w-16 text-right">{task.due_date ? fmtDate(task.due_date) : "No date"}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Modal */}
      <NewTaskModal
        open={newTaskOpen}
        onClose={() => setNewTaskOpen(false)}
        onCreate={handleCreate}
      />
    </div>
  );
}
