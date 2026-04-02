"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import { findStreamById } from "@/lib/known-streams";
import { ExpandedCaptureModal } from "@/features/editor/expanded-capture-modal";

const StreamEditor = dynamic(
  () => import("@/features/stream-view/stream-editor").then((m) => ({ default: m.StreamEditor })),
  { ssr: false }
);

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

interface SubPage {
  id: string;
  name: string;
  children: SubPage[];
}

const priorityColors: Record<Task["priority"], string> = {
  urgent: "#DC2626",
  high: "#F59E0B",
  normal: "#0D9488",
  low: "#6B7280",
};

/* ── Mock data ── */

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
    content: "We should move the extended color palette to a separate theme.js file to keep the main config clean.",
    timeAgo: "Just now",
  },
  {
    id: "n2",
    title: "React 19 Server Components Research",
    content: "Testing the new 'use cache' directive. The performance gains for the dashboard rendering are significant.",
    timeAgo: "2 hours ago",
  },
  {
    id: "n3",
    title: "Accessibility Audit Notes",
    content: "Need to ensure all Material Symbols have proper aria-label tags.",
    timeAgo: "Yesterday",
  },
];

const statusGroups = [
  { key: "in_progress" as const, label: "In Progress" },
  { key: "todo" as const, label: "Todo" },
  { key: "done" as const, label: "Done" },
];

/* ── Cover picker modal ── */

const coverGradients = [
  "linear-gradient(135deg, {c}22 0%, {c}08 100%)",
  "linear-gradient(135deg, {c}30 0%, {c}10 50%, transparent 100%)",
  "linear-gradient(to right, {c}20, {c}08)",
  "linear-gradient(180deg, {c}18 0%, transparent 100%)",
];

