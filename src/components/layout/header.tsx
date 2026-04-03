"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useQuickCapture } from "@/components/quick-capture-provider";
import { findStreamById } from "@/lib/known-streams";
import { SearchModal } from "@/components/layout/search-modal";

const routeLabels: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/inbox": "Inbox",
  "/tasks": "Tasks",
  "/workspaces": "Workspaces",
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

  // Global Cmd+K / Ctrl+K shortcut
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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
          <span className="text-on-surface-variant/50 text-sm flex-1 text-left">Search notes, tasks, streams...</span>
          <kbd className="text-[10px] text-on-surface-variant/40 font-mono bg-surface-container-high px-1.5 py-0.5 rounded">⌘K</kbd>
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

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
