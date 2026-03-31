"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { findStreamById } from "@/lib/known-streams";
import { ExpandedCaptureModal } from "@/features/editor/expanded-capture-modal";

/* ── Types ── */

interface Task {
  id: string;
  title: string;
  dueDate: string;
  priority: "urgent" | "high" | "normal" | "low";
  status: "todo" | "in_progress" | "done";
}

interface Note {
  id: string;
  title: string;
  content: string;
  timeAgo: string;
}

const priorityColors: Record<Task["priority"], string> = {
  urgent: "#DC2626",
  high: "#F59E0B",
  normal: "#0D9488",
  low: "#6B7280",
};

/* ── Mock data (Web Development stream) ── */

const initialTasks: Task[] = [
  { id: "t1", title: "Refactor auth hooks", dueDate: "Oct 14", priority: "high", status: "in_progress" },
  { id: "t2", title: "Update README docs", dueDate: "Oct 20", priority: "normal", status: "in_progress" },
  { id: "t3", title: "CI/CD Pipeline Fix", dueDate: "No date", priority: "urgent", status: "todo" },
  { id: "t4", title: "Initial Project Setup", dueDate: "Oct 1", priority: "normal", status: "done" },
];

const mockNotes: Note[] = [
  {
    id: "n1",
    title: "Tailwind Config Architecture",
    content:
      "We should move the extended color palette to a separate theme.js file to keep the main config clean. This will help with the upcoming multi-tenant branding requirements.\n\nSuggested folder structure:\n• src/styles/tokens.js\n• src/styles/gradients.js",
    timeAgo: "Just now",
  },
  {
    id: "n2",
    title: "React 19 Server Components Research",
    content:
      "Testing the new 'use cache' directive. The performance gains for the dashboard rendering are significant (approx 40% reduction in TTI).",
    timeAgo: "2 hours ago",
  },
  {
    id: "n3",
    title: "Accessibility Audit Notes",
    content:
      "Need to ensure all Material Symbols have proper aria-label tags. Some of our custom glassmorphism components have contrast ratios below 4.5:1 on dark mode.",
    timeAgo: "Yesterday",
  },
];

/* ── Status group helpers ── */

const statusGroups = [
  { key: "in_progress" as const, label: "In Progress" },
  { key: "todo" as const, label: "Todo" },
  { key: "done" as const, label: "Done" },
];

/* ── Component ── */

interface StreamViewProps {
  streamId: string;
}

