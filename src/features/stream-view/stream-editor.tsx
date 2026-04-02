"use client";

import { useRef, useEffect, useCallback } from "react";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";

interface StreamEditorProps {
  streamColor: string;
}

export function StreamEditor({ streamColor }: StreamEditorProps) {
  const lastSavedRef = useRef<string>("");

  const editor = useCreateBlockNote({
    domAttributes: {
      editor: {
        class: "stream-blocknote-editor",
      },
    },
  });

  const handleSave = useCallback(() => {
    const json = JSON.stringify(editor.document);
    if (json !== lastSavedRef.current && json !== '[{"id":"initialBlockId","type":"paragraph","props":{"textColor":"default","backgroundColor":"default","textAlignment":"left"},"content":[],"children":[]}]') {
      lastSavedRef.current = json;
      // Stub: will save to Supabase later
    }
  }, [editor]);

  // Auto-save every 3 seconds
  useEffect(() => {
    const interval = setInterval(handleSave, 3000);
    return () => clearInterval(interval);
  }, [handleSave]);

  return (
    <div className="stream-editor-wrapper flex-1 min-h-0" style={{ position: "relative", zIndex: 50, isolation: "isolate" }}>
      <style>{`
        .stream-blocknote-editor {
          font-family: inherit;
          padding: 0;
        }
        .stream-editor-wrapper .bn-editor {
          background: transparent;
          padding-inline: 54px;
          padding-block: 0;
          color: var(--color-on-surface, #1C1B1F);
        }
        .stream-editor-wrapper .bn-container {
          background: transparent;
          border: none;
          font-family: inherit;
        }
        /* Dark mode text fix */
        .dark .stream-editor-wrapper .bn-editor,
        .dark .stream-editor-wrapper [data-content-type] {
          color: #E6E1E5;
        }
        .dark .stream-editor-wrapper .bn-inline-content {
          color: #E6E1E5;
        }
        /* Ensure side menu (drag handle + add button) is visible and not clipped */
        .stream-editor-wrapper .bn-side-menu {
          display: flex !important;
          opacity: 1;
        }
        /* Tint the slash menu active item with stream colour */
        .stream-editor-wrapper .bn-suggestion-menu .bn-suggestion-menu-item[aria-selected="true"] {
          background-color: ${streamColor}18;
        }
      `}</style>
      <BlockNoteView
        editor={editor}
        theme="light"
        sideMenu={true}
        slashMenu={true}
      />
    </div>
  );
}