function CoverPicker({ open, onClose, streamColor, onSelect }: {
  open: boolean;
  onClose: () => void;
  streamColor: string;
  onSelect: (gradient: string) => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-8">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
        <h3 className="text-lg font-bold text-on-surface">Change cover</h3>
        <div className="grid grid-cols-2 gap-3">
          {coverGradients.map((tpl, i) => {
            const bg = tpl.replace(/\{c\}/g, streamColor);
            return (
              <button
                key={i}
                onClick={() => { onSelect(bg); onClose(); }}
                className="h-20 rounded-xl border border-outline-variant/20 hover:ring-2 hover:ring-tertiary/30 transition-all"
                style={{ background: bg }}
              />
            );
          })}
        </div>
        <button onClick={onClose} className="text-on-surface-variant text-sm hover:text-on-surface transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
}

/* ── Component ── */

interface StreamViewProps {
  streamId: string;
}

export function StreamView({ streamId }: StreamViewProps) {
  const stream = findStreamById(streamId);
  const streamName = stream?.name ?? "Untitled Stream";
  const streamColor = stream?.color ?? "#6B7280";
  const streamHashtag = stream?.hashtag ?? "";

  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [showNewTask, setShowNewTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [showAiTooltip, setShowAiTooltip] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);
  const [coverHovered, setCoverHovered] = useState(false);
  const [coverPickerOpen, setCoverPickerOpen] = useState(false);
  const [coverGradient, setCoverGradient] = useState(
    `linear-gradient(135deg, ${streamColor}22 0%, ${streamColor}08 100%)`
  );

  // Sub-page tree navigation
  const [subPages, setSubPages] = useState<SubPage[]>([]);
  const [breadcrumb, setBreadcrumb] = useState<{ id: string; name: string }[]>([]);
  const [addingPage, setAddingPage] = useState(false);
  const [newPageName, setNewPageName] = useState("");
  const pageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (addingPage) pageInputRef.current?.focus();
  }, [addingPage]);

  const handleAiClick = useCallback(() => {
    setShowAiTooltip(true);
    setTimeout(() => setShowAiTooltip(false), 2000);
  }, []);

  function toggleTask(taskId: string) {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        return { ...t, status: t.status === "done" ? "todo" as const : "done" as const };
      })
    );
  }

  function addTask() {
    if (!newTaskTitle.trim()) return;
    setTasks((prev) => [
      ...prev,
      { id: crypto.randomUUID(), title: newTaskTitle.trim(), dueDate: "No date", priority: "normal", status: "todo" },
    ]);
    setNewTaskTitle("");
    setShowNewTask(false);
  }

  // Get current sub-pages based on breadcrumb depth
  function getCurrentSubPages(): SubPage[] {
    if (breadcrumb.length === 0) return subPages;
    let current = subPages;
    for (const crumb of breadcrumb) {
      const found = current.find((p) => p.id === crumb.id);
      if (found) current = found.children;
      else return [];
    }
    return current;
  }

  function addSubPage() {
    if (!newPageName.trim()) return;
    const newPage: SubPage = {
      id: crypto.randomUUID().slice(0, 8),
      name: newPageName.trim(),
      children: [],
    };

    if (breadcrumb.length === 0) {
      setSubPages((prev) => [...prev, newPage]);
    } else {
      setSubPages((prev) => {
        const updated = JSON.parse(JSON.stringify(prev)) as SubPage[];
        let current = updated;
        for (const crumb of breadcrumb) {
          const found = current.find((p) => p.id === crumb.id);
          if (found) current = found.children;
        }
        current.push(newPage);
        return updated;
      });
    }
    // Navigate into the new sub-page immediately
    setBreadcrumb((prev) => [...prev, { id: newPage.id, name: newPage.name }]);
    setNewPageName("");
    setAddingPage(false);
  }

  function navigateToSubPage(page: SubPage) {
    setBreadcrumb((prev) => [...prev, { id: page.id, name: page.name }]);
  }

  function navigateToBreadcrumb(index: number) {
    if (index === -1) {
      setBreadcrumb([]);
    } else {
      setBreadcrumb((prev) => prev.slice(0, index + 1));
    }
  }

  const currentSubPages = getCurrentSubPages();

  // Key the editor by breadcrumb path so each sub-page gets its own fresh editor instance
  const editorKey = breadcrumb.length === 0
    ? `editor-${streamId}-root`
    : `editor-${streamId}-${breadcrumb.map((c) => c.id).join("-")}`;

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] pl-12">
      {/* ── Cover image / colour banner ── */}
      <div
        className="relative w-full h-40 shrink-0"
        style={{ background: coverGradient }}
        onMouseEnter={() => setCoverHovered(true)}
        onMouseLeave={() => setCoverHovered(false)}
      >
        {coverHovered && (
          <button
            onClick={() => setCoverPickerOpen(true)}
            className="absolute top-3 right-4 bg-surface/80 backdrop-blur-sm text-on-surface-variant text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-surface transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[14px]">image</span>
            Change cover
          </button>
        )}
      </div>

      {/* ── Stream header ── */}
      <div className="flex items-start justify-between px-10 pt-5 pb-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-on-surface mb-0.5">
            {streamName}
          </h1>
          {streamHashtag && (
            <span className="text-on-surface-variant text-sm font-medium">
              #{streamHashtag}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Presence avatars */}
          <div className="flex -space-x-2 mr-2">
            {["A", "B", "C"].map((letter) => (
              <div
                key={letter}
                className="w-7 h-7 rounded-full border-2 border-surface bg-surface-container-highest flex items-center justify-center text-[9px] font-bold text-on-surface-variant"
              >
                {letter}
              </div>
            ))}
          </div>

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

          <button
            onClick={() => setShowNewTask(true)}
            className="text-on-surface-variant text-xs font-semibold hover:text-on-surface transition-colors flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-surface-variant"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            Add task
          </button>

          <button
            onClick={() => setEditingNote({ id: "", title: "", content: "", timeAgo: "" })}
            className="text-on-surface-variant text-xs font-semibold hover:text-on-surface transition-colors flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-surface-variant"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            Add note
          </button>
        </div>
      </div>

      {/* ── Breadcrumb ── */}
      <div className="px-10 pb-3">
        <nav className="flex items-center gap-1 text-sm">
          <button
            onClick={() => navigateToBreadcrumb(-1)}
            className={cn(
              "font-medium transition-colors",
              breadcrumb.length === 0
                ? "text-on-surface"
                : "text-on-surface-variant hover:text-on-surface"
            )}
          >
            {streamName}
          </button>
          {breadcrumb.map((crumb, i) => (
            <span key={crumb.id} className="flex items-center gap-1">
              <span className="text-on-surface-variant/40 material-symbols-outlined text-[14px]">chevron_right</span>
              <button
                onClick={() => navigateToBreadcrumb(i)}
                className={cn(
                  "font-medium transition-colors",
                  i === breadcrumb.length - 1
                    ? "text-on-surface"
                    : "text-on-surface-variant hover:text-on-surface"
                )}
              >
                {crumb.name}
              </button>
            </span>
          ))}
        </nav>
      </div>

      {/* ── Sub-page cards ── */}
      <div className="px-10 pb-4">
          <div className="flex items-stretch gap-3 overflow-x-auto pb-1">
            {currentSubPages.map((page) => (
              <button
                key={page.id}
                onClick={() => navigateToSubPage(page)}
                className="flex items-center gap-2 px-4 py-3 rounded-xl border transition-colors hover:bg-surface-variant/50 shrink-0 min-w-[140px]"
                style={{ borderColor: `${streamColor}30` }}
              >
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
                  description
                </span>
                <span className="text-sm font-medium text-on-surface">{page.name}</span>
              </button>
            ))}

            {/* New sub-page card */}
            {addingPage ? (
              <form
                onSubmit={(e) => { e.preventDefault(); addSubPage(); }}
                className="flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-outline-variant/40 shrink-0 min-w-[140px]"
              >
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant/40">add</span>
                <input
                  ref={pageInputRef}
                  type="text"
                  value={newPageName}
                  onChange={(e) => setNewPageName(e.target.value)}
                  placeholder="Page name..."
                  className="bg-transparent text-sm text-on-surface outline-none placeholder:text-on-surface-variant/40 w-28"
                  onBlur={() => { if (newPageName.trim()) addSubPage(); else setAddingPage(false); }}
                  onKeyDown={(e) => { if (e.key === "Escape") { setAddingPage(false); setNewPageName(""); } }}
                />
              </form>
            ) : (
              <button
                onClick={() => setAddingPage(true)}
                className="flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-outline-variant/30 text-on-surface-variant/50 hover:text-on-surface-variant hover:border-outline-variant/50 transition-colors shrink-0 min-w-[140px]"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span className="text-sm font-medium">New sub-page</span>
              </button>
            )}
          </div>
        </div>

      {/* ── Main content: editor + right panel ── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Center — rich editor, fluid width */}
        <div className="flex-1 overflow-y-auto overflow-x-visible py-6 pl-6 pr-10 min-w-0">
          <StreamEditor key={editorKey} streamColor={streamColor} />
        </div>

        {/* Right panel — collapsible, fixed width */}
        <div
          className={cn(
            "border-l border-outline-variant/20 flex flex-col transition-all duration-300 shrink-0 overflow-hidden",
            panelOpen ? "w-[320px]" : "w-10"
          )}
        >
          {panelOpen ? (
            <div className="flex-1 overflow-y-auto px-4 pb-4 pt-3">
              {/* Tasks section */}
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-bold tracking-widest uppercase text-on-surface-variant/60">
                    Tasks
                  </h3>
                  <button
                    onClick={() => setPanelOpen(false)}
                    className="text-on-surface-variant/40 hover:text-on-surface-variant transition-colors p-0.5 rounded"
                    title="Collapse panel"
                  >
                    <span className="material-symbols-outlined text-[16px]">right_panel_close</span>
                  </button>
                </div>

                {statusGroups.map((group) => {
                  const groupTasks = tasks.filter((t) => t.status === group.key);
                  if (groupTasks.length === 0) return null;

                  return (
                    <div key={group.key} className="space-y-1">
                      <span className="text-[9px] font-bold tracking-widest uppercase text-on-surface-variant/40">
                        {group.label}
                      </span>
                      <div className="space-y-0.5">
                        {groupTasks.map((task) => (
                          <div
                            key={task.id}
                            className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-surface-variant/50"
                          >
                            <button
                              onClick={() => toggleTask(task.id)}
                              className={cn(
                                "w-4 h-4 rounded-full border-[1.5px] flex items-center justify-center shrink-0 transition-colors",
                                task.status === "done"
                                  ? "border-tertiary text-tertiary"
                                  : "border-outline-variant hover:border-tertiary"
                              )}
                            >
                              {task.status === "done" && (
                                <span className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                              )}
                            </button>
                            <span
                              className={cn(
                                "text-xs font-medium text-on-surface flex-1 truncate",
                                task.status === "done" && "line-through opacity-40"
                              )}
                            >
                              {task.title}
                            </span>
                            <div
                              className="w-1.5 h-1.5 rounded-full shrink-0"
                              style={{ backgroundColor: priorityColors[task.priority] }}
                              title={task.priority}
                            />
                            <span className="text-[9px] font-semibold text-on-surface-variant/50 whitespace-nowrap">
                              {task.dueDate}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {/* Inline add task */}
                {showNewTask ? (
                  <form
                    onSubmit={(e) => { e.preventDefault(); addTask(); }}
                    className="flex items-center gap-2 px-2 py-1.5"
                  >
                    <div className="w-4 h-4 rounded-full border-[1.5px] border-outline-variant shrink-0" />
                    <input
                      type="text"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      placeholder="Task name..."
                      autoFocus
                      className="flex-1 bg-transparent text-on-surface text-xs font-medium outline-none placeholder:text-on-surface-variant/40"
                      onKeyDown={(e) => {
                        if (e.key === "Escape") { setShowNewTask(false); setNewTaskTitle(""); }
                      }}
                    />
                    <button
                      type="submit"
                      disabled={!newTaskTitle.trim()}
                      className="text-tertiary text-[10px] font-bold px-1.5 py-0.5 rounded hover:bg-surface-variant transition-colors disabled:opacity-30"
                    >
                      Add
                    </button>
                  </form>
                ) : (
                  <button
                    onClick={() => setShowNewTask(true)}
                    className="text-on-surface-variant/40 text-[10px] font-medium hover:text-on-surface-variant transition-colors flex items-center gap-1 px-2 py-1"
                  >
                    <span className="material-symbols-outlined text-[12px]">add</span>
                    Add task
                  </button>
                )}
              </section>

              {/* Divider */}
              <div className="h-px bg-outline-variant/20 my-4" />

              {/* Notes section */}
              <section className="space-y-3">
                <h3 className="text-[10px] font-bold tracking-widest uppercase text-on-surface-variant/60">
                  Notes
                </h3>

                <div className="space-y-2">
                  {mockNotes.map((note) => (
                    <button
                      key={note.id}
                      onClick={() => setEditingNote(note)}
                      className="w-full text-left p-3 rounded-lg bg-surface-container-lowest hover:bg-surface-variant/50 transition-colors space-y-1"
                    >
                      <span className="text-[9px] font-semibold text-on-surface-variant/50">
                        {note.timeAgo}
                      </span>
                      <h4 className="text-xs font-bold text-on-surface truncate">
                        {note.title}
                      </h4>
                      <p className="text-[11px] text-on-surface-variant leading-relaxed line-clamp-2">
                        {note.content}
                      </p>
                    </button>
                  ))}
                </div>
              </section>
            </div>
          ) : (
            <div className="flex items-center justify-center pt-3">
              <button
                onClick={() => setPanelOpen(true)}
                className="text-on-surface-variant/40 hover:text-on-surface-variant transition-colors p-0.5 rounded"
                title="Expand panel"
              >
                <span className="material-symbols-outlined text-[16px]">right_panel_open</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <CoverPicker
        open={coverPickerOpen}
        onClose={() => setCoverPickerOpen(false)}
        streamColor={streamColor}
        onSelect={setCoverGradient}
      />

      <ExpandedCaptureModal
        open={editingNote !== null}
        onClose={() => setEditingNote(null)}
        initialTitle={editingNote?.title ?? ""}
        initialContent={editingNote?.content ?? ""}
      />
    </div>
  );
}