export function StreamView({ streamId }: StreamViewProps) {
  const stream = findStreamById(streamId);
  const streamName = stream?.name ?? "Untitled Stream";
  const streamColor = stream?.color ?? "#6B7280";
  const streamHashtag = stream?.hashtag ?? streamId;

  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [showNewTask, setShowNewTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [showAiTooltip, setShowAiTooltip] = useState(false);
  const [expandedForNew, setExpandedForNew] = useState(false);

  const handleAiClick = useCallback(() => {
    setShowAiTooltip(true);
    setTimeout(() => setShowAiTooltip(false), 2000);
  }, []);

  function toggleTask(taskId: string) {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        if (t.status === "done") return { ...t, status: "todo" as const };
        return { ...t, status: "done" as const };
      })
    );
  }

  function addTask() {
    if (!newTaskTitle.trim()) return;
    const newTask: Task = {
      id: crypto.randomUUID(),
      title: newTaskTitle.trim(),
      dueDate: "No date",
      priority: "normal",
      status: "todo",
    };
    setTasks((prev) => [...prev, newTask]);
    setNewTaskTitle("");
    setShowNewTask(false);
  }

  const notesThisWeek = mockNotes.length;

  return (
    <div className="space-y-10">
      {/* ── Stream header ── */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div
              className="w-4 h-4 rounded-sm shrink-0"
              style={{ backgroundColor: streamColor }}
            />
            <h1 className="text-2xl font-bold tracking-tight text-on-surface">
              {streamName}
            </h1>

            {/* Presence avatars */}
            <div className="flex -space-x-2 ml-2">
              {["A", "B", "C"].map((letter) => (
                <div
                  key={letter}
                  className="w-7 h-7 rounded-full border-2 border-surface bg-surface-container-highest flex items-center justify-center text-[9px] font-bold text-on-surface-variant"
                >
                  {letter}
                </div>
              ))}
            </div>
          </div>
          <span className="text-on-surface-variant text-sm font-medium">
            #{streamHashtag}
          </span>
        </div>

        {/* Right-side action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Summarise with AI */}
          <div className="relative">
            <button
              onClick={handleAiClick}
              className="text-on-surface-variant text-xs font-semibold hover:text-on-surface transition-colors flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-surface-variant"
            >
              <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
              Summarise with AI
            </button>
            {showAiTooltip && (
              <div className="absolute right-0 top-full mt-1 whitespace-nowrap bg-inverse-surface text-inverse-on-surface text-xs font-medium px-3 py-1.5 rounded-lg shadow-lg animate-in fade-in duration-150 z-10">
                AI features coming soon
              </div>
            )}
          </div>

          {/* + Add task */}
          <button
            onClick={() => setShowNewTask(!showNewTask)}
            className="text-on-surface-variant text-xs font-semibold hover:text-on-surface transition-colors flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-surface-variant"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            Add task
          </button>

          {/* + Add note */}
          <button
            onClick={() => setExpandedForNew(true)}
            className="text-on-surface-variant text-xs font-semibold hover:text-on-surface transition-colors flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-surface-variant"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            Add note
          </button>
        </div>
      </div>

      {/* ── Tasks section ── */}
      <section className="space-y-6">
        <h2 className="text-lg font-bold tracking-tight text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-on-surface-variant">checklist</span>
          Tasks
        </h2>

        {statusGroups.map((group) => {
          const groupTasks = tasks.filter((t) => t.status === group.key);
          if (groupTasks.length === 0) return null;

          return (
            <div key={group.key} className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold tracking-widest uppercase text-on-surface-variant">
                  {group.label}
                </span>
                <div className="h-[1px] flex-grow bg-outline-variant opacity-10" />
              </div>

              <div className="space-y-1.5">
                {groupTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between px-4 py-3 rounded-lg bg-surface-container-lowest"
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleTask(task.id)}
                        className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors shrink-0",
                          task.status === "done"
                            ? "border-tertiary text-tertiary"
                            : "border-outline-variant hover:border-tertiary"
                        )}
                      >
                        {task.status === "done" && (
                          <span
                            className="material-symbols-outlined text-[14px]"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            check
                          </span>
                        )}
                      </button>
                      <span
                        className={cn(
                          "text-sm font-medium text-on-surface transition-all",
                          task.status === "done" && "line-through opacity-50"
                        )}
                      >
                        {task.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: priorityColors[task.priority] }}
                        title={task.priority}
                      />
                      <span className="text-[10px] font-bold text-on-surface-variant whitespace-nowrap">
                        {task.dueDate}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Inline add task */}
        {showNewTask ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              addTask();
            }}
            className="flex items-center gap-3 px-4 py-3 bg-surface-container-lowest rounded-lg"
          >
            <div className="w-5 h-5 rounded-full border-2 border-outline-variant shrink-0" />
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Task name..."
              autoFocus
              className="flex-1 bg-transparent text-on-surface text-sm font-medium outline-none placeholder:text-on-surface-variant/40"
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setShowNewTask(false);
                  setNewTaskTitle("");
                }
              }}
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowNewTask(false);
                  setNewTaskTitle("");
                }}
                className="text-on-surface-variant text-xs px-2.5 py-1 hover:bg-surface-variant rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!newTaskTitle.trim()}
                className="text-tertiary text-xs font-semibold px-2.5 py-1 hover:bg-surface-variant rounded-md transition-colors disabled:opacity-30"
              >
                Add
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setShowNewTask(true)}
            className="text-on-surface-variant/50 text-xs font-medium hover:text-on-surface-variant transition-colors flex items-center gap-1.5 px-4 py-2"
          >
            <span className="material-symbols-outlined text-[14px]">add</span>
            Add task
          </button>
        )}
      </section>

      {/* ── Notes section ── */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold tracking-tight text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-on-surface-variant">description</span>
            Notes
          </h2>
          <span className="text-on-surface-variant text-xs font-medium">
            {notesThisWeek} notes this week
          </span>
        </div>

        <div className="space-y-4">
          {mockNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onClick={() => setEditingNote(note)}
            />
          ))}
        </div>

        {/* Bottom inline add note */}
        <button
          onClick={() => setExpandedForNew(true)}
          className="w-full flex items-center gap-3 px-5 py-4 rounded-xl bg-surface-container-lowest/60 hover:bg-surface-container-lowest transition-colors text-on-surface-variant/40 hover:text-on-surface-variant cursor-text group"
        >
          <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            edit_square
          </span>
          <span className="text-sm font-medium">Add a note to this stream...</span>
        </button>
      </section>

      {/* Tier 2 modal — editing existing note */}
      <ExpandedCaptureModal
        open={editingNote !== null}
        onClose={() => setEditingNote(null)}
        initialTitle={editingNote?.title ?? ""}
        initialContent={editingNote?.content ?? ""}
      />

      {/* Tier 2 modal — new note */}
      <ExpandedCaptureModal
        open={expandedForNew}
        onClose={() => setExpandedForNew(false)}
        initialTitle=""
        initialContent=""
      />
    </div>
  );
}

/* ── Note card sub-component ── */

function NoteCard({ note, onClick }: { note: Note; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="bg-surface-container-lowest rounded-xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer relative group"
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-[10px] font-semibold text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-md">
          {note.timeAgo}
        </span>
      </div>
      <h3 className="font-bold text-on-surface text-sm mb-1.5">{note.title}</h3>
      <p className="text-on-surface-variant text-xs leading-relaxed line-clamp-3 whitespace-pre-line">
        {note.content}
      </p>

      {/* Convert to task icon on hover */}
      {hovered && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            // Stub: will convert note to task later
          }}
          className="absolute top-4 right-4 text-on-surface-variant/50 hover:text-on-surface transition-colors p-1 rounded-md hover:bg-surface-variant"
          title="Convert to task"
        >
          <span className="material-symbols-outlined text-[16px]">task_alt</span>
        </button>
      )}
    </div>
  );
}
