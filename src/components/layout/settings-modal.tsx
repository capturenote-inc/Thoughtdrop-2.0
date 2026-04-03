"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { KNOWN_STREAMS, removeStream, type KnownStream } from "@/lib/known-streams";

/* ── Settings nav sections ── */

type SettingsSection = "profile" | "preferences" | "workspace";

const sections: { key: SettingsSection; label: string; icon: string }[] = [
  { key: "profile", label: "Profile", icon: "person" },
  { key: "preferences", label: "Preferences", icon: "tune" },
  { key: "workspace", label: "Workspace", icon: "workspaces" },
];

/* ── Keyboard shortcuts data ── */

const shortcuts = [
  { action: "Quick capture", keys: "⌘ Shift D" },
  { action: "Global search", keys: "⌘ K" },
  { action: "Toggle sidebar", keys: "⌘ \\" },
  { action: "New task", keys: "⌘ Shift T" },
  { action: "Navigate to Dashboard", keys: "⌘ 1" },
  { action: "Navigate to Inbox", keys: "⌘ 2" },
  { action: "Navigate to Tasks", keys: "⌘ 3" },
];

/* ── Profile section ── */

function ProfileSection() {
  const [name, setName] = useState("Bryan");
  const [email, setEmail] = useState("bryan@thoughtdrop.io");
  const [saved, setSaved] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-on-surface">Profile</h2>
        <p className="text-sm text-on-surface-variant mt-1">Manage your personal information</p>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-surface-container-highest flex items-center justify-center text-xl font-bold text-on-surface-variant">
          {name.charAt(0).toUpperCase()}
        </div>
        <button className="text-sm text-tertiary font-medium hover:underline">
          Change avatar
        </button>
      </div>

      {/* Name */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-on-surface-variant">Full name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-surface-container rounded-lg px-4 py-2.5 text-sm text-on-surface outline-none focus:ring-2 focus:ring-tertiary/30"
        />
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-on-surface-variant">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-surface-container rounded-lg px-4 py-2.5 text-sm text-on-surface outline-none focus:ring-2 focus:ring-tertiary/30"
        />
      </div>

      {/* Change password */}
      <div>
        <button
          onClick={() => setPasswordOpen(true)}
          className="text-sm text-on-surface-variant font-medium hover:text-on-surface hover:bg-surface-variant px-3 py-2 rounded-lg transition-colors"
        >
          Change password
        </button>
      </div>

      {/* Save */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={handleSave}
          className="bg-tertiary text-white text-sm font-semibold px-5 py-2 rounded-lg hover:opacity-90 transition-opacity"
        >
          Save changes
        </button>
        {saved && (
          <span className="text-sm text-tertiary font-medium">Saved!</span>
        )}
      </div>

      {/* Password stub modal */}
      {passwordOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-8">
          <div className="fixed inset-0 bg-black/40" onClick={() => setPasswordOpen(false)} />
          <div className="relative bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <h3 className="text-lg font-bold text-on-surface">Change password</h3>
            <p className="text-sm text-on-surface-variant">Password management will be available once Supabase auth is integrated.</p>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setPasswordOpen(false)}
                className="text-on-surface-variant text-sm px-4 py-2 hover:bg-surface-variant rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Preferences section ── */

function PreferencesSection() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [emailNotif, setEmailNotif] = useState(true);
  const [taskReminders, setTaskReminders] = useState(true);
  const [mentions, setMentions] = useState(true);

  useEffect(() => setMounted(true), []);

  const currentTheme = mounted ? resolvedTheme : "light";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-on-surface">Preferences</h2>
        <p className="text-sm text-on-surface-variant mt-1">Customise your experience</p>
      </div>

      {/* Theme */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-on-surface-variant">Theme</label>
        <div className="flex gap-2">
          {(["light", "dark", "system"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border",
                (t === "system" ? !mounted : currentTheme === t)
                  ? "border-tertiary/40 bg-surface-container-highest text-on-surface"
                  : "border-transparent hover:bg-surface-variant text-on-surface-variant"
              )}
            >
              <span className="material-symbols-outlined text-[16px]">
                {t === "light" ? "light_mode" : t === "dark" ? "dark_mode" : "contrast"}
              </span>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Language */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-on-surface-variant">Language</label>
        <select
          defaultValue="en"
          className="w-full max-w-xs bg-surface-container rounded-lg px-4 py-2.5 text-sm text-on-surface outline-none focus:ring-2 focus:ring-tertiary/30"
        >
          <option value="en">English</option>
        </select>
      </div>

      {/* Notifications */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-on-surface-variant">Notifications</label>
        {[
          { label: "Email notifications", value: emailNotif, set: setEmailNotif },
          { label: "Task reminders", value: taskReminders, set: setTaskReminders },
          { label: "Mentions", value: mentions, set: setMentions },
        ].map((item) => (
          <div key={item.label} className="flex items-center justify-between py-1">
            <span className="text-sm text-on-surface">{item.label}</span>
            <button
              onClick={() => item.set(!item.value)}
              className={cn(
                "w-10 h-6 rounded-full transition-colors relative",
                item.value ? "bg-tertiary" : "bg-outline-variant/40"
              )}
            >
              <div
                className={cn(
                  "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                  item.value ? "translate-x-5" : "translate-x-1"
                )}
              />
            </button>
          </div>
        ))}
      </div>

      {/* Keyboard shortcuts */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-on-surface-variant">Keyboard shortcuts</label>
        <div className="bg-surface-container rounded-lg overflow-hidden">
          {shortcuts.map((s, i) => (
            <div
              key={s.action}
              className={cn(
                "flex items-center justify-between px-4 py-2.5 text-sm",
                i < shortcuts.length - 1 && "border-b border-outline-variant/10"
              )}
            >
              <span className="text-on-surface">{s.action}</span>
              <kbd className="text-[11px] font-mono text-on-surface-variant/60 bg-surface-container-highest px-2 py-0.5 rounded">
                {s.keys}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Workspace section ── */

function WorkspaceSection({ onStreamsChange }: { onStreamsChange?: () => void }) {
  const [workspaceName, setWorkspaceName] = useState("Bryan's Workspace");
  const [streams, setStreams] = useState<KnownStream[]>([...KNOWN_STREAMS]);
  const [deleteTarget, setDeleteTarget] = useState<KnownStream | null>(null);
  const [deleteWorkspace, setDeleteWorkspace] = useState(false);

  function handleDeleteStream(stream: KnownStream) {
    removeStream(stream.id);
    setStreams((prev) => prev.filter((s) => s.id !== stream.id));
    setDeleteTarget(null);
    onStreamsChange?.();
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-on-surface">Workspace</h2>
        <p className="text-sm text-on-surface-variant mt-1">Manage your workspace settings</p>
      </div>

      {/* Workspace name */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-on-surface-variant">Workspace name</label>
        <input
          type="text"
          value={workspaceName}
          onChange={(e) => setWorkspaceName(e.target.value)}
          className="w-full bg-surface-container rounded-lg px-4 py-2.5 text-sm text-on-surface outline-none focus:ring-2 focus:ring-tertiary/30"
        />
      </div>

      {/* Workspace type */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-on-surface-variant">Workspace type</label>
        <div className="flex items-center gap-2 px-4 py-2.5 bg-surface-container rounded-lg">
          <span className="material-symbols-outlined text-[16px] text-on-surface-variant">person</span>
          <span className="text-sm text-on-surface-variant">Personal</span>
        </div>
      </div>

      {/* Members */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-on-surface-variant">Members</label>
        <div className="px-4 py-4 bg-surface-container rounded-lg text-center">
          <p className="text-sm text-on-surface-variant/50">Team members will appear here when you upgrade to a team workspace.</p>
        </div>
      </div>

      {/* Streams */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-on-surface-variant">Streams</label>
        <div className="bg-surface-container rounded-lg overflow-hidden">
          {streams.length === 0 ? (
            <div className="px-4 py-4 text-center">
              <p className="text-sm text-on-surface-variant/50">No streams yet</p>
            </div>
          ) : (
            streams.map((stream, i) => (
              <div
                key={stream.id}
                className={cn(
                  "flex items-center justify-between px-4 py-2.5",
                  i < streams.length - 1 && "border-b border-outline-variant/10"
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: stream.color }}
                  />
                  <span className="text-sm text-on-surface font-medium">{stream.name}</span>
                  <span className="text-[11px] text-on-surface-variant/40">#{stream.hashtag}</span>
                </div>
                <button
                  onClick={() => setDeleteTarget(stream)}
                  className="text-on-surface-variant/30 hover:text-red-500 transition-colors p-1 rounded"
                >
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Danger zone */}
      <div className="space-y-2 pt-4 border-t border-outline-variant/20">
        <label className="text-xs font-bold tracking-widest uppercase text-red-500">Danger zone</label>
        <div className="flex items-center justify-between bg-surface-container rounded-lg px-4 py-3">
          <div>
            <p className="text-sm font-medium text-on-surface">Delete workspace</p>
            <p className="text-[11px] text-on-surface-variant/50">Permanently delete this workspace and all its data</p>
          </div>
          <button
            onClick={() => setDeleteWorkspace(true)}
            className="text-red-500 text-sm font-semibold px-4 py-1.5 rounded-lg border border-red-500/30 hover:bg-red-500/10 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Delete stream confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-8">
          <div className="fixed inset-0 bg-black/40" onClick={() => setDeleteTarget(null)} />
          <div className="relative bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <h3 className="text-lg font-bold text-on-surface">Delete {deleteTarget.name}?</h3>
            <p className="text-sm text-on-surface-variant">This will remove the stream and unlink all associated notes. This cannot be undone.</p>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setDeleteTarget(null)} className="text-on-surface-variant text-sm px-4 py-2 hover:bg-surface-variant rounded-lg transition-colors">
                Cancel
              </button>
              <button onClick={() => handleDeleteStream(deleteTarget)} className="bg-red-500 text-white text-sm font-semibold px-5 py-2 rounded-lg hover:bg-red-600 transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete workspace confirmation */}
      {deleteWorkspace && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-8">
          <div className="fixed inset-0 bg-black/40" onClick={() => setDeleteWorkspace(false)} />
          <div className="relative bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <h3 className="text-lg font-bold text-on-surface">Delete workspace?</h3>
            <p className="text-sm text-on-surface-variant">This action is permanent and will delete all streams, notes, and tasks in this workspace.</p>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setDeleteWorkspace(false)} className="text-on-surface-variant text-sm px-4 py-2 hover:bg-surface-variant rounded-lg transition-colors">
                Cancel
              </button>
              <button onClick={() => setDeleteWorkspace(false)} className="bg-red-500 text-white text-sm font-semibold px-5 py-2 rounded-lg hover:bg-red-600 transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Main settings modal ── */

export function SettingsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [section, setSection] = useState<SettingsSection>("profile");

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  // Reset to Profile tab when opened
  useEffect(() => {
    if (open) setSection("profile");
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-8">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-[900px] h-[600px] overflow-hidden flex">
        {/* Left nav */}
        <div className="w-[220px] bg-surface-container-low flex flex-col py-6 px-3 shrink-0 border-r border-outline-variant/10">
          <h2 className="text-sm font-bold text-on-surface px-3 mb-4">Settings</h2>
          <nav className="flex flex-col gap-0.5">
            {sections.map((s) => (
              <button
                key={s.key}
                onClick={() => setSection(s.key)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left",
                  section === s.key
                    ? "bg-surface-container-highest text-on-surface"
                    : "text-on-surface-variant hover:bg-surface-variant"
                )}
              >
                <span
                  className="material-symbols-outlined text-[20px]"
                  style={section === s.key ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  {s.icon}
                </span>
                {s.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Right content */}
        <div className="flex-1 overflow-y-auto p-8">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface p-1.5 rounded-lg hover:bg-surface-variant transition-colors z-10"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>

          {section === "profile" && <ProfileSection />}
          {section === "preferences" && <PreferencesSection />}
          {section === "workspace" && <WorkspaceSection />}
        </div>
      </div>
    </div>
  );
}
