"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useQuickCapture } from "@/components/quick-capture-provider";
import { findStreamById } from "@/lib/known-streams";

const routeLabels: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/inbox": "Inbox",
  "/tasks": "Tasks",
  "/workspaces": "Workspaces",
  "/settings": "Settings",
};

function getBreadcrumb(pathname: string): string {
  if (routeLabels[pathname]) return routeLabels[pathname];
  // /s/[id] → stream name
  const streamMatch = pathname.match(/^\/s\/(.+)$/);
  if (streamMatch) {
    const stream = findStreamById(streamMatch[1]);
    return stream?.name ?? "Stream";
  }
  return pathname.split("/").pop() ?? "Dashboard";
}

export function Header() {
  const { open } = useQuickCapture();
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();
  const breadcrumb = getBreadcrumb(pathname);

  return (
    <>
      <header className="w-full h-16 sticky top-0 z-40 bg-surface flex items-center justify-between px-8 gap-4">
        <span className="text-on-surface-variant text-sm font-medium shrink-0">
          Workspace / <span className="text-on-surface">{breadcrumb}</span>
        </span>

        {/* Search bar */}
        <button
          onClick={() => setSearchOpen(true)}
          className="flex-1 max-w-xl flex items-center gap-2 bg-surface-container hover:bg-surface-container-high rounded-xl px-4 py-2 transition-colors cursor-text"
        >
          <span className="material-symbols-outlined text-on-surface-variant text-[18px]">search</span>
          <span className="text-on-surface-variant/50 text-sm">Search notes, tasks, streams...</span>
        </button>

        <div className="flex items-center gap-6 shrink-0">
          <div className="flex -space-x-2">
            <div className="w-8 h-8 rounded-full border-2 border-surface bg-surface-container-highest flex items-center justify-center text-[10px] font-bold">
              A
            </div>
            <div className="w-8 h-8 rounded-full border-2 border-surface bg-surface-container flex items-center justify-center text-[10px] font-bold">
              B
            </div>
          </div>

          <button className="text-on-surface-variant hover:text-primary transition-opacity cursor-default">
            <span className="material-symbols-outlined">notifications</span>
          </button>

          <Button
            onClick={open}
            className="bg-primary text-on-primary px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:opacity-90"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Add Note
          </Button>
        </div>
      </header>

      {/* Search modal stub */}
      {searchOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh]">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSearchOpen(false)} />
          <div className="relative bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4">
              <span className="material-symbols-outlined text-on-surface-variant text-[22px]">search</span>
              <input
                type="text"
                placeholder="Search notes, tasks, streams..."
                autoFocus
                className="flex-1 bg-transparent text-on-surface placeholder:text-on-surface-variant/40 outline-none text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Escape") setSearchOpen(false);
                }}
              />
              <kbd className="text-[10px] text-on-surface-variant/50 font-mono bg-surface-container px-1.5 py-0.5 rounded">ESC</kbd>
            </div>
            <div className="px-5 pb-5 pt-2 border-t border-outline-variant/20">
              <p className="text-on-surface-variant/40 text-xs text-center py-6">Start typing to search...</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
