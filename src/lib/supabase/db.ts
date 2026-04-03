/**
 * Supabase data access layer for ThoughtDrop.
 *
 * All DB calls go through here. Each function creates a fresh
 * browser client via createClient() — Supabase JS client is
 * lightweight and this keeps things simple.
 */

import { createClient } from "@/lib/supabase/client";

// Hard-coded default workspace ID — will be dynamic after auth
const DEFAULT_WORKSPACE_ID = "00000000-0000-0000-0000-000000000001";

/* ── Workspace bootstrap ── */

export async function ensureDefaultWorkspace(): Promise<string> {
  const sb = createClient();
  const { data } = await sb
    .from("workspaces")
    .select("id")
    .eq("id", DEFAULT_WORKSPACE_ID)
    .single();

  if (!data) {
    await sb.from("workspaces").insert({
      id: DEFAULT_WORKSPACE_ID,
      name: "Bryan's Workspace",
    });
  }

  return DEFAULT_WORKSPACE_ID;
}

/* ── Streams ── */

export interface DbStream {
  id: string;
  name: string;
  hashtag: string;
  colour: string;
  cover_image: string | null;
  created_at: string;
}

export async function fetchStreams(): Promise<DbStream[]> {
  const sb = createClient();
  const { data, error } = await sb
    .from("streams")
    .select("*")
    .eq("workspace_id", DEFAULT_WORKSPACE_ID)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function createStream(input: {
  name: string;
  hashtag: string;
  colour: string;
}): Promise<DbStream> {
  const sb = createClient();
  const id = crypto.randomUUID();

  // Insert into streams table
  const { data, error } = await sb
    .from("streams")
    .insert({
      id,
      workspace_id: DEFAULT_WORKSPACE_ID,
      name: input.name,
      hashtag: input.hashtag,
      colour: input.colour,
    })
    .select()
    .single();

  if (error) throw error;

  // Register hashtag
  await sb.from("workspace_hashtags").insert({
    workspace_id: DEFAULT_WORKSPACE_ID,
    hashtag: input.hashtag,
    owner_type: "stream",
    owner_id: id,
  });

  return data;
}

export async function deleteStream(id: string): Promise<void> {
  const sb = createClient();

  // Remove hashtag registration
  await sb
    .from("workspace_hashtags")
    .delete()
    .eq("owner_id", id)
    .eq("owner_type", "stream");

  // Delete stream (cascades to pages, note_routing, etc.)
  const { error } = await sb.from("streams").delete().eq("id", id);
  if (error) throw error;
}

/* ── Pages (sub-pages) ── */

export interface DbPage {
  id: string;
  stream_id: string;
  parent_page_id: string | null;
  name: string;
  hashtag: string;
  colour: string;
  created_at: string;
}

export async function fetchPages(streamId: string): Promise<DbPage[]> {
  const sb = createClient();
  const { data, error } = await sb
    .from("pages")
    .select("*")
    .eq("stream_id", streamId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function createPage(input: {
  streamId: string;
  parentPageId: string | null;
  name: string;
  hashtag: string;
  colour: string;
}): Promise<DbPage> {
  const sb = createClient();
  const id = crypto.randomUUID();

  const { data, error } = await sb
    .from("pages")
    .insert({
      id,
      stream_id: input.streamId,
      parent_page_id: input.parentPageId,
      name: input.name,
      hashtag: input.hashtag,
      colour: input.colour,
    })
    .select()
    .single();

  if (error) throw error;

  // Register hashtag
  await sb.from("workspace_hashtags").insert({
    workspace_id: DEFAULT_WORKSPACE_ID,
    hashtag: input.hashtag,
    owner_type: "page",
    owner_id: id,
  });

  return data;
}

/* ── Notes ── */

export interface DbNote {
  id: string;
  content: string;
  hashtags: string[];
  created_at: string;
  updated_at: string;
}

export async function fetchInboxNotes(): Promise<DbNote[]> {
  const sb = createClient();

  // Inbox = notes with no routing rows
  const { data, error } = await sb
    .from("notes")
    .select("*, note_routing(id)")
    .eq("workspace_id", DEFAULT_WORKSPACE_ID)
    .order("created_at", { ascending: false });

  if (error) throw error;

  // Filter to notes with zero routing rows
  return (data ?? []).filter(
    (n: any) => !n.note_routing || n.note_routing.length === 0
  ).map((n: any) => ({
    id: n.id,
    content: n.content,
    hashtags: n.hashtags,
    created_at: n.created_at,
    updated_at: n.updated_at,
  }));
}

export async function fetchStreamNotes(streamId: string): Promise<DbNote[]> {
  const sb = createClient();
  const { data, error } = await sb
    .from("note_routing")
    .select("notes(*)")
    .eq("stream_id", streamId)
    .order("created_at", { ascending: false, referencedTable: "notes" });

  if (error) throw error;
  return (data ?? []).map((r: any) => r.notes).filter(Boolean);
}

export async function fetchPageNotes(pageId: string): Promise<DbNote[]> {
  const sb = createClient();
  const { data, error } = await sb
    .from("note_routing")
    .select("notes(*)")
    .eq("page_id", pageId)
    .order("created_at", { ascending: false, referencedTable: "notes" });

  if (error) throw error;
  return (data ?? []).map((r: any) => r.notes).filter(Boolean);
}

export async function createNote(input: {
  content: string;
  hashtags: string[];
}): Promise<{ note: DbNote; routedTo: string[] }> {
  const sb = createClient();
  const noteId = crypto.randomUUID();

  // Insert the note
  const { data: note, error } = await sb
    .from("notes")
    .insert({
      id: noteId,
      workspace_id: DEFAULT_WORKSPACE_ID,
      content: input.content,
      hashtags: input.hashtags,
    })
    .select()
    .single();

  if (error) throw error;

  // Resolve hashtags to routing destinations
  const routedTo: string[] = [];

  if (input.hashtags.length > 0) {
    const { data: matches } = await sb
      .from("workspace_hashtags")
      .select("owner_type, owner_id, hashtag")
      .eq("workspace_id", DEFAULT_WORKSPACE_ID)
      .in("hashtag", input.hashtags);

    if (matches && matches.length > 0) {
      const routingRows = matches.map((m: any) => ({
        note_id: noteId,
        stream_id: m.owner_type === "stream" ? m.owner_id : null,
        page_id: m.owner_type === "page" ? m.owner_id : null,
      }));

      await sb.from("note_routing").insert(routingRows);
      routedTo.push(...matches.map((m: any) => m.hashtag));
    }
  }

  return { note, routedTo };
}

/** Route an existing note to a stream (used by Inbox "Route" action) */
export async function routeNoteToStream(
  noteId: string,
  streamId: string
): Promise<void> {
  const sb = createClient();
  await sb.from("note_routing").insert({
    note_id: noteId,
    stream_id: streamId,
    page_id: null,
  });
}

/* ── Tasks ── */

export interface DbTask {
  id: string;
  stream_id: string | null;
  page_id: string | null;
  title: string;
  due_date: string | null;
  priority: "low" | "medium" | "high";
  done: boolean;
  created_at: string;
}

export async function fetchTasks(): Promise<DbTask[]> {
  const sb = createClient();
  const { data, error } = await sb
    .from("tasks")
    .select("*")
    .eq("workspace_id", DEFAULT_WORKSPACE_ID)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function createTask(input: {
  title: string;
  dueDate: string | null;
  priority: "low" | "medium" | "high";
  streamId: string | null;
  pageId: string | null;
}): Promise<DbTask> {
  const sb = createClient();
  const { data, error } = await sb
    .from("tasks")
    .insert({
      workspace_id: DEFAULT_WORKSPACE_ID,
      title: input.title,
      due_date: input.dueDate,
      priority: input.priority,
      stream_id: input.streamId,
      page_id: input.pageId,
      done: false,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function toggleTaskDone(
  taskId: string,
  done: boolean
): Promise<void> {
  const sb = createClient();
  const { error } = await sb
    .from("tasks")
    .update({ done })
    .eq("id", taskId);

  if (error) throw error;
}

/* ── Hashtag lookup (for routing resolution) ── */

export async function lookupHashtag(
  hashtag: string
): Promise<{ ownerType: "stream" | "page"; ownerId: string } | null> {
  const sb = createClient();
  const { data } = await sb
    .from("workspace_hashtags")
    .select("owner_type, owner_id")
    .eq("workspace_id", DEFAULT_WORKSPACE_ID)
    .eq("hashtag", hashtag)
    .single();

  if (!data) return null;
  return { ownerType: data.owner_type as "stream" | "page", ownerId: data.owner_id };
}

export async function checkHashtagExists(hashtag: string): Promise<boolean> {
  const sb = createClient();
  const { data } = await sb
    .from("workspace_hashtags")
    .select("id")
    .eq("workspace_id", DEFAULT_WORKSPACE_ID)
    .eq("hashtag", hashtag)
    .maybeSingle();

  return data !== null;
}
