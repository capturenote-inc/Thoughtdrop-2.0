"use client";

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
  const { theme, setTheme } = useTheme();

  return (
    <aside className="h-screen sticky top-0 left-0 w-[72px] bg-surface-container-low flex flex-col items-center py-6 z-50">
      <Link href="/dashboard" className="mb-10">
        <span className="material-symbols-outlined text-primary text-3xl font-bold tracking-tighter">
          water_drop
        </span>
      </Link>

      <nav className="flex flex-col gap-6 flex-grow items-center">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "w-12 h-12 flex items-center justify-center rounded-xl transition-colors",
                isActive
                  ? "bg-surface-container-highest text-tertiary"
                  : "text-on-surface-variant hover:bg-surface-variant"
              )}
              title={item.label}
            >
              <span
                className="material-symbols-outlined"
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {item.icon}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-col gap-6 items-center">
        {bottomItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="w-12 h-12 flex items-center justify-center text-on-surface-variant hover:bg-surface-variant rounded-xl transition-colors"
            title={item.label}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
          </Link>
        ))}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="w-12 h-12 flex items-center justify-center text-on-surface-variant hover:bg-surface-variant rounded-xl transition-colors"
          title="Toggle theme"
        >
          <span className="material-symbols-outlined">
            {theme === "dark" ? "light_mode" : "dark_mode"}
          </span>
        </button>
        <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-xs font-bold text-on-surface-variant">
          B
        </div>
      </div>
    </aside>
  );
}
