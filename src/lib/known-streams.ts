export interface KnownStream {
  id: string;
  name: string;
  hashtag: string;
  color: string;
}

/**
 * A routable node — either a stream or a sub-page.
 * The routing lookup is a simple unique match on hashtag.
 */
export interface RoutableNode {
  id: string;
  name: string;
  hashtag: string;
  color: string;
  type: "stream" | "subpage";
  /** For sub-pages: the parent stream ID */
  parentStreamId?: string;
}

// Populated from Supabase on app load — no hardcoded mock data
export const KNOWN_STREAMS: KnownStream[] = [];

export const STREAM_PRESET_COLORS = [
  "#0D9488", // teal
  "#D97706", // amber
  "#7C3AED", // violet
  "#DC2626", // red
  "#2563EB", // blue
  "#059669", // emerald
  "#DB2777", // pink
  "#EA580C", // orange
  "#4F46E5", // indigo
  "#0891B2", // cyan
];

/**
 * Unified hashtag registry — all routable nodes (streams + sub-pages).
 * Hashtags are unique per workspace.
 */
// Populated at runtime from Supabase
const _allNodes: RoutableNode[] = [];

export function registerStream(stream: KnownStream) {
  if (!KNOWN_STREAMS.some((s) => s.id === stream.id)) {
    KNOWN_STREAMS.push(stream);
  }
  if (!_allNodes.some((n) => n.id === stream.id)) {
    _allNodes.push({ ...stream, type: "stream" });
  }
}

export function removeStream(id: string) {
  const idx = KNOWN_STREAMS.findIndex((s) => s.id === id);
  if (idx !== -1) KNOWN_STREAMS.splice(idx, 1);
  const nIdx = _allNodes.findIndex((n) => n.id === id);
  if (nIdx !== -1) _allNodes.splice(nIdx, 1);
}

export function registerSubPage(node: {
  id: string;
  name: string;
  hashtag: string;
  color: string;
  parentStreamId: string;
}) {
  if (!_allNodes.some((n) => n.id === node.id)) {
    _allNodes.push({ ...node, type: "subpage" });
  }
}

export function removeSubPage(id: string) {
  const idx = _allNodes.findIndex((n) => n.id === id);
  if (idx !== -1) _allNodes.splice(idx, 1);
}

export function streamNameExists(name: string): boolean {
  return KNOWN_STREAMS.some((s) => s.name.toLowerCase() === name.trim().toLowerCase());
}

/** Check if a hashtag is already taken by any stream or sub-page */
export function hashtagExists(hashtag: string): boolean {
  return _allNodes.some((n) => n.hashtag === hashtag.toLowerCase());
}

/** Find any routable node (stream or sub-page) by hashtag */
export function findStream(tag: string): RoutableNode | undefined {
  return _allNodes.find((n) => n.hashtag === tag.toLowerCase());
}

export function findStreamById(id: string): KnownStream | undefined {
  return KNOWN_STREAMS.find((s) => s.id === id);
}

/** Find any routable node by ID */
export function findNodeById(id: string): RoutableNode | undefined {
  return _allNodes.find((n) => n.id === id);
}

/** Get all routable nodes */
export function getAllNodes(): RoutableNode[] {
  return _allNodes;
}
