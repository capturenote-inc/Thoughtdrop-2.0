"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { QuickCaptureModal } from "@/features/editor/quick-capture-modal";

interface QuickCaptureContextType {
  open: () => void;
}

const QuickCaptureContext = createContext<QuickCaptureContextType>({ open: () => {} });

export function useQuickCapture() {
  return useContext(QuickCaptureContext);
}

export function QuickCaptureProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Cmd+Shift+D (Mac) or Ctrl+Shift+D (Windows)
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "d") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <QuickCaptureContext.Provider value={{ open }}>
      {children}
      <QuickCaptureModal open={isOpen} onClose={close} />
    </QuickCaptureContext.Provider>
  );
}
