# ThoughtDrop — Project Intelligence File

This file is the single source of truth for all architectural and product decisions made before development started. Read this at the start of every session before writing any code.

---

## What We're Building

**ThoughtDrop** is a note-taking web application (with desktop app later) that solves a specific problem: notes getting scattered across phone, laptop, Notion, and wherever else people write things down. The core mechanic is tag-based routing — notes automatically land in the right place based on hashtags.

The product is **note capture first**, collaboration second. The "never lose a note" promise is the north star.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js + React |
| Database + Auth + Realtime | Supabase |
| Rich Text Editor | BlockNote |
| Desktop (phase 2) | Tauri (Windows + macOS) |
| AI | Anthropic Claude API (Claude Haiku for cost efficiency) |
| Dev Environment | VS Code + Claude Code |
| Version Control | GitHub |

---

## Core Mechanic: Tag Routing

- Notes are tagged with hashtags (e.g. `#webdevelopment`)
- Each **Stream** has a corresponding hashtag and a chosen colour
- When a note is saved with a tag, it routes to the matching Stream
- A note with **multiple tags appears on all matching streams** — one record, multiple references
- Untagged notes go to the **Inbox**
- When a note is tagged (even after creation), it **leaves the Inbox**
- Tag routing happens **on save**, not in real time

### Visual Tag Feedback (while typing)
- If the hashtag matches an existing stream → the hashtag text turns the stream's colour inline + a coloured pill appears in the note footer
- If the hashtag does not match any stream → no colour change in text, but a **neutral pill appears in the footer** with a "Create stream" action
- If user creates the stream from the pill → colour is assigned, routing activates on save

---

## Streams

- Every stream has: a name, a hashtag, a colour, and an optional team
- Streams are their own project spaces — think "one-on-one meetings", "web development", "hiring"
- Streams support **bidirectional linking**: type `[[stream name]]` to link; the linked stream shows what links to it
- Streams support **templates** (phase 2): "one-on-one meeting", "project kickoff", "weekly review"
- Team members can be invited to streams; the admin sets per-member permissions

---

## Editor — Three Tiers

### Tier 1: Quick Capture
- Triggered by **Cmd+Shift+D** (web + desktop, Mac and Windows aware)
- Small modal overlay
- Plain text only — no formatting
- Hashtag detection active
- Choose at creation: **note** or **task**
- Option to expand to Tier 2

### Tier 2: Expanded Capture
- ~75% screen size modal (not full screen)
- Supports **slash commands**: headings, bullets, numbered lists, checkboxes
- Supports image input and attachments
- Still a capture tool, not a full stream editor

### Tier 3: Stream Editor (BlockNote)
- Full BlockNote implementation
- Slash commands, drag-and-drop blocks, floating toolbar
- Tables, images, attachments, all formatting
- Bidirectional links
- This is where notes live permanently on a stream

---

## Notes + Tasks

- Notes and tasks are **the same database table** (`content_items`) with a `type` field: `note` or `task`
- A note can be converted to a task and back at any time
- Tasks have: due date, priority (urgent / high / normal / low), assignee (in team context), recurring option
- **Recurring tasks** are supported: daily, weekly, monthly
- Tasks created anywhere show up in the dashboard task view

---

## Dashboard

The home screen when you open the app.

**Layout (top to bottom):**
1. Welcome back message
2. Three large visual stream shortcuts — most visited or most recent streams
3. Split view:
   - **Left**: Inbox — unrouted notes, styled as notes (not a plain list)
   - **Right**: Tasks — 5 oldest overdue / 5 due today / 5 upcoming this week

**Rules:**
- Personal only — never shows other team members' notes or tasks
- Inbox notes are yours alone, even inside a team workspace

---

## Workspaces + Auth

### Workspace Model
- Every user gets a **personal workspace on signup** — free, private, always theirs
- **Shared workspaces** are created by an admin who then invites others
- When invited to a shared workspace, a user has two areas: their private space + the shared workspace
- Admin controls **stream-level permissions** within shared workspaces

### Freemium Model
- **Solo / personal workspace**: free forever
- **Shared / team workspaces**: paid (teams tier)
- Clean line — the moment you invite someone, you pay

### Authentication
- Email + password at launch
- Google SSO added later (not universal — some teams use work domains where Google auth doesn't apply)

---

## Real-Time Collaboration

- **Phase 1**: Presence indicators — you can see who else is on a stream
- **Phase 2**: Full live cursors + simultaneous editing (Yjs-based, BlockNote native support)

---

## AI Features

All AI powered by the Anthropic Claude API.

### Phase 1
- **Tag suggestions**: as you write, AI suggests which stream the note belongs to before you type a hashtag
- **Summarisation**: summarise all notes on a stream, or summarise inbox at end of week
- **Task extraction**: AI reads a note and offers to create tasks from it

### Phase 2
- Ask your notes: chat interface, semantic search across all notes (RAG pipeline)
- Writing assistant: expand a quick note into a structured stream write-up
- Stream templates via AI

---

## Keyboard Shortcuts

| Action | Shortcut |
|---|---|
| Open quick capture | Cmd+Shift+D (Mac) / Ctrl+Shift+D (Windows) |
| Quick capture in web app | Same — consistent across web and desktop |

> Note: The app must detect the OS and apply the correct modifier key throughout the UI.

---

## Desktop App (Tauri — Phase 2)

- Target: Windows + macOS
- Built on top of the web app — same codebase wrapped in Tauri
- Supabase auth requires special handling in Tauri (browser-based OAuth flows need a custom deep link setup — plan for this before starting the desktop build)
- Mobile (iOS/Android) is a future consideration, not in current scope

---

## Data Model — Key Decisions

### `content_items` table (notes + tasks in one table)
```
id
workspace_id
stream_id (nullable — null = inbox)
user_id
type (note | task)
content (BlockNote JSON)
status (for tasks: todo | in_progress | done)
priority (for tasks: urgent | high | normal | low)
due_date (nullable)
is_recurring (boolean)
recurrence_rule (nullable)
created_at
updated_at
```

### `streams` table
```
id
workspace_id
name
hashtag (unique within workspace)
colour (hex)
created_by
created_at
```

### `stream_links` table (bidirectional linking)
```
id
source_stream_id
target_stream_id
created_at
```

### `note_streams` table (many-to-many: one note → multiple streams)
```
note_id
stream_id
```

### `workspaces` table
```
id
name
type (personal | team)
owner_id
created_at
```

### `workspace_members` table
```
workspace_id
user_id
role (admin | member)
joined_at
```

---

## Features Explicitly Out of Scope (for now)

- Gantt charts
- Time tracking
- Sprints / Agile tooling
- Kanban boards (may revisit)
- Company-wide workspaces (teams are small and bounded)
- Mobile app (web app works in mobile browser in the meantime)

---

## Development Notes

- Use `/compact` in Claude Code at ~40% context to compress history
- Reset context fully if needed — this file restores full project context
- Commit this file to the repo root — it's part of the project, not a throwaway doc
- Both developers work from the same GitHub repo; coordinate on branches before starting features

---

## Open Decisions (not yet resolved)

- Pricing amount for the teams tier
- Notification system for overdue tasks (in-app? email? push?)
- Global search — searching across all notes and streams
