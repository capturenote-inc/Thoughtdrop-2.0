"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { findStream } from "@/lib/known-streams";

interface QuickCaptureModalProps {
  open: boolean;
  onClose: () => void;
  onExpand?: (content: string, type: "note" | "task") => void;
}

export function QuickCaptureModal({ open, onClose, onExpand }: QuickCaptureModalProps) {
  const [content, setContent] = useState("");
  const [type, setType] = useState<"note" | "task">("note");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const hashtags = useMemo(() => {
    const matches = content.match(/#(\w+)/g);
    return matches ? [...new Set(matches.map((m) => m.slice(1)))] : [];
  }, [content]);

  useEffect(() => {
    if (open) {
      setContent("");
      setType("note");
      requestAnimationFrame(() => textareaRef.current?.focus());
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  function handleSave() {
    if (!content.trim()) return;
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[28vh]">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Type toggle */}
        <div className="flex items-center gap-1 px-5 pt-5 pb-2">
          <button
            onClick={() => setType("note")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              type === "note"
                ? "bg-tertiary text-on-error"
                : "text-on-surface-variant hover:bg-surface-variant"
            }`}
          >
            <span className="material-symbols-outlined text-[14px]" style={type === "note" ? { fontVariationSettings: "'FILL' 1" } : undefined}>
              edit_square
            </span>
            Note
          </button>
          <button
            onClick={() => setType("task")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              type === "task"
                ? "bg-tertiary text-on-error"
                : "text-on-surface-variant hover:bg-surface-variant"
            }`}
          >
            <span className="material-symbols-outlined text-[14px]" style={type === "task" ? { fontVariationSettings: "'FILL' 1" } : undefined}>
              radio_button_unchecked
            </span>
            Task
          </button>
        </div>

        {/* Content — hashtag text colored inline via CSS highlights would need ContentEditable;
             for now the textarea is plain and the pills below provide the color feedback */}
        <div className="px-5 py-3">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSave();
              }
            }}
            placeholder={type === "note" ? "Drop a thought..." : "What needs to be done?"}
            rows={2}
            className="w-full bg-transparent text-on-surface placeholder:text-on-surface-variant/40 outline-none resize-none text-sm leading-relaxed"
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 pb-4 pt-1">
          <div className="flex items-center gap-2 flex-wrap min-h-[28px]">
            {hashtags.length > 0 ? (
              hashtags.map((tag) => {
                const stream = findStream(tag);
                return stream ? (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full text-white"
                    style={{ backgroundColor: stream.color }}
                  >
                    <span className="text-[10px] font-bold">#</span>
                    {tag}
                  </span>
                ) : (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 bg-surface-container-highest text-on-surface-variant text-xs font-semibold px-2.5 py-1 rounded-full"
                  >
                    <span className="text-[10px] font-bold">#</span>
                    {tag}
                    <button
                      className="ml-0.5 hover:text-on-surface transition-colors"
                      title={`Create stream "${tag}"`}
                      onClick={(e) => {
                        e.stopPropagation();
                        // Stub: will create page in Supabase later
                      }}
                    >
                      <span className="material-symbols-outlined text-[12px]">add</span>
                    </button>
                  </span>
                );
              })
            ) : (
              <span className="text-[11px] text-on-surface-variant/50 font-medium">
                Use #hashtags to route to a stream
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onExpand?.(content, type)}
              className="text-on-surface-variant hover:text-on-surface transition-colors p-1.5 rounded-lg hover:bg-surface-variant"
              title="Expand to full editor"
            >
              <span className="material-symbols-outlined text-[18px]">open_in_full</span>
            </button>
            <button
              onClick={handleSave}
              disabled={!content.trim()}
              className="bg-inverse-surface text-inverse-on-surface text-xs font-semibold px-5 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-30"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
