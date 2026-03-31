"use client";

import { Button } from "@/components/ui/button";
import { useQuickCapture } from "@/components/quick-capture-provider";

interface HeaderProps {
  breadcrumb?: string;
}

export function Header({ breadcrumb = "Dashboard" }: HeaderProps) {
  const { open } = useQuickCapture();

  return (
    <header className="w-full h-16 sticky top-0 z-40 bg-surface flex items-center justify-between px-8">
      <span className="text-on-surface-variant text-sm font-medium">
        Workspace / <span className="text-on-surface">{breadcrumb}</span>
      </span>

      <div className="flex items-center gap-6">
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
  );
}
