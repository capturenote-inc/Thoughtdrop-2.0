"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { KNOWN_STREAMS, STREAM_PRESET_COLORS, registerStream, removeStream, type KnownStream } from "@/lib/known-streams";
import { CreateStreamModal } from "@/components/layout/create-stream-modal";
import { SettingsModal } from "@/components/layout/settings-modal";

const navItems = [
  { icon: "dashboard", label: "Dashboard", href: "/dashboard" },
  { icon: "inbox", label: "Inbox", href: "/inbox" },
  { icon: "checklist", label: "Tasks", href: "/tasks" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [expanded, setExpanded] = useState(true);
  const [streams, setStreams] = useState<KnownStream[]>(KNOWN_STREAMS);
  const [createOpen, setCreateOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; stream: KnownStream } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<KnownStream | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const contextRef = useRef<HTMLDivElement>(null);

  // Close context menu on outside click
  useEffect(() => {
    if (!contextMenu) return;
    function handleClick(e: MouseEvent) {
      if (contextRef.current && !contextRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    }
    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, [contextMenu]);

  function handleCreateStream(stream: KnownStream) {
    registerStream(stream);
    setStreams((prev) => [...prev, stream]);
    setCreateOpen(false);
    router.push(`/s/${stream.id}`);
  }

  function handleDeleteStream(stream: KnownStream) {
    removeStream(stream.id);
    setStreams((prev) => prev.filter((s) => s.id !== stream.id));
    setDeleteConfirm(null);
    if (pathname === `/s/${stream.id}`) {
      router.push("/dashboard");
    }
  }

  return (
    <>
      <aside
        className={cn(
          "h-screen sticky top-0 left-0 bg-surface-container-low flex flex-col py-6 z-10 transition-all duration-300 ease-in-out overflow-hidden",
          expanded ? "w-[240px]" : "w-[72px]"
        )}
      >
        {/* Logo + sidebar toggle */}
        <div
          className={cn(
            "mb-8 flex items-center shrink-0",
            expanded ? "px-5 justify-between" : "justify-center"
          )}
        >
          <Link href="/dashboard" className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-3xl font-bold tracking-tighter">
              water_drop
            </span>
            {expanded && (
              <span className="text-on-surface font-bold text-lg whitespace-nowrap">
                ThoughtDrop
              </span>
            )}
          </Link>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-on-surface-variant/50 hover:text-on-surface-variant transition-colors p-1 rounded-lg hover:bg-surface-variant"
            title={expanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            <span className="material-symbols-outlined text-[20px]">
              {expanded ? "left_panel_close" : "left_panel_open"}
            </span>
          </button>
        </div>

        {/* Main nav */}
        <nav
          className={cn(
            "flex flex-col gap-1",
            expanded ? "px-3" : "items-center"
          )}
        >
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center rounded-xl transition-colors",
                  expanded ? "px-4 py-3 gap-3" : "w-12 h-12 justify-center",
                  isActive
                    ? "bg-surface-container-highest text-tertiary"
                    : "text-on-surface-variant hover:bg-surface-variant"
                )}
                title={expanded ? undefined : item.label}
              >
                <span
                  className="material-symbols-outlined"
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  {item.icon}
                </span>
                {expanded && (
                  <span className="text-sm font-medium whitespace-nowrap">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Streams section */}
        <div className={cn("mt-6 flex flex-col", expanded ? "px-3" : "items-center")}>
          {/* Section header */}
          <div
            className={cn(
              "flex items-center mb-2",
              expanded ? "px-4 justify-between" : "justify-center"
            )}
          >
            {expanded && (
              <span className="text-[10px] font-bold tracking-widest uppercase text-on-surface-variant/60">
                Streams
              </span>
            )}
            <button
              onClick={() => setCreateOpen(true)}
              className="text-on-surface-variant/60 hover:text-on-surface-variant transition-colors p-0.5 rounded hover:bg-surface-variant"
              title="Create new stream"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
            </button>
          </div>

          {/* Stream list */}
          <div className={cn("flex flex-col gap-0.5", !expanded && "items-center")}>
            {streams.map((stream) => {
              const isActive = pathname === `/s/${stream.id}`;
              return (
                <Link
                  key={stream.id}
                  href={`/s/${stream.id}`}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setContextMenu({ x: e.clientX, y: e.clientY, stream });
                  }}
                  className={cn(
                    "flex items-center rounded-xl transition-colors group/stream",
                    expanded ? "px-4 py-2.5 gap-3" : "w-12 h-10 justify-center",
                    isActive
                      ? "bg-surface-container-highest text-on-surface"
                      : "text-on-surface-variant hover:bg-surface-variant"
                  )}
                  title={expanded ? undefined : stream.name}
                >
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: stream.color }}
                  />
                  {expanded && (
                    <>
                      <span className="text-sm font-medium whitespace-nowrap truncate flex-1">
                        {stream.name}
                      </span>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setContextMenu({ x: e.clientX, y: e.clientY, stream });
                        }}
                        className="opacity-0 group-hover/stream:opacity-100 text-on-surface-variant/50 hover:text-on-surface-variant transition-opacity p-0.5 rounded"
                      >
                        <span className="material-symbols-outlined text-[14px]">more_horiz</span>
                      </button>
                    </>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-grow" />

        {/* Bottom section */}
        <div
          className={cn(
            "flex flex-col gap-1",
            expanded ? "px-3" : "items-center"
          )}
        >
          {/* Settings */}
          <button
            onClick={() => setSettingsOpen(true)}
            className={cn(
              "flex items-center rounded-xl transition-colors text-on-surface-variant hover:bg-surface-variant",
              expanded ? "px-4 py-3 gap-3" : "w-12 h-12 justify-center"
            )}
            title={expanded ? undefined : "Settings"}
          >
            <span className="material-symbols-outlined">settings</span>
            {expanded && (
              <span className="text-sm font-medium whitespace-nowrap">Settings</span>
            )}
          </button>
        </div>
      </aside>

      <CreateStreamModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreateStream}
      />

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />

      {/* Context menu */}
      {contextMenu && (
        <div
          ref={contextRef}
          className="fixed z-[200] bg-surface-container-lowest rounded-lg shadow-xl border border-outline-variant/20 py-1 min-w-[160px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            onClick={() => {
              setDeleteConfirm(contextMenu.stream);
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-surface-variant transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">delete</span>
            Delete stream
          </button>
        </div>
      )}

      {/* Delete confirmation dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-8">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <h3 className="text-lg font-bold text-on-surface">
              Delete {deleteConfirm.name}?
            </h3>
            <p className="text-sm text-on-surface-variant">
              This cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="text-on-surface-variant text-sm px-4 py-2 hover:bg-surface-variant rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteStream(deleteConfirm)}
                className="bg-red-500 text-white text-sm font-semibold px-5 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
