"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { KNOWN_STREAMS } from "@/lib/known-streams";
import { cn } from "@/lib/utils";

/* ── Search result types ── */

interface SearchResult {
  id: string;
  type: "stream" | "subpage" | "task" | "note";
  title: string;
  subtitle?: string;
  meta?: string;
  color?: string;
  href: string;
}

const typeLabels: Record<SearchResult["type"], string> = {
  stream: "Stream",
  subpage: "Sub-page",
  task: "Task",
  note: "Note",
};

const typeIcons: Record<SearchResult["type"], string> = {
  stream: "tag",
  subpage: "description",
  task: "check_circle",
  note: "sticky_note_2",
};

/* ── Mock searchable data ── */

function getMockResults(): SearchResult[] {
  const streams: SearchResult[] = KNOWN_STREAMS.map((s) => ({
    id: `stream-${s.id}`,
    type: "stream",
    title: s.name,
    subtitle: `#${s.hashtag}`,
    color: s.color,
    href: `/s/${s.id}`,
  }));

  const subpages: SearchResult[] = [
    { id: "sp-1", type: "subpage", title: "API Architecture", subtitle: "Web Development", color: "#0D9488", href: "/s/webdev" },
    { id: "sp-2", type: "subpage", title: "Component Library", subtitle: "Design Projects", color: "#7C3AED", href: "/s/design" },
    { id: "sp-3", type: "subpage", title: "Reading List", subtitle: "Personal Growth", color: "#D97706", href: "/s/growth" },
    { id: "sp-4", type: "subpage", title: "Sprint Planning", subtitle: "Web Development", color: "#0D9488", href: "/s/webdev" },
    { id: "sp-5", type: "subpage", title: "Brand Guidelines", subtitle: "Design Projects", color: "#7C3AED", href: "/s/design" },
  ];

  const tasks: SearchResult[] = [
    { id: "t-1", type: "task", title: "Refactor auth hooks", subtitle: "Web Development", meta: "Due yesterday", href: "/tasks" },
    { id: "t-2", type: "task", title: "Update README docs", subtitle: "Web Development", meta: "Overdue", href: "/tasks" },
    { id: "t-3", type: "task", title: "CI/CD Pipeline Fix", subtitle: "Web Development", meta: "No date", href: "/tasks" },
    { id: "t-4", type: "task", title: "Mood board for landing page", subtitle: "Design Projects", meta: "Due today", href: "/tasks" },
    { id: "t-5", type: "task", title: "Review component library", subtitle: "Design Projects", meta: "Due today", href: "/tasks" },
    { id: "t-6", type: "task", title: "Write blog post outline", subtitle: "Personal Growth", meta: "Due tomorrow", href: "/tasks" },
    { id: "t-7", type: "task", title: "Schedule team retro", subtitle: "Inbox", meta: "This week", href: "/tasks" },
    { id: "t-8", type: "task", title: "Plan Q2 goals", subtitle: "Personal Growth", meta: "Next week", href: "/tasks" },
  ];

  const notes: SearchResult[] = [
    { id: "n-1", type: "note", title: "Meeting notes — April kickoff", subtitle: "Discussed roadmap priorities for Q2", meta: "Web Development", href: "/s/webdev" },
    { id: "n-2", type: "note", title: "Design system tokens", subtitle: "Colour scale, typography, spacing tokens", meta: "Design Projects", href: "/s/design" },
    { id: "n-3", type: "note", title: "Book notes: Atomic Habits", subtitle: "Key takeaways and action items", meta: "Personal Growth", href: "/s/growth" },
    { id: "n-4", type: "note", title: "Auth flow diagram", subtitle: "OAuth2 + refresh token architecture", meta: "Web Development", href: "/s/webdev" },
    { id: "n-5", type: "note", title: "Competitor analysis", subtitle: "Feature comparison with Notion, Obsidian", meta: "Inbox", href: "/inbox" },
  ];

  return [...streams, ...subpages, ...tasks, ...notes];
}

/* ── Search logic ── */

function searchItems(query: string, allItems: SearchResult[]): SearchResult[] {
  const q = query.toLowerCase().trim();
  if (q.length < 2) return [];

  return allItems.filter(
    (item) =>
      item.title.toLowerCase().includes(q) ||
      item.subtitle?.toLowerCase().includes(q) ||
      item.meta?.toLowerCase().includes(q)
  );
}

