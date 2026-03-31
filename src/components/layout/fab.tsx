"use client";

export function Fab() {
  return (
    <button
      className="fixed bottom-10 right-10 w-16 h-16 rounded-full flex items-center justify-center text-primary group hover:scale-105 transition-all active:scale-95 z-50 bg-white/85 dark:bg-surface-container-high/85 backdrop-blur-xl shadow-[0_10px_40px_-10px_rgba(45,52,53,0.06)]"
      aria-label="New Thought"
    >
      <span className="material-symbols-outlined text-3xl font-bold">
        edit_note
      </span>
      <span className="absolute right-20 bg-inverse-surface text-inverse-on-surface px-4 py-2 rounded-lg text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
        New Thought
      </span>
    </button>
  );
}
