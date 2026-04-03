/**
 * Central mock notes store with tag-based routing.
 *
 * Rules:
 * - Note saved with a hashtag → routes to matching stream(s)
 * - Note saved with no hashtag → stays in Inbox (streamIds = [])
 * - Note with multiple hashtags → appears on all matching streams
 * - Unknown hashtag → caller handles "create stream" prompt
 *
 * Will be replaced by Supabase when DB is integrated.
 */

import { findStream, type KnownStream } from "@/lib/known-streams";

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  type: "note" | "task";
  /** Stream IDs this note is routed to. Empty = Inbox. */
  streamIds: string[];
  /** Raw hashtags parsed from the note */
  hashtags: string[];
  createdAt: Date;
}

/** Extract unique hashtags from text */
export function parseHashtags(text: string): string[] {
  const matches = text.match(/#(\w+)/g);
  return matches ? [...new Set(matches.map((m) => m.slice(1).toLowerCase()))] : [];
}

/** Given hashtags, resolve which streams they match and which are unknown */
export function resolveRouting(hashtags: string[]): {
  matched: KnownStream[];
  unknown: string[];
} {
  const matched: KnownStream[] = [];
  const unknown: string[] = [];

  for (const tag of hashtags) {
    const stream = findStream(tag);
    if (stream) {
      matched.push(stream);
    } else {
      unknown.push(tag);
    }
  }

  return { matched, unknown };
}

/* ── In-memory store ── */

const today = new Date();
function hoursAgo(h: number): Date {
  return new Date(today.getTime() - h * 60 * 60 * 1000);
}
function daysAgo(d: number): Date {
  return new Date(today.getTime() - d * 24 * 60 * 60 * 1000);
}

const _notes: NoteItem[] = [
  // ── Inbox notes (no tags) ──
  {
    id: "n-inbox-1",
    title: "Redesigning the typography scales",
    content: "Need to ensure the Inter font stacks correctly across all environments. Looking at 1.25x vs 1.333x ratios for the heading hierarchy.",
    type: "note",
    streamIds: [],
    hashtags: [],
    createdAt: hoursAgo(2),
  },
  {
    id: "n-inbox-2",
    title: "Client meeting notes: Horizon Lab",
    content: '"We want the interface to feel like a quiet library, not a bustling stock exchange." High priority feedback for the dashboard.',
    type: "note",
    streamIds: [],
    hashtags: [],
    createdAt: daysAgo(3),
  },
  {
    id: "n-inbox-3",
    title: "Grocery List",
    content: "Oat milk, sourdough bread, avocados, sea salt, dark roast beans, sparkling water, cherry tomatoes, fresh basil.",
    type: "note",
    streamIds: [],
    hashtags: [],
    createdAt: daysAgo(1),
  },
  {
    id: "n-inbox-4",
    title: "The \"No-Line\" Rule",
    content: "Layout boundaries must be established solely through background color shifts. No visible borders, no dividers. Depth through tone, not stroke.",
    type: "note",
    streamIds: [],
    hashtags: [],
    createdAt: daysAgo(7),
  },
  {
    id: "n-inbox-5",
    title: "Onboarding flow thoughts",
    content: "The first 30 seconds decide everything. Skip the tour, drop the user straight into a quick capture. Show value before asking for setup.",
    type: "note",
    streamIds: [],
    hashtags: [],
    createdAt: hoursAgo(6),
  },
  {
    id: "n-inbox-6",
    title: "Habit Stacking Ideas",
    content: "Morning coffee followed immediately by 10 minutes of journaling. It's the only way to make it stick.",
    type: "note",
    streamIds: [],
    hashtags: [],
    createdAt: hoursAgo(5),
  },

  // ── Routed to Web Development (#webdev) ──
  {
    id: "n-wd-1",
    title: "Tailwind Config Architecture",
    content: "We should move the extended color palette to a separate theme.js file to keep the main config clean. #webdev",
    type: "note",
    streamIds: ["webdev"],
    hashtags: ["webdev"],
    createdAt: hoursAgo(1),
  },
  {
    id: "n-wd-2",
    title: "React 19 Server Components Research",
    content: "Testing the new 'use cache' directive. The performance gains for the dashboard rendering are significant. #webdev",
    type: "note",
    streamIds: ["webdev"],
    hashtags: ["webdev"],
    createdAt: hoursAgo(3),
  },
  {
    id: "n-wd-3",
    title: "Accessibility Audit Notes",
    content: "Need to ensure all Material Symbols have proper aria-label tags. Some contrast ratios below 4.5:1 on dark mode. #webdev",
    type: "note",
    streamIds: ["webdev"],
    hashtags: ["webdev"],
    createdAt: daysAgo(1),
  },

  // ── Routed to Design Projects (#design) ──
  {
    id: "n-ds-1",
    title: "Design system tokens",
    content: "Colour scale, typography, spacing tokens need documenting. Export as Figma variables. #design",
    type: "note",
    streamIds: ["design"],
    hashtags: ["design"],
    createdAt: hoursAgo(4),
  },
  {
    id: "n-ds-2",
    title: "Competitor analysis",
    content: "Feature comparison with Notion, Obsidian, and Linear. Focus on capture speed and tag routing UX. #design",
    type: "note",
    streamIds: ["design"],
    hashtags: ["design"],
    createdAt: daysAgo(2),
  },

  // ── Routed to Personal Growth (#growth) ──
  {
    id: "n-pg-1",
    title: "Book notes: Atomic Habits",
    content: "Key takeaways: habit stacking, environment design, identity-based change. #growth",
    type: "note",
    streamIds: ["growth"],
    hashtags: ["growth"],
    createdAt: daysAgo(3),
  },

  // ── Multi-stream note (#webdev + #design) ──
  {
    id: "n-multi-1",
    title: "Auth flow diagram",
    content: "OAuth2 + refresh token architecture. Needs both eng review and design sign-off. #webdev #design",
    type: "note",
    streamIds: ["webdev", "design"],
    hashtags: ["webdev", "design"],
    createdAt: hoursAgo(8),
  },
];

let _listeners: (() => void)[] = [];
let _version = 0;

function notify() {
  _version++;
  for (const fn of _listeners) fn();
}

/* ── Public API ── */

export function subscribe(listener: () => void): () => void {
  _listeners.push(listener);
  return () => {
    _listeners = _listeners.filter((l) => l !== listener);
  };
}

export function getSnapshot(): number {
  return _version;
}

/** Notes with no stream routing (Inbox) */
export function getInboxNotes(): NoteItem[] {
  return _notes.filter((n) => n.streamIds.length === 0);
}

/** Notes routed to a specific stream */
export function getStreamNotes(streamId: string): NoteItem[] {
  return _notes.filter((n) => n.streamIds.includes(streamId));
}

/** All notes, most recent first */
export function getAllNotes(): NoteItem[] {
  return [..._notes].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

/** Add a new note. Tag routing happens here. */
export function addNote(input: {
  title: string;
  content: string;
  type: "note" | "task";
}): { note: NoteItem; unknownTags: string[] } {
  const allText = `${input.title} ${input.content}`;
  const hashtags = parseHashtags(allText);
  const { matched, unknown } = resolveRouting(hashtags);

  const note: NoteItem = {
    id: crypto.randomUUID(),
    title: input.title,
    content: input.content,
    type: input.type,
    streamIds: matched.map((s) => s.id),
    hashtags,
    createdAt: new Date(),
  };

  _notes.unshift(note);
  notify();

  return { note, unknownTags: unknown };
}

/** Route an existing inbox note to a stream by adding a tag */
export function routeNote(noteId: string, streamId: string): void {
  const note = _notes.find((n) => n.id === noteId);
  if (!note) return;
  if (!note.streamIds.includes(streamId)) {
    note.streamIds.push(streamId);
    notify();
  }
}

/** Remove a note */
export function removeNote(noteId: string): void {
  const idx = _notes.findIndex((n) => n.id === noteId);
  if (idx !== -1) {
    _notes.splice(idx, 1);
    notify();
  }
}
