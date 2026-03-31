"use client";

import { useState, useEffect, useCallback } from "react";

interface QuickCaptureModalProps {
  open: boolean;
  onClose: () => void;
}

export function QuickCaptureModal({ open, onClose }: QuickCaptureModalProps) {
  const [content, setContent] = useState("");
  const [type, setType] = useState<"note" | "task">("note");

  useEffect(() => {
    if (open) {
      setContent("");
      setType("note");
    }
  }, [open]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && open) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative bg-surface-container-lowest dark:bg-surface-container-high rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-200">
        <div className="flex items-center justify-between">
          <h3 className="text-on-surface font-bold text-lg">Quick Capture</h3>
          <div className="flex gap-1">
            <button
              onClick={() => setType("note")}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                type === "note"
                  ? "bg-tertiary-container text-on-tertiary-container"
                  : "bg-surface-container text-on-surface-variant hover:bg-surface-variant"
              }`}
            >
              Note
            </button>
            <button
              onClick={() => setType("task")}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                type === "task"
                  ? "bg-tertiary-container text-on-tertiary-container"
                  : "bg-surface-container text-on-surface-variant hover:bg-surface-variant"
              }`}
            >
              Task
            </button>
          </div>
        </div>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={type === "note" ? "Drop a thought..." : "What needs to be done?"}
          autoFocus
          rows={4}
          className="w-full bg-transparent text-on-surface placeholder:text-on-surface-variant/40 outline-none resize-none text-sm leading-relaxed"
        />

        <div className="flex items-center justify-between pt-2 border-t border-outline-variant/20">
          <div className="text-[10px] text-on-surface-variant font-medium">
            Use #hashtags to route to a page
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="text-on-surface-variant text-sm px-4 py-2 hover:bg-surface-variant rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                // Stub: will save to Supabase later
                onClose();
              }}
              disabled={!content.trim()}
              className="bg-primary text-on-primary text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