function groupResults(results: SearchResult[]): { type: SearchResult["type"]; label: string; items: SearchResult[] }[] {
  const order: SearchResult["type"][] = ["stream", "subpage", "task", "note"];
  const groups: { type: SearchResult["type"]; label: string; items: SearchResult[] }[] = [];

  for (const type of order) {
    const items = results.filter((r) => r.type === type);
    if (items.length > 0) {
      groups.push({ type, label: type === "stream" ? "Streams" : type === "subpage" ? "Sub-pages" : type === "task" ? "Tasks" : "Notes", items });
    }
  }

  return groups;
}

/* ── Component ── */

export function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const allItems = useRef(getMockResults()).current;
  const results = searchItems(query, allItems);
  const groups = groupResults(results);
  const flatResults = groups.flatMap((g) => g.items);

  // Focus input on open
  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      // Small delay to ensure the modal is rendered
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  // Scroll active item into view
  useEffect(() => {
    if (!listRef.current) return;
    const activeEl = listRef.current.querySelector(`[data-index="${activeIndex}"]`);
    activeEl?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const navigate = useCallback(
    (result: SearchResult) => {
      onClose();
      router.push(result.href);
    },
    [onClose, router]
  );

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % Math.max(flatResults.length, 1));
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + Math.max(flatResults.length, 1)) % Math.max(flatResults.length, 1));
      return;
    }

    if (e.key === "Enter" && flatResults[activeIndex]) {
      e.preventDefault();
      navigate(flatResults[activeIndex]);
      return;
    }
  }

  // Reset active index when results change
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  if (!open) return null;

  let flatIndex = 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[18vh]">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-[600px] overflow-hidden flex flex-col max-h-[60vh]">
        {/* Search input */}
        <div className="flex items-center gap-3 px-5 py-4 shrink-0">
          <span className="material-symbols-outlined text-on-surface-variant text-[22px]">search</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search notes, tasks, streams..."
            className="flex-1 bg-transparent text-on-surface placeholder:text-on-surface-variant/40 outline-none text-sm"
          />
          <kbd className="text-[10px] text-on-surface-variant/50 font-mono bg-surface-container px-1.5 py-0.5 rounded">ESC</kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="border-t border-outline-variant/20 overflow-y-auto">
          {query.length < 2 ? (
            <div className="px-5 py-8 text-center">
              <p className="text-on-surface-variant/40 text-xs">Start typing to search...</p>
            </div>
          ) : flatResults.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <p className="text-on-surface-variant/50 text-sm">
                No results for &ldquo;<span className="text-on-surface font-medium">{query}</span>&rdquo;
              </p>
            </div>
          ) : (
            <div className="py-2">
              {groups.map((group) => (
                <div key={group.type}>
                  <div className="px-5 pt-3 pb-1">
                    <span className="text-[10px] font-bold tracking-widest uppercase text-on-surface-variant/50">
                      {group.label}
                    </span>
                  </div>
                  {group.items.map((result) => {
                    const idx = flatIndex++;
                    return (
                      <button
                        key={result.id}
                        data-index={idx}
                        onClick={() => navigate(result)}
                        onMouseEnter={() => setActiveIndex(idx)}
                        className={cn(
                          "w-full flex items-center gap-3 px-5 py-2.5 text-left transition-colors",
                          idx === activeIndex
                            ? "bg-surface-variant/40"
                            : "hover:bg-surface-variant/20"
                        )}
                      >
                        {/* Icon / colour dot */}
                        {result.type === "stream" && result.color ? (
                          <div
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: result.color }}
                          />
                        ) : (
                          <span
                            className="material-symbols-outlined text-[18px] text-on-surface-variant/60 shrink-0"
                            style={result.color ? { color: result.color } : undefined}
                          >
                            {typeIcons[result.type]}
                          </span>
                        )}

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-on-surface truncate">
                            {result.title}
                          </div>
                          {result.subtitle && (
                            <div className="text-[11px] text-on-surface-variant/60 truncate">
                              {result.subtitle}
                              {result.meta && (
                                <span className="text-on-surface-variant/40"> · {result.meta}</span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Type pill */}
                        <span className="text-[10px] font-semibold text-on-surface-variant/40 bg-surface-container px-2 py-0.5 rounded-full shrink-0">
                          {typeLabels[result.type]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer hint */}
        {flatResults.length > 0 && (
          <div className="border-t border-outline-variant/20 px-5 py-2.5 flex items-center gap-4 text-[10px] text-on-surface-variant/40 shrink-0">
            <span className="flex items-center gap-1">
              <kbd className="font-mono bg-surface-container px-1 py-0.5 rounded text-[9px]">↑↓</kbd> navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="font-mono bg-surface-container px-1 py-0.5 rounded text-[9px]">↵</kbd> open
            </span>
            <span className="flex items-center gap-1">
              <kbd className="font-mono bg-surface-container px-1 py-0.5 rounded text-[9px]">esc</kbd> close
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
