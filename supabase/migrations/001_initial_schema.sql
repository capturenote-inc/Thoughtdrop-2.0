-- ThoughtDrop — initial schema
-- Run in the Supabase SQL editor or via supabase db push

-- ────────────────────────────────────────────────────────────
-- ENUMS
-- ────────────────────────────────────────────────────────────

create type task_priority as enum ('low', 'medium', 'high');

-- ────────────────────────────────────────────────────────────
-- WORKSPACES
-- ────────────────────────────────────────────────────────────

create table workspaces (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  created_at  timestamptz not null default now()
);

-- ────────────────────────────────────────────────────────────
-- WORKSPACE-SCOPED HASHTAG REGISTRY
--
-- Single source of truth for hashtag uniqueness within a
-- workspace. Both streams and pages insert here on creation.
-- A unique constraint on (workspace_id, hashtag) enforces
-- that no two routable nodes share a tag.
-- ────────────────────────────────────────────────────────────

create table workspace_hashtags (
  id            uuid primary key default gen_random_uuid(),
  workspace_id  uuid not null references workspaces(id) on delete cascade,
  hashtag       text not null,
  -- What owns this hashtag
  owner_type    text not null check (owner_type in ('stream', 'page')),
  owner_id      uuid not null,
  created_at    timestamptz not null default now(),

  constraint uq_workspace_hashtag unique (workspace_id, hashtag)
);

create index idx_workspace_hashtags_lookup
  on workspace_hashtags (workspace_id, hashtag);

-- ────────────────────────────────────────────────────────────
-- STREAMS
-- ────────────────────────────────────────────────────────────

create table streams (
  id            uuid primary key default gen_random_uuid(),
  workspace_id  uuid not null references workspaces(id) on delete cascade,
  name          text not null,
  hashtag       text not null,
  colour        text not null default '#6B7280',
  cover_image   text,          -- gradient string or image URL
  created_at    timestamptz not null default now(),

  -- Hashtag must be unique within the workspace (also enforced
  -- at the workspace_hashtags level, but this gives a fast
  -- per-table constraint for direct queries).
  constraint uq_stream_hashtag unique (workspace_id, hashtag)
);

create index idx_streams_workspace on streams (workspace_id);

-- ────────────────────────────────────────────────────────────
-- PAGES  (sub-pages of streams, infinitely nestable)
-- ────────────────────────────────────────────────────────────

create table pages (
  id              uuid primary key default gen_random_uuid(),
  stream_id       uuid not null references streams(id) on delete cascade,
  parent_page_id  uuid references pages(id) on delete cascade,  -- null = direct child of stream
  name            text not null,
  hashtag         text not null,
  colour          text not null default '#6B7280',
  created_at      timestamptz not null default now(),

  -- Same workspace-level uniqueness is enforced via
  -- workspace_hashtags; this constraint is scoped to the
  -- stream for belt-and-suspenders safety.
  constraint uq_page_hashtag_per_stream unique (stream_id, hashtag)
);

create index idx_pages_stream   on pages (stream_id);
create index idx_pages_parent   on pages (parent_page_id);

-- ────────────────────────────────────────────────────────────
-- NOTES
-- ────────────────────────────────────────────────────────────

create table notes (
  id          uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  content     text not null default '',
  hashtags    text[] not null default '{}',   -- raw tags parsed from content
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index idx_notes_workspace  on notes (workspace_id);
create index idx_notes_hashtags   on notes using gin (hashtags);
create index idx_notes_created    on notes (created_at desc);

-- Auto-update updated_at on every row change
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_notes_updated_at
  before update on notes
  for each row execute function update_updated_at();

-- ────────────────────────────────────────────────────────────
-- NOTE ROUTING
--
-- One row per destination. A note tagged #webdev #design
-- produces two rows: one pointing to the webdev stream,
-- one to the design stream. Sub-page routing works the
-- same way via page_id.
--
-- Exactly one of stream_id / page_id should be non-null.
-- ────────────────────────────────────────────────────────────

create table note_routing (
  id          uuid primary key default gen_random_uuid(),
  note_id     uuid not null references notes(id) on delete cascade,
  stream_id   uuid references streams(id) on delete cascade,
  page_id     uuid references pages(id) on delete cascade,

  constraint chk_one_destination check (
    (stream_id is not null and page_id is null) or
    (stream_id is null and page_id is not null)
  ),

  -- Prevent duplicate routing rows
  constraint uq_note_stream unique (note_id, stream_id),
  constraint uq_note_page   unique (note_id, page_id)
);

create index idx_note_routing_note   on note_routing (note_id);
create index idx_note_routing_stream on note_routing (stream_id);
create index idx_note_routing_page   on note_routing (page_id);

-- ────────────────────────────────────────────────────────────
-- TASKS
-- ────────────────────────────────────────────────────────────

create table tasks (
  id            uuid primary key default gen_random_uuid(),
  workspace_id  uuid not null references workspaces(id) on delete cascade,
  stream_id     uuid references streams(id) on delete set null,
  page_id       uuid references pages(id) on delete set null,
  title         text not null,
  due_date      date,
  priority      task_priority not null default 'medium',
  done          boolean not null default false,
  created_at    timestamptz not null default now()
);

create index idx_tasks_workspace on tasks (workspace_id);
create index idx_tasks_stream    on tasks (stream_id);
create index idx_tasks_page      on tasks (page_id);
create index idx_tasks_due       on tasks (due_date) where not done;

-- ────────────────────────────────────────────────────────────
-- RLS — disabled for now (enable when auth is wired)
-- ────────────────────────────────────────────────────────────

alter table workspaces       disable row level security;
alter table workspace_hashtags disable row level security;
alter table streams          disable row level security;
alter table pages            disable row level security;
alter table notes            disable row level security;
alter table note_routing     disable row level security;
alter table tasks            disable row level security;
