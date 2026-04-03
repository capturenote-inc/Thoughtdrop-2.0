"use client";

import { useSyncExternalStore } from "react";
import {
  subscribe,
  getSnapshot,
  getInboxNotes,
  getStreamNotes,
  getAllNotes,
  type NoteItem,
} from "@/lib/notes-store";

/** Force re-render when the store changes */
function useStoreVersion() {
  useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/** All notes (reactive) */
export function useAllNotes(): NoteItem[] {
  useStoreVersion();
  return getAllNotes();
}

/** Inbox notes only (reactive) */
export function useInboxNotes(): NoteItem[] {
  useStoreVersion();
  return getInboxNotes();
}

/** Notes for a specific stream (reactive) */
export function useStreamNotes(streamId: string): NoteItem[] {
  useStoreVersion();
  return getStreamNotes(streamId);
}
