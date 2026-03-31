"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { ExpandedCaptureModal } from "@/features/editor/expanded-capture-modal";

interface InboxNote {
  id: string;
  title: string;
  content: string;
  timeAgo: string;
}

const mockNotes: InboxNote[] = [
  {
    id: "1",
    title: "Redesigning the typography scales",
    content:
      "Need to ensure the Inter font stacks correctly across all environments. Looking at 1.25x vs 1.333x ratios for the heading hierarchy. The current scale feels too compressed on mobile.",
    timeAgo: "2h ago",
  },
  {
    id: "2",
    title: "Client meeting notes: Horizon Lab",
    content:
      '"We want the interface to feel like a quiet library, not a bustling stock exchange." — High priority feedback for the dashboard. Follow up with their design lead by Friday.',
    timeAgo: "Oct 24",
  },
  {
    id: "3",
    title: "New thought captured from voice",
    content:
      "Asymmetric layouts are underutilized in SaaS. We should lean into editorial white space for the project view. Look at how Linear handles density vs breathing room.",
    timeAgo: "Just now",
  },
  {
    id: "4",
    title: "Product Roadmap Q4",
    content:
      "AI Synthesis v2.1 — multi-device sync — dark mode polish — tag routing improvements. Need to prioritise based on user feedback from the beta group.",
    timeAgo: "2 days ago",
  },
  {
    id: "5",
    title: 'The "No-Line" Rule',
    content:
      "Established that layout boundaries must be established solely through background color shifts. No visible borders, no dividers. Depth through tone, not stroke.",
    timeAgo: "Last week",
  },
  {
    id: "6",
    title: "React 19 Server Components Research",
    content:
      "Testing the new 'use cache' directive. The performance gains for the dashboard rendering are significant (approx 40% reduction in TTI). Need to benchmark against current implementation.",
    timeAgo: "3h ago",
  },
  {
    id: "7",
    title: "Habit Stacking Ideas",
    content:
      "Morning coffee followed immediately by 10 minutes of journaling. It's the only way to make it stick. Also try pairing a walk with podcast listening for the afternoon slump.",
    timeAgo: "5h ago",
  },
  {
    id: "8",
    title: "Accessibility Audit Notes",
    content:
      "Need to ensure all Material Symbols have proper aria-label tags. Some of our custom components have contrast ratios below 4.5:1 on dark mode. Priority fix before launch.",
    timeAgo: "Yesterday",
  },
  {
    id: "9",
    title: "Tailwind Config Architecture",
    content:
      "We should move the extended color palette to a separate theme.js file to keep the main config clean. This will help with the upcoming multi-tenant branding requirements.",
    timeAgo: "Just now",
  },
  {
    id: "10",
    title: "Grocery List",
    content:
      "Oat milk, sourdough bread, avocados, sea salt, dark roast beans, sparkling water, cherry tomatoes, fresh basil, mozzarella, olive oil.",
    timeAgo: "Yesterday",
  },
  {
    id: "11",
    title: "Weekly Review Template",
    content:
      "What went well? What didn't? What will I focus on next week? Keep it to 3 bullets per section max. Review every Sunday evening before the week starts.",
    timeAgo: "4 days ago",
  },
  {
    id: "12",
    title: "Onboarding flow thoughts",
    content:
      "The first 30 seconds decide everything. Skip the tour, drop the user straight into a quick capture. Show value before asking for setup. Progressive disclosure for workspace config.",
    timeAgo: "6h ago",
  },
];

