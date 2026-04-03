"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { findStream } from "@/lib/known-streams";
import { ExpandedCaptureModal } from "@/features/editor/expanded-capture-modal";
import {
  fetchInboxNotes,
  routeNoteToStream,
  type DbNote,
} from "@/lib/supabase/db";

function timeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function InboxPage() {
  const [inboxNotes, setInboxNotes] = useState<DbNote[]>([]);
  const [editingNote, setEditingNote] = useState<DbNote | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [routingId, setRoutingId] = useState<string | null>(null);
  const [routeTag, setRouteTag] = useState("");
  const [showAiTooltip, setShowAiTooltip] = useState(false);

  useEffect(() => {
    fetchInboxNotes().then(setInboxNotes);
  }, []);

  const handleAiClick = useCallback(() => {
    setShowAiTooltip(true);
    setTimeout(() => setShowAiTooltip(false), 2000);
  }, []);

  const handleRouteSubmit = useCallback(
    async (noteId: string) => {
      if (!routeTag.trim()) return;
      const stream = findStream(routeTag.trim().toLowerCase());
      if (stream) {
        try {
          await routeNoteToStream(noteId, stream.id);
          // Refresh inbox
          const updated = await fetchInboxNotes();
          setInboxNotes(updated);
        } catch (err) {
          console.error("Failed to route note:", err);
        }
      }
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
            {inboxNotes.length > 0 && (
              <span className="bg-tertiary text-on-error text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                {inboxNotes.length} unread
              </span>
            )}
          </div>
          <p className="text-on-surface-variant text-sm mt-1">
            Notes without a stream. Tag them to route them.
          </p>
        </div>

        <div className="relative">
          <button
            onClick={handleAiClick}
            className="flex items-center gap-2 bg-inverse-surface text-inverse-on-surface px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
            Summarise Inbox
          </button>
          {showAiTooltip && (
            <div className="absolute right-0 top-full mt-2 whitespace-nowrap bg-inverse-surface text-inverse-on-surface text-xs font-medium px-3 py-1.5 rounded-lg shadow-lg animate-in fade-in duration-150 z-10">
              AI features coming soon
            </div>
          )}
        </div>
      </div>

      {inboxNotes.length === 0 ? (
        <div className="text-center py-16">
          <span className="material-symbols-outlined text-[48px] text-on-surface-variant/20">inbox</span>
          <p className="text-on-surface-variant/50 text-sm mt-3">Inbox is empty — all notes are routed!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {inboxNotes.map((note) => {
            const isHovered = hoveredId === note.id;
            const isRouting = routingId === note.id;
            const firstLine = note.content.split("\n")[0].replace(/#\w+/g, "").trim() || "Untitled";
            const rest = note.content.split("\n").slice(1).join("\n").trim() || note.content;

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
                <div className="px-5 pt-4 pb-1">
                  <span className="text-[10px] font-semibold text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-md">
                    {timeAgo(new Date(note.created_at))}
                  </span>
                </div>

                <div className="px-5 py-3">
                  <h3 className="font-bold text-on-surface text-sm mb-1.5">{firstLine}</h3>
                  <p className="text-on-surface-variant text-xs leading-relaxed line-clamp-3">{rest}</p>
                </div>

                <div className="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-surface-container-lowest to-transparent pointer-events-none" />

                {isHovered && !isRouting && (
                  <div className="absolute bottom-2.5 right-2.5 z-10" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => { e.stopPropagation(); setRoutingId(note.id); }}
                      className="bg-inverse-surface/90 text-inverse-on-surface text-[10px] font-medium px-2 py-1 rounded-md hover:bg-inverse-surface transition-colors flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[12px]">sell</span>
                      Route
                    </button>
                  </div>
                )}

                {isRouting && (
                  <div className="absolute bottom-2.5 left-4 right-4 z-10" onClick={(e) => e.stopPropagation()}>
                    <form
                      onSubmit={(e) => { e.preventDefault(); handleRouteSubmit(note.id); }}
                      className="flex items-center gap-1.5"
                    >
                      <div className="flex-1 flex items-center gap-1.5 bg-surface-container rounded-md px-2.5 py-1">
                        <span className="text-on-surface-variant text-xs font-bold">#</span>
                        <input
                          type="text"
                          value={routeTag}
                          onChange={(e) => setRouteTag(e.target.value)}
                          placeholder="tag name..."
                          autoFocus
                          className="flex-1 bg-transparent text-on-surface text-xs outline-none placeholder:text-on-surface-variant/40"
                          onKeyDown={(e) => { if (e.key === "Escape") { setRoutingId(null); setRouteTag(""); } }}
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
      )}

      <ExpandedCaptureModal
        open={editingNote !== null}
        onClose={() => { setEditingNote(null); fetchInboxNotes().then(setInboxNotes); }}
        initialContent={editingNote?.content ?? ""}
      />
    </div>
  );
}
