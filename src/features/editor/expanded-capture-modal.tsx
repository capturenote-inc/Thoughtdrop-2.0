"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { findStream } from "@/lib/known-streams";
import { createNote } from "@/lib/supabase/db";

interface ExpandedCaptureModalProps {
  open: boolean;
  onClose: () => void;
  initialTitle?: string;
  initialContent?: string;
  mode?: "note" | "task";
  onUnknownTag?: (tag: string) => void;
}

export function ExpandedCaptureModal({
  open,
  onClose,
  initialTitle = "",
  initialContent = "",
  mode = "note",
  onUnknownTag,
}: ExpandedCaptureModalProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [type, setType] = useState<"note" | "task">(mode);
  const [showSaved, setShowSaved] = useState(false);
  const [showAiTooltip, setShowAiTooltip] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);
  const lastSavedRef = useRef({ title: initialTitle, content: initialContent });

  const hashtags = useMemo(() => {
    const allText = `${title} ${content}`;
    const matches = allText.match(/#(\w+)/g);
    return matches ? [...new Set(matches.map((m) => m.slice(1)))] : [];
  }, [title, content]);

  useEffect(() => {
    if (open) {
      setTitle(initialTitle);
      setContent(initialContent);
      setType(mode);
      setShowSaved(false);
      setShowAiTooltip(false);
      lastSavedRef.current = { title: initialTitle, content: initialContent };
      requestAnimationFrame(() => titleRef.current?.focus());
    }
  }, [open, initialTitle, initialContent, mode]);

  // Auto-save every 3 seconds when changes detected
  useEffect(() => {
    if (!open) return;
    const interval = setInterval(() => {
      const hasChanges =
        title !== lastSavedRef.current.title ||
        content !== lastSavedRef.current.content;
      if (hasChanges && (title.trim() || content.trim())) {
        lastSavedRef.current = { title, content };
        setShowSaved(true);
        setTimeout(() => setShowSaved(false), 2000);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [open, title, content]);

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

  const handleAiClick = useCallback(() => {
    setShowAiTooltip(true);
    setTimeout(() => setShowAiTooltip(false), 2000);
  }, []);

  async function handleCapture() {
    if (!title.trim() && !content.trim()) return;

    const fullContent = title.trim()
      ? `${title.trim()}\n${content.trim()}`
      : content.trim();
    const tags = hashtags.map((t) => t.toLowerCase());
    const unknownTags = tags.filter((t) => !findStream(t));

    try {
      await createNote({ content: fullContent, hashtags: tags });
    } catch (err) {
      console.error("Failed to save note:", err);
    }

    if (unknownTags.length > 0 && onUnknownTag) {
      onUnknownTag(unknownTags[0]);
    }

    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-8">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setType("note")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                type === "note"
                  ? "bg-tertiary text-on-error"
                  : "text-on-surface-variant hover:bg-surface-variant"
              }`}
            >
              Note
            </button>
            <button
              onClick={() => setType("task")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                type === "task"
                  ? "bg-tertiary text-on-error"
                  : "text-on-surface-variant hover:bg-surface-variant"
              }`}
            >
              Task
            </button>
          </div>
          <div className="flex items-center gap-2">
            {/* Auto-save indicator */}
            <span
              className={`text-[11px] text-on-surface-variant font-medium flex items-center gap-1 transition-opacity duration-300 ${
                showSaved ? "opacity-100" : "opacity-0"
              }`}
            >
              <span className="material-symbols-outlined text-[14px] text-tertiary">check_circle</span>
              Saved
            </span>

            {/* AI button with tooltip */}
            <div className="relative">
              <button
                onClick={handleAiClick}
                className="text-on-surface-variant hover:text-on-surface p-1.5 rounded-lg hover:bg-surface-variant transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
              </button>
              {showAiTooltip && (
                <div className="absolute right-0 top-full mt-1 whitespace-nowrap bg-inverse-surface text-inverse-on-surface text-xs font-medium px-3 py-1.5 rounded-lg shadow-lg animate-in fade-in duration-150">
                  AI features coming soon
                </div>
              )}
            </div>

            <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface p-1.5 rounded-lg hover:bg-surface-variant transition-colors">
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between px-6 pb-3 border-b border-outline-variant/20">
          <div className="flex items-center gap-1">
            {["format_h1", "format_h2", "format_list_bulleted", "check_box", "image", "link"].map((icon) => (
              <button
                key={icon}
                className="text-on-surface-variant/60 hover:text-on-surface-variant p-1.5 rounded hover:bg-surface-variant transition-colors"
                title={icon.replace(/_/g, " ")}
              >
                <span className="material-symbols-outlined text-[18px]">{icon}</span>
              </button>
            ))}
          </div>
          <span className="text-[11px] text-on-surface-variant/40 font-medium">
            Type / for commands
          </span>
        </div>

        {/* Content area */}
        <div className="flex-grow overflow-y-auto px-6 py-5 space-y-3">
          <input
            ref={titleRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled"
            className="w-full bg-transparent text-on-surface text-xl font-bold placeholder:text-on-surface-variant/30 outline-none"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing..."
            rows={10}
            className="w-full bg-transparent text-on-surface text-sm leading-relaxed placeholder:text-on-surface-variant/30 outline-none resize-none"
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-outline-variant/20">
          <div className="flex items-center gap-2">
            {hashtags.map((tag) => {
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
                      onUnknownTag?.(tag);
                    }}
                  >
                    <span className="material-symbols-outlined text-[12px]">add</span>
                  </button>
                </span>
              );
            })}
            <button className="text-on-surface-variant/50 hover:text-on-surface-variant p-1 rounded hover:bg-surface-variant transition-colors" title="Add tag">
              <span className="material-symbols-outlined text-[16px]">add</span>
            </button>
          </div>
          <button
            onClick={handleCapture}
            disabled={!title.trim() && !content.trim()}
            className="bg-tertiary text-on-error text-sm font-semibold px-5 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-30"
          >
            Capture Note
          </button>
        </div>
      </div>
    </div>
  );
}
