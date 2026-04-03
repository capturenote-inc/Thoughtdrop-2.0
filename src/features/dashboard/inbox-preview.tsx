"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ExpandedCaptureModal } from "@/features/editor/expanded-capture-modal";
import { fetchInboxNotes, type DbNote } from "@/lib/supabase/db";

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
  return `${days}d ago`;
}

export function InboxPreview() {
  const [notes, setNotes] = useState<DbNote[]>([]);
  const [editingNote, setEditingNote] = useState<DbNote | null>(null);

  useEffect(() => {
    fetchInboxNotes().then((all) => setNotes(all.slice(0, 3)));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight">Inbox</h2>
        <Link href="/inbox" className="text-primary text-sm font-medium hover:underline">
          View all
        </Link>
      </div>

      {notes.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-on-surface-variant/50 text-sm">No unrouted notes</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notes.map((note) => {
            const firstLine = note.content.split("\n")[0].replace(/#\w+/g, "").trim() || "Untitled";
            const rest = note.content.split("\n").slice(1).join("\n").trim() || note.content;
            return (
              <div
                key={note.id}
                onClick={() => setEditingNote(note)}
                className="bg-surface-container-lowest p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer border-l-4 border-transparent"
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-on-surface">{firstLine}</h4>
                  <span className="text-[10px] text-on-surface-variant font-medium">
                    {timeAgo(new Date(note.created_at))}
                  </span>
                </div>
                <p className="text-on-surface-variant text-sm line-clamp-2">{rest}</p>
              </div>
            );
          })}
        </div>
      )}

      <ExpandedCaptureModal
        open={editingNote !== null}
        onClose={() => { setEditingNote(null); fetchInboxNotes().then((all) => setNotes(all.slice(0, 3))); }}
        initialContent={editingNote?.content ?? ""}
      />
    </div>
  );
}