export function InboxPage() {
  const [editingNote, setEditingNote] = useState<InboxNote | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [routingId, setRoutingId] = useState<string | null>(null);
  const [routeTag, setRouteTag] = useState("");
  const [showAiTooltip, setShowAiTooltip] = useState(false);

  const unreadCount = mockNotes.length;

  const handleAiClick = useCallback(() => {
    setShowAiTooltip(true);
    setTimeout(() => setShowAiTooltip(false), 2000);
  }, []);

  const handleRouteSubmit = useCallback(
    (noteId: string) => {
      if (!routeTag.trim()) return;
      // Stub: will route note to page in Supabase later
      setRoutingId(null);
      setRouteTag("");
    },
    [routeTag]
  );

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-on-surface">
              Inbox
            </h1>
            <span className="bg-tertiary text-on-error text-[11px] font-bold px-2.5 py-0.5 rounded-full">
              {unreadCount} unread
            </span>
          </div>
          <p className="text-on-surface-variant text-sm mt-1">
            Notes without a page. Tag them to route them.
          </p>
        </div>

        {/* Summarise inbox button */}
        <div className="relative">
          <button
            onClick={handleAiClick}
            className="flex items-center gap-2 bg-inverse-surface text-inverse-on-surface px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <span className="material-symbols-outlined text-[18px]">
              auto_awesome
            </span>
            Summarise Inbox
          </button>
          {showAiTooltip && (
            <div className="absolute right-0 top-full mt-2 whitespace-nowrap bg-inverse-surface text-inverse-on-surface text-xs font-medium px-3 py-1.5 rounded-lg shadow-lg animate-in fade-in duration-150 z-10">
              AI features coming soon
            </div>
          )}
        </div>
      </div>

      {/* Fixed-height grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {mockNotes.map((note) => {
          const isHovered = hoveredId === note.id;
          const isRouting = routingId === note.id;

          return (
            <div
              key={note.id}
              className="bg-surface-container-lowest rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer border-l-4 border-transparent group relative h-[188px] overflow-hidden"
              onMouseEnter={() => setHoveredId(note.id)}
              onMouseLeave={() => {
                setHoveredId(null);
                if (routingId === note.id) {
                  setRoutingId(null);
                  setRouteTag("");
                }
              }}
              onClick={() => setEditingNote(note)}
            >
              {/* Timestamp pill */}
              <div className="px-5 pt-4 pb-1">
                <span className="text-[10px] font-semibold text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-md">
                  {note.timeAgo}
                </span>
              </div>

              {/* Content */}
              <div className="px-5 py-3">
                <h3 className="font-bold text-on-surface text-sm mb-1.5">
                  {note.title}
                </h3>
                <p className="text-on-surface-variant text-xs leading-relaxed line-clamp-3">
                  {note.content}
                </p>
              </div>

              {/* Bottom fade for overflow */}
              <div className="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-surface-container-lowest to-transparent pointer-events-none" />

              {/* Hover overlay actions */}
              {isHovered && !isRouting && (
                <div
                  className="absolute bottom-2.5 right-2.5 z-10"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setRoutingId(note.id);
                    }}
                    className="bg-inverse-surface/90 text-inverse-on-surface text-[10px] font-medium px-2 py-1 rounded-md hover:bg-inverse-surface transition-colors flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[12px]">
                      sell
                    </span>
                    Route
                  </button>
                </div>
              )}

              {/* Inline routing input */}
              {isRouting && (
                <div
                  className="absolute bottom-2.5 left-4 right-4 z-10"
                  onClick={(e) => e.stopPropagation()}
                >
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleRouteSubmit(note.id);
                    }}
                    className="flex items-center gap-1.5"
                  >
                    <div className="flex-1 flex items-center gap-1.5 bg-surface-container rounded-md px-2.5 py-1">
                      <span className="text-on-surface-variant text-xs font-bold">
                        #
                      </span>
                      <input
                        type="text"
                        value={routeTag}
                        onChange={(e) => setRouteTag(e.target.value)}
                        placeholder="tag name..."
                        autoFocus
                        className="flex-1 bg-transparent text-on-surface text-xs outline-none placeholder:text-on-surface-variant/40"
                        onKeyDown={(e) => {
                          if (e.key === "Escape") {
                            setRoutingId(null);
                            setRouteTag("");
                          }
                        }}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={!routeTag.trim()}
                      className="bg-tertiary text-on-error text-[10px] font-semibold px-2.5 py-1 rounded-md hover:opacity-90 transition-opacity disabled:opacity-30"
                    >
                      Route
                    </button>
                  </form>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Expanded capture modal for editing */}
      <ExpandedCaptureModal
        open={editingNote !== null}
        onClose={() => setEditingNote(null)}
        initialTitle={editingNote?.title ?? ""}
        initialContent={editingNote?.content ?? ""}
      />
    </div>
  );
}
