export interface KnownStream {
  id: string;
  name: string;
  hashtag: string;
  color: string;
}

export const KNOWN_STREAMS: KnownStream[] = [
  { id: "webdev", name: "Web Development", hashtag: "webdev", color: "#0D9488" },
  { id: "growth", name: "Personal Growth", hashtag: "growth", color: "#D97706" },
  { id: "design", name: "Design Projects", hashtag: "design", color: "#7C3AED" },
];

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

export function findStream(tag: string): KnownStream | undefined {
  return KNOWN_STREAMS.find((s) => s.hashtag === tag.toLowerCase());
}

export function findStreamById(id: string): KnownStream | undefined {
  return KNOWN_STREAMS.find((s) => s.id === id);
}
