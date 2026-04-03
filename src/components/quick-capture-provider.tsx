"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { QuickCaptureModal } from "@/features/editor/quick-capture-modal";
import { ExpandedCaptureModal } from "@/features/editor/expanded-capture-modal";
import { CreateStreamModal } from "@/components/layout/create-stream-modal";
import { registerStream, type KnownStream } from "@/lib/known-streams";

interface QuickCaptureContextType {
  open: () => void;
}

const QuickCaptureContext = createContext<QuickCaptureContextType>({ open: () => {} });

export function useQuickCapture() {
  return useContext(QuickCaptureContext);
}

export function QuickCaptureProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedOpen, setExpandedOpen] = useState(false);
  const [expandedContent, setExpandedContent] = useState("");
  const [expandedMode, setExpandedMode] = useState<"note" | "task">("note");
  const [createStreamOpen, setCreateStreamOpen] = useState(false);
  const [pendingTag, setPendingTag] = useState("");

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const handleExpand = useCallback((content: string, type: "note" | "task") => {
    setIsOpen(false);
    setExpandedContent(content);
    setExpandedMode(type);
    setExpandedOpen(true);
  }, []);

  const closeExpanded = useCallback(() => {
    setExpandedOpen(false);
    setExpandedContent("");
  }, []);

  const handleUnknownTag = useCallback((tag: string) => {
    setPendingTag(tag);
    setCreateStreamOpen(true);
  }, []);

  const handleCreateStream = useCallback((stream: KnownStream) => {
    registerStream(stream);
    setCreateStreamOpen(false);
    setPendingTag("");
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "d") {
        e.preventDefault();
        e.stopPropagation();
        setIsOpen((prev) => !prev);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <QuickCaptureContext.Provider value={{ open }}>
      {children}
      <QuickCaptureModal
        open={isOpen}
        onClose={close}
        onExpand={handleExpand}
        onUnknownTag={handleUnknownTag}
      />
      <ExpandedCaptureModal
        open={expandedOpen}
        onClose={closeExpanded}
        initialContent={expandedContent}
        mode={expandedMode}
        onUnknownTag={handleUnknownTag}
      />
      <CreateStreamModal
        open={createStreamOpen}
        onClose={() => { setCreateStreamOpen(false); setPendingTag(""); }}
        onCreate={handleCreateStream}
        initialName={pendingTag}
      />
    </QuickCaptureContext.Provider>
  );
}
