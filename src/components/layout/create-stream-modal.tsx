"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { STREAM_PRESET_COLORS } from "@/lib/known-streams";
import { checkHashtagExists } from "@/lib/supabase/db";

export interface CreateStreamResult {
  id: string;
  name: string;
  hashtag: string;
  color: string;
}

interface CreateStreamModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (result: CreateStreamResult) => void;
  initialName?: string;
  /** "stream" or "subpage" — changes the modal title */
  mode?: "stream" | "subpage";
}

function nameToHashtag(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, "")
    .trim();
}

export function CreateStreamModal({ open, onClose, onCreate, initialName = "", mode = "stream" }: CreateStreamModalProps) {
  const [name, setName] = useState("");
  const [hashtag, setHashtag] = useState("");
  const [hashtagEdited, setHashtagEdited] = useState(false);
  const [color, setColor] = useState(STREAM_PRESET_COLORS[0]);
  const inputRef = useRef<HTMLInputElement>(null);

  const label = mode === "subpage" ? "Sub-page" : "Stream";

  useEffect(() => {
    if (open) {
      const prefill = initialName ? initialName.charAt(0).toUpperCase() + initialName.slice(1) : "";
      setName(prefill);
      setHashtag(nameToHashtag(prefill));
      setHashtagEdited(false);
      setColor(STREAM_PRESET_COLORS[0]);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open, initialName]);

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

  function handleNameChange(value: string) {
    setName(value);
    if (!hashtagEdited) {
      setHashtag(nameToHashtag(value));
    }
  }

  const [duplicateHashtag, setDuplicateHashtag] = useState(false);

  // Check hashtag uniqueness against Supabase (debounced)
  useEffect(() => {
    if (!hashtag.trim()) { setDuplicateHashtag(false); return; }
    const timer = setTimeout(async () => {
      const exists = await checkHashtagExists(hashtag);
      setDuplicateHashtag(exists);
    }, 300);
    return () => clearTimeout(timer);
  }, [hashtag]);

  function handleCreate() {
    if (!name.trim() || !hashtag.trim() || duplicateHashtag) return;
    onCreate({
      id: crypto.randomUUID().slice(0, 8),
      name: name.trim(),
      hashtag: hashtag,
      color: color,
    });
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-8">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <h2 className="text-lg font-bold text-on-surface">Create {label}</h2>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface p-1.5 rounded-lg hover:bg-surface-variant transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Form */}
        <div className="px-6 pb-6 space-y-5">
          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface-variant">
              {label} name
            </label>
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder={mode === "subpage" ? "e.g. Rico" : "e.g. Web Development"}
              className={cn(
                "w-full bg-surface-container rounded-lg px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:ring-2",
                "focus:ring-tertiary/30"
              )}
            />
          </div>

          {/* Hashtag */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface-variant">
              Hashtag
            </label>
            <div className={cn(
              "flex items-center bg-surface-container rounded-lg px-4 py-2.5",
              duplicateHashtag && "ring-2 ring-red-500/30"
            )}>
              <span className="text-on-surface-variant text-sm font-bold mr-1">#</span>
              <input
                type="text"
                value={hashtag}
                onChange={(e) => {
                  setHashtag(nameToHashtag(e.target.value));
                  setHashtagEdited(true);
                }}
                placeholder={mode === "subpage" ? "rico" : "webdevelopment"}
                className="flex-1 bg-transparent text-sm text-on-surface placeholder:text-on-surface-variant/40 outline-none"
              />
            </div>
            {duplicateHashtag && (
              <p className="text-xs text-red-500 font-medium mt-1">
                This hashtag is already in use
              </p>
            )}
          </div>

          {/* Colour picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface-variant">
              Colour
            </label>
            <div className="flex flex-wrap gap-2">
              {STREAM_PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={cn(
                    "w-8 h-8 rounded-full transition-all flex items-center justify-center",
                    color === c
                      ? "ring-2 ring-offset-2 ring-offset-surface-container-lowest"
                      : "hover:scale-110"
                  )}
                  style={{
                    backgroundColor: c,
                    ...(color === c ? { ringColor: c } : {}),
                  }}
                  title={c}
                >
                  {color === c && (
                    <span className="material-symbols-outlined text-white text-[16px] font-bold">
                      check
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={onClose}
              className="text-on-surface-variant text-sm px-4 py-2 hover:bg-surface-variant rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={!name.trim() || !hashtag.trim() || duplicateHashtag}
              className="bg-inverse-surface text-inverse-on-surface text-sm font-semibold px-5 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-30"
            >
              Create {label}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
