"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { KNOWN_STREAMS, STREAM_PRESET_COLORS, type KnownStream } from "@/lib/known-streams";
import { CreateStreamModal } from "@/components/layout/create-stream-modal";

const navItems = [
  { icon: "dashboard", label: "Dashboard", href: "/dashboard" },
  { icon: "inbox", label: "Inbox", href: "/inbox" },
  { icon: "search", label: "Search", href: "/search" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [streams, setStreams] = useState<KnownStream[]>(KNOWN_STREAMS);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  function handleCreateStream(stream: KnownStream) {
    setStreams((prev) => [...prev, stream]);
    setCreateOpen(false);
    router.push(`/s/${stream.id}`);
  }

  return (
    <>
      <aside
        className={cn(
          "h-screen sticky top-0 left-0 bg-surface-container-low flex flex-col py-6 z-50 transition-all duration-300 ease-in-out overflow-hidden",
          expanded ? "w-[240px]" : "w-[72px]"
        )}
      >
        {/* Logo */}
        <Link
          href="/dashboard"
          className={cn(
            "mb-8 flex items-center gap-3 shrink-0",
            expanded ? "px-5" : "justify-center"
          )}
        >
          <span className="material-symbols-outlined text-primary text-3xl font-bold tracking-tighter">
            water_drop
          </span>
          {expanded && (
            <span className="text-on-surface font-bold text-lg whitespace-nowrap">
              ThoughtDrop
            </span>
          )}
        </Link>

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
                  className={cn(
                    "flex items-center rounded-xl transition-colors",
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
                    <span className="text-sm font-medium whitespace-nowrap truncate">
                      {stream.name}
                    </span>
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
          <Link
            href="/settings"
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
          </Link>

          {/* Collapse toggle */}
          <button
            onClick={() => setExpanded(!expanded)}
            className={cn(
              "flex items-center rounded-xl transition-colors text-on-surface-variant hover:bg-surface-variant",
              expanded ? "px-4 py-3 gap-3" : "w-12 h-12 justify-center"
            )}
            title={expanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            <span
              className={cn(
                "material-symbols-outlined transition-transform duration-300",
                expanded && "rotate-180"
              )}
            >
              chevron_right
            </span>
            {expanded && (
              <span className="text-sm font-medium whitespace-nowrap">Collapse</span>
            )}
          </button>

          {/* Dark mode toggle */}
          <button
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className={cn(
              "flex items-center rounded-xl transition-colors text-on-surface-variant hover:bg-surface-variant",
              expanded ? "px-4 py-3 gap-3" : "w-12 h-12 justify-center"
            )}
            title="Toggle theme"
          >
            <span className="material-symbols-outlined">
              {mounted ? (resolvedTheme === "dark" ? "light_mode" : "dark_mode") : "dark_mode"}
            </span>
            {expanded && (
              <span className="text-sm font-medium whitespace-nowrap">
                {mounted ? (resolvedTheme === "dark" ? "Light mode" : "Dark mode") : "Theme"}
              </span>
            )}
          </button>

          {/* User avatar */}
          <div
            className={cn(
              "flex items-center gap-3 mt-2",
              expanded ? "px-4 py-2" : "justify-center"
            )}
          >
            <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-xs font-bold text-on-surface-variant shrink-0">
              B
            </div>
            {expanded && (
              <div className="min-w-0">
                <p className="text-sm font-medium text-on-surface truncate">Bryan</p>
                <p className="text-[10px] text-on-surface-variant truncate">Personal workspace</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      <CreateStreamModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreateStream}
      />
    </>
  );
}
