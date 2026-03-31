"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ExpandedCaptureModal } from "@/features/editor/expanded-capture-modal";

interface InboxNote {
  id: string;
  title: string;
  preview: string;
  timeAgo: string;
  accentColor: string | null;
}

const mockNotes: InboxNote[] = [
  {
    id: "1",
    title: "React 19 Server Components...",
    preview:
      "I need to investigate how the new useActionState hook simplifies form handling compared to...",
    timeAgo: "2h ago",
    accentColor: "#0D9488",
  },
  {
    id: "2",
    title: "Habit Stacking Ideas",
    preview:
      "Morning coffee followed immediately by 10 minutes of journaling. It's the only way to make it stick.",
    timeAgo: "5h ago",
    accentColor: "#D97706",
  },
  {
    id: "3",
    title: "Grocery List",
    preview:
      "Oat milk, sourdough bread, avocados, sea salt, dark roast beans, sparkling water...",
    timeAgo: "Yesterday",
    accentColor: null,
  },
];

export function InboxPreview() {
  const [editingNote, setEditingNote] = useState<InboxNote | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight">Inbox</h2>
        <Link href="/inbox" className="text-primary text-sm font-medium hover:underline">
          View all
        </Link>
      </div>

      <div className="space-y-4">
        {mockNotes.map((note) => (
          <div
            key={note.id}
            onClick={() => setEditingNote(note)}
            className={cn(
              "bg-surface-container-lowest p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer border-l-4",
              note.accentColor ? "" : "border-transparent"
            )}
            style={
              note.accentColor
                ? { borderLeftColor: note.accentColor }
                : undefined
            }
          >
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-bold text-on-surface">{note.title}</h4>
              <span className="text-[10px] text-on-surface-variant font-medium">
                {note.timeAgo}
              </span>
            </div>
            <p className="text-on-surface-variant text-sm line-clamp-2">
              {note.preview}
            </p>
          </div>
        ))}
      </div>

      <ExpandedCaptureModal
        open={editingNote !== null}
        onClose={() => setEditingNote(null)}
        initialTitle={editingNote?.title ?? ""}
        initialContent={editingNote?.preview ?? ""}
      />
    </div>
  );
}
