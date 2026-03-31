"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: "dashboard", label: "Dashboard", href: "/dashboard" },
  { icon: "inbox", label: "Inbox", href: "/inbox" },
  { icon: "search", label: "Search", href: "/search" },
  { icon: "grid_view", label: "Workspaces", href: "/workspaces" },
  { icon: "settings", label: "Settings", href: "/settings" },
];

const bottomItems = [
  { icon: "help", label: "Help", href: "/help" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <aside
      className={cn(
        "h-screen sticky top-0 left-0 bg-surface-container-low flex flex-col items-center py-6 z-50 transition-all duration-300 ease-in-out overflow-hidden",
        expanded ? "w-[240px]" : "w-[72px]"
      )}
    >
      <Link
        href="/dashboard"
        className={cn("mb-10 flex items-center gap-3", expanded && "self-start px-5")}
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

      <nav
        className={cn(
          "flex flex-col gap-2 flex-grow w-full",
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
                expanded
                  ? "px-4 py-3 gap-3"
                  : "w-12 h-12 justify-center",
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

        <button
          onClick={() => setExpanded(!expanded)}
          className={cn(
            "flex items-center rounded-xl transition-colors text-on-surface-variant hover:bg-surface-variant mt-2",
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
      </nav>

      <div
        className={cn(
          "flex flex-col gap-4 w-full",
          expanded ? "px-3" : "items-center"
        )}
      >
        {bottomItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center rounded-xl transition-colors text-on-surface-variant hover:bg-surface-variant",
              expanded ? "px-4 py-3 gap-3" : "w-12 h-12 justify-center"
            )}
            title={expanded ? undefined : item.label}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            {expanded && (
              <span className="text-sm font-medium whitespace-nowrap">
                {item.label}
              </span>
            )}
          </Link>
        ))}
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
        <div
          className={cn(
            "flex items-center gap-3",
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
  );
}
