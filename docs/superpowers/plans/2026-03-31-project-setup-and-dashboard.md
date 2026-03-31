# ThoughtDrop Project Setup + Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Initialize the Next.js project with all tooling and implement the dashboard screen matching the design mockups (light + dark mode).

**Architecture:** Next.js 15 App Router with `src/` directory, feature-based module structure, Supabase for auth/data, Tailwind CSS + shadcn/ui for styling. Dashboard is a static UI shell first — data binding comes in a later plan.

**Tech Stack:** Next.js 15, React 19, TypeScript, pnpm, Tailwind CSS v4, shadcn/ui, @supabase/supabase-js, @supabase/ssr, Inter font (Google Fonts), Material Symbols Outlined

---

## File Structure

```
src/
├── app/
│   ├── globals.css               # Tailwind imports + custom tokens + dark mode
│   ├── layout.tsx                # Root layout: Inter font, ThemeProvider, metadata
│   ├── page.tsx                  # Redirect to /dashboard for now
│   ├── (auth)/
│   │   ├── layout.tsx            # Minimal centered layout for auth pages
│   │   ├── login/page.tsx        # Placeholder login page
│   │   └── signup/page.tsx       # Placeholder signup page
│   └── (app)/
│       ├── layout.tsx            # App shell: sidebar + header + main area
│       └── dashboard/page.tsx    # Dashboard content (page shortcuts, inbox, tasks)
├── components/
│   ├── ui/                       # shadcn/ui components (button, input, etc.)
│   └── layout/
│       ├── sidebar.tsx           # 72px icon sidebar
│       ├── header.tsx            # Top bar: breadcrumb, avatars, notifications, Add Note
│       └── fab.tsx               # Floating "New Thought" button
├── features/
│   └── dashboard/
│       ├── greeting.tsx          # "Good morning, Bryan" + date/task count
│       ├── page-shortcuts.tsx    # 3-column page cards (Web Dev, Personal Growth, Design)
│       ├── inbox-preview.tsx     # Left column: 3 most recent inbox notes
│       └── task-list.tsx         # Right column: overdue/today/this week tasks
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # Browser Supabase client
│   │   └── server.ts             # Server Supabase client
│   ├── ai/
│   │   └── client.ts             # Anthropic SDK setup (stub)
│   └── utils.ts                  # cn() helper for Tailwind class merging
└── types/
    └── database.types.ts         # Placeholder for Supabase generated types
```

---

### Task 1: Initialize Next.js Project

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`

- [ ] **Step 1: Create Next.js app with pnpm**

Run:
```bash
cd c:/Users/bryan/Desktop/Thoughtdrop
pnpm create next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm --turbopack
```

When prompted about overwriting existing files, accept. This scaffolds the base project.

Expected: Project created with `src/app/` structure, `package.json`, `tsconfig.json`, `next.config.ts`, etc.

- [ ] **Step 2: Verify the project runs**

Run:
```bash
cd c:/Users/bryan/Desktop/Thoughtdrop && pnpm dev
```

Expected: Dev server starts on `http://localhost:3000`. Kill the server after confirming.

- [ ] **Step 3: Commit**

```bash
git init
git add -A
git commit -m "chore: initialize Next.js 15 project with pnpm, TypeScript, Tailwind, App Router"
```

---

### Task 2: Install Dependencies + Configure shadcn/ui

**Files:**
- Modify: `package.json`
- Create: `components.json`
- Create: `src/lib/utils.ts`

- [ ] **Step 1: Install Supabase and Anthropic SDK**

Run:
```bash
cd c:/Users/bryan/Desktop/Thoughtdrop
pnpm add @supabase/supabase-js @supabase/ssr @anthropic-ai/sdk
```

- [ ] **Step 2: Initialize shadcn/ui**

Run:
```bash
pnpm dlx shadcn@latest init
```

When prompted:
- Style: Default
- Base color: Neutral
- CSS variables: Yes

This creates `components.json` and `src/lib/utils.ts` with the `cn()` helper.

- [ ] **Step 3: Install initial shadcn/ui components**

Run:
```bash
pnpm dlx shadcn@latest add button
```

- [ ] **Step 4: Verify utils.ts has cn() helper**

Read `src/lib/utils.ts` and confirm it exports:

```typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: add Supabase, Anthropic SDK, shadcn/ui with button component"
```

---

### Task 3: Configure Design Tokens + Dark Mode

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Replace globals.css with ThoughtDrop design tokens**

Replace the contents of `src/app/globals.css` with:

```css
@import "tailwindcss";
@import "tw-animate/css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: #f9f9f9;
  --color-foreground: #2d3435;

  --color-surface: #f9f9f9;
  --color-surface-dim: #d4dbdd;
  --color-surface-container: #ebeeef;
  --color-surface-container-low: #f2f4f4;
  --color-surface-container-high: #e4e9ea;
  --color-surface-container-highest: #dde4e5;
  --color-surface-container-lowest: #ffffff;
  --color-surface-variant: #dde4e5;
  --color-surface-bright: #f9f9f9;

  --color-on-surface: #2d3435;
  --color-on-surface-variant: #5a6061;
  --color-on-background: #2d3435;

  --color-primary: #575e70;
  --color-primary-dim: #4b5264;
  --color-primary-container: #dce2f7;
  --color-on-primary: #f7f7ff;
  --color-on-primary-container: #4b5263;
  --color-inverse-primary: #d9dff5;

  --color-secondary: #585f6d;
  --color-secondary-container: #dce2f3;
  --color-on-secondary-container: #4b525f;

  --color-tertiary: #006b62;
  --color-tertiary-container: #91feef;
  --color-tertiary-fixed: #91feef;
  --color-on-tertiary-container: #006259;

  --color-error: #9f403d;
  --color-error-container: #fe8983;
  --color-on-error: #fff7f6;
  --color-on-error-container: #752121;

  --color-outline: #757c7d;
  --color-outline-variant: #adb3b4;

  --color-inverse-surface: #2d3435;
  --color-inverse-on-surface: #f7f7ff;

  /* Page accent colors */
  --color-accent-teal: #0D9488;
  --color-accent-amber: #D97706;
  --color-accent-violet: #7C3AED;

  --font-family-sans: 'Inter', sans-serif;

  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-full: 9999px;
}

/* Dark mode overrides */
.dark {
  --color-background: #111827;
  --color-foreground: #e5e7eb;

  --color-surface: #111827;
  --color-surface-dim: #0f1419;
  --color-surface-container: #1a2332;
  --color-surface-container-low: #151d2a;
  --color-surface-container-high: #1f2937;
  --color-surface-container-highest: #2a3544;
  --color-surface-container-lowest: #0d1117;
  --color-surface-variant: #2a3544;
  --color-surface-bright: #1f2937;

  --color-on-surface: #e5e7eb;
  --color-on-surface-variant: #9ca3af;
  --color-on-background: #e5e7eb;

  --color-primary: #a5b4fc;
  --color-primary-dim: #818cf8;
  --color-primary-container: #312e81;
  --color-on-primary: #1e1b4b;
  --color-on-primary-container: #c7d2fe;

  --color-outline: #4b5563;
  --color-outline-variant: #374151;
}

@layer base {
  body {
    font-family: var(--font-family-sans);
    background-color: var(--color-background);
    color: var(--color-foreground);
  }
}
```

- [ ] **Step 2: Update root layout.tsx with Inter font and dark mode class support**

Replace `src/app/layout.tsx` with:

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "ThoughtDrop",
  description: "Your thoughts, routed to the right place.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Verify the app still runs**

Run:
```bash
cd c:/Users/bryan/Desktop/Thoughtdrop && pnpm dev
```

Expected: App runs with Inter font loaded. No errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css src/app/layout.tsx
git commit -m "feat: add ThoughtDrop design tokens, dark mode, Inter font, Material Symbols"
```

---

### Task 4: Create Supabase Client + AI Client Stubs

**Files:**
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/ai/client.ts`
- Create: `src/types/database.types.ts`

- [ ] **Step 1: Create browser Supabase client**

Create `src/lib/supabase/client.ts`:

```typescript
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

- [ ] **Step 2: Create server Supabase client**

Create `src/lib/supabase/server.ts`:

```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method is called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
          }
        },
      },
    }
  );
}
```

- [ ] **Step 3: Create AI client stub**

Create `src/lib/ai/client.ts`:

```typescript
import Anthropic from "@anthropic-ai/sdk";

export function createAIClient() {
  return new Anthropic();
}
```

- [ ] **Step 4: Create placeholder database types**

Create `src/types/database.types.ts`:

```typescript
// Auto-generated by Supabase CLI: npx supabase gen types typescript
// Run this command after setting up your database schema to regenerate.

export type Database = {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/ src/types/
git commit -m "feat: add Supabase client/server, AI client stub, database types placeholder"
```

---

### Task 5: Create App Shell — Sidebar

**Files:**
- Create: `src/components/layout/sidebar.tsx`

- [ ] **Step 1: Build the sidebar component**

Create `src/components/layout/sidebar.tsx`:

```tsx
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
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
        <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-xs font-bold text-on-surface-variant">
          B
        </div>
      </div>
    </aside>
  );
}
```

- [ ] **Step 2: Verify it renders**

Import it temporarily in `src/app/page.tsx` and check it renders the icon sidebar at 72px width with the water_drop logo.

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/sidebar.tsx
git commit -m "feat: add sidebar navigation component"
```

---

### Task 6: Create App Shell — Header

**Files:**
- Create: `src/components/layout/header.tsx`

- [ ] **Step 1: Build the header component**

Create `src/components/layout/header.tsx`:

```tsx
import { Button } from "@/components/ui/button";

interface HeaderProps {
  breadcrumb?: string;
}

export function Header({ breadcrumb = "Dashboard" }: HeaderProps) {
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

        <button className="text-on-surface-variant hover:text-primary transition-opacity">
          <span className="material-symbols-outlined">notifications</span>
        </button>

        <Button className="bg-primary text-on-primary px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:opacity-90">
          <span className="material-symbols-outlined text-sm">add</span>
          Add Note
        </Button>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/layout/header.tsx
git commit -m "feat: add header component with breadcrumb, avatars, notifications"
```

---

### Task 7: Create App Shell — FAB (Floating Action Button)

**Files:**
- Create: `src/components/layout/fab.tsx`

- [ ] **Step 1: Build the FAB component**

Create `src/components/layout/fab.tsx`:

```tsx
"use client";

export function Fab() {
  return (
    <button
      className="fixed bottom-10 right-10 w-16 h-16 rounded-full flex items-center justify-center text-primary group hover:scale-105 transition-all active:scale-95 z-50 bg-white/85 dark:bg-surface-container-high/85 backdrop-blur-xl shadow-[0_10px_40px_-10px_rgba(45,52,53,0.06)]"
      aria-label="New Thought"
    >
      <span className="material-symbols-outlined text-3xl font-bold">
        edit_note
      </span>
      <span className="absolute right-20 bg-inverse-surface text-inverse-on-surface px-4 py-2 rounded-lg text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
        New Thought
      </span>
    </button>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/layout/fab.tsx
git commit -m "feat: add floating action button for quick note creation"
```

---

### Task 8: Wire Up App Layout

**Files:**
- Create: `src/app/(app)/layout.tsx`
- Create: `src/app/(app)/dashboard/page.tsx` (placeholder)
- Create: `src/app/(auth)/layout.tsx`
- Create: `src/app/(auth)/login/page.tsx` (placeholder)
- Create: `src/app/(auth)/signup/page.tsx` (placeholder)
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Create the app layout with sidebar + header + FAB**

Create `src/app/(app)/layout.tsx`:

```tsx
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Fab } from "@/components/layout/fab";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-grow flex flex-col bg-surface min-h-screen">
        <Header />
        <div className="px-12 py-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
      <Fab />
    </div>
  );
}
```

- [ ] **Step 2: Create placeholder dashboard page**

Create `src/app/(app)/dashboard/page.tsx`:

```tsx
export default function DashboardPage() {
  return <div>Dashboard coming next...</div>;
}
```

- [ ] **Step 3: Create auth layout**

Create `src/app/(auth)/layout.tsx`:

```tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      {children}
    </div>
  );
}
```

- [ ] **Step 4: Create placeholder auth pages**

Create `src/app/(auth)/login/page.tsx`:

```tsx
export default function LoginPage() {
  return <div>Login page placeholder</div>;
}
```

Create `src/app/(auth)/signup/page.tsx`:

```tsx
export default function SignupPage() {
  return <div>Signup page placeholder</div>;
}
```

- [ ] **Step 5: Update root page.tsx to redirect to dashboard**

Replace `src/app/page.tsx`:

```tsx
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/dashboard");
}
```

- [ ] **Step 6: Run dev server and verify the app shell**

Run:
```bash
cd c:/Users/bryan/Desktop/Thoughtdrop && pnpm dev
```

Expected: Navigating to `http://localhost:3000` redirects to `/dashboard`. Sidebar visible on the left at 72px with icon nav. Header at top with breadcrumb, avatars, Add Note button. FAB in bottom-right corner with hover tooltip.

- [ ] **Step 7: Commit**

```bash
git add src/app/
git commit -m "feat: wire up app shell with sidebar, header, FAB, route groups"
```

---

### Task 9: Dashboard — Greeting Section

**Files:**
- Create: `src/features/dashboard/greeting.tsx`

- [ ] **Step 1: Build the greeting component**

Create `src/features/dashboard/greeting.tsx`:

```tsx
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function formatDate(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

interface GreetingProps {
  name: string;
  taskCount: number;
}

export function Greeting({ name, taskCount }: GreetingProps) {
  return (
    <section className="space-y-1">
      <h1 className="text-4xl font-extrabold tracking-tight text-on-surface">
        {getGreeting()}, {name}
      </h1>
      <p className="text-on-surface-variant font-medium">
        {formatDate()} — You have {taskCount} task{taskCount !== 1 ? "s" : ""} for today.
      </p>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/dashboard/greeting.tsx
git commit -m "feat: add greeting component with time-aware greeting and date"
```

---

### Task 10: Dashboard — Page Shortcut Cards

**Files:**
- Create: `src/features/dashboard/page-shortcuts.tsx`

- [ ] **Step 1: Build the page shortcuts component**

Create `src/features/dashboard/page-shortcuts.tsx`:

```tsx
import { cn } from "@/lib/utils";

interface PageShortcut {
  name: string;
  hashtag: string;
  noteCount: number;
  icon: string;
  accentColor: string;
  bgClass: string;
}

const mockPages: PageShortcut[] = [
  {
    name: "Web Development",
    hashtag: "#webdev",
    noteCount: 12,
    icon: "code",
    accentColor: "#0D9488",
    bgClass: "bg-teal-50 dark:bg-teal-950/30",
  },
  {
    name: "Personal Growth",
    hashtag: "#growth",
    noteCount: 8,
    icon: "auto_awesome",
    accentColor: "#D97706",
    bgClass: "bg-amber-50 dark:bg-amber-950/30",
  },
  {
    name: "Design Projects",
    hashtag: "#design",
    noteCount: 15,
    icon: "palette",
    accentColor: "#7C3AED",
    bgClass: "bg-violet-50 dark:bg-violet-950/30",
  },
];

export function PageShortcuts() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {mockPages.map((page) => (
        <div
          key={page.hashtag}
          className="group bg-surface-container-lowest p-6 rounded-xl hover:bg-surface-bright transition-all cursor-pointer flex flex-col justify-between h-40 shadow-[0px_4px_20px_-10px_rgba(45,52,53,0.06)]"
        >
          <div className="flex justify-between items-start">
            <div
              className={cn("p-2 rounded-lg", page.bgClass)}
              style={{ color: page.accentColor }}
            >
              <span className="material-symbols-outlined">{page.icon}</span>
            </div>
            <span className="text-[10px] font-bold tracking-widest uppercase text-on-surface-variant opacity-60">
              {page.noteCount} NOTES
            </span>
          </div>
          <div>
            <h3 className="font-bold text-on-surface group-hover:text-primary transition-colors">
              {page.name}
            </h3>
            <p className="text-on-surface-variant text-sm mt-1">
              {page.hashtag}
            </p>
          </div>
        </div>
      ))}
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/dashboard/page-shortcuts.tsx
git commit -m "feat: add page shortcut cards with accent colors and note counts"
```

---

### Task 11: Dashboard — Inbox Preview

**Files:**
- Create: `src/features/dashboard/inbox-preview.tsx`

- [ ] **Step 1: Build the inbox preview component**

Create `src/features/dashboard/inbox-preview.tsx`:

```tsx
import { cn } from "@/lib/utils";

interface InboxNote {
  id: string;
  title: string;
  preview: string;
  timeAgo: string;
  accentColor: string | null; // null = untagged
}

const mockNotes: InboxNote[] = [
  {
    id: "1",
    title: "React 19 Server Components...",
    preview:
      "I need to investigate how the new useActionState hook simplifies form handling compared to...",
    timeAgo: "2h ago",
    accentColor: "#0D9488",
  },
  {
    id: "2",
    title: "Habit Stacking Ideas",
    preview:
      "Morning coffee followed immediately by 10 minutes of journaling. It's the only way to make it stick.",
    timeAgo: "5h ago",
    accentColor: "#D97706",
  },
  {
    id: "3",
    title: "Grocery List",
    preview:
      "Oat milk, sourdough bread, avocados, sea salt, dark roast beans, sparkling water...",
    timeAgo: "Yesterday",
    accentColor: null,
  },
];

export function InboxPreview() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight">Inbox</h2>
        <button className="text-primary text-sm font-medium hover:underline">
          View all
        </button>
      </div>

      <div className="space-y-4">
        {mockNotes.map((note) => (
          <div
            key={note.id}
            className={cn(
              "bg-surface-container-lowest p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer border-l-4",
              note.accentColor ? "" : "border-transparent"
            )}
            style={
              note.accentColor
                ? { borderLeftColor: note.accentColor }
                : undefined
            }
          >
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-bold text-on-surface">{note.title}</h4>
              <span className="text-[10px] text-on-surface-variant font-medium">
                {note.timeAgo}
              </span>
            </div>
            <p className="text-on-surface-variant text-sm line-clamp-2">
              {note.preview}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/dashboard/inbox-preview.tsx
git commit -m "feat: add inbox preview with color-coded note cards"
```

---

### Task 12: Dashboard — Task List

**Files:**
- Create: `src/features/dashboard/task-list.tsx`

- [ ] **Step 1: Build the task list component**

Create `src/features/dashboard/task-list.tsx`:

```tsx
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  time: string;
  accentColor: string;
  completed: boolean;
}

interface TaskGroup {
  label: string;
  labelClass: string;
  dividerClass: string;
  tasks: Task[];
}

const mockTaskGroups: TaskGroup[] = [
  {
    label: "Overdue",
    labelClass: "text-error",
    dividerClass: "bg-error opacity-10",
    tasks: [
      {
        id: "1",
        title: "Finalize Design System proposal",
        time: "Jun 10",
        accentColor: "#7C3AED",
        completed: false,
      },
    ],
  },
  {
    label: "Today",
    labelClass: "text-on-surface-variant",
    dividerClass: "bg-outline-variant opacity-10",
    tasks: [
      {
        id: "2",
        title: "Review PR for dashboard auth",
        time: "10:00 AM",
        accentColor: "#0D9488",
        completed: true,
      },
      {
        id: "3",
        title: "Client meeting with VaynerMedia",
        time: "2:30 PM",
        accentColor: "#D97706",
        completed: false,
      },
    ],
  },
  {
    label: "This week",
    labelClass: "text-on-surface-variant",
    dividerClass: "bg-outline-variant opacity-10",
    tasks: [
      {
        id: "4",
        title: "Update portfolio project descriptions",
        time: "Thu",
        accentColor: "#7C3AED",
        completed: false,
      },
    ],
  },
];

export function TaskList() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight">Tasks</h2>
        <div className="flex gap-2">
          <span className="bg-surface-container px-3 py-1 rounded-full text-xs font-semibold text-on-surface-variant">
            Filter
          </span>
          <span className="bg-tertiary-container px-3 py-1 rounded-full text-xs font-semibold text-on-tertiary-container">
            New Task
          </span>
        </div>
      </div>

      {mockTaskGroups.map((group) => (
        <div key={group.label} className="space-y-4">
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "text-xs font-bold tracking-widest uppercase",
                group.labelClass
              )}
            >
              {group.label}
            </span>
            <div className={cn("h-[1px] flex-grow", group.dividerClass)} />
          </div>

          <div className="space-y-3">
            {group.tasks.map((task) => (
              <div
                key={task.id}
                className={cn(
                  "flex items-center justify-between p-4 rounded-lg shadow-sm",
                  group.label === "Overdue"
                    ? "bg-white/50 dark:bg-surface-container-lowest/50 border-l-2 border-error/30"
                    : "bg-surface-container-lowest",
                  group.label === "This week" && "opacity-80"
                )}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                      task.completed
                        ? "border-tertiary text-tertiary"
                        : group.label === "Overdue"
                          ? "border-outline-variant opacity-50"
                          : "border-outline-variant"
                    )}
                  >
                    {task.completed && (
                      <span
                        className="material-symbols-outlined text-[14px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        check
                      </span>
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-on-surface font-medium",
                      task.completed && "line-through opacity-50"
                    )}
                  >
                    {task.title}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: task.accentColor }}
                  />
                  <span
                    className={cn(
                      "text-[10px] font-bold",
                      group.label === "Overdue"
                        ? "text-error"
                        : "text-on-surface-variant"
                    )}
                  >
                    {task.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/dashboard/task-list.tsx
git commit -m "feat: add task list with overdue/today/this week grouping"
```

---

### Task 13: Assemble Dashboard Page

**Files:**
- Modify: `src/app/(app)/dashboard/page.tsx`

- [ ] **Step 1: Wire all dashboard components together**

Replace `src/app/(app)/dashboard/page.tsx`:

```tsx
import { Greeting } from "@/features/dashboard/greeting";
import { PageShortcuts } from "@/features/dashboard/page-shortcuts";
import { InboxPreview } from "@/features/dashboard/inbox-preview";
import { TaskList } from "@/features/dashboard/task-list";

export default function DashboardPage() {
  return (
    <div className="space-y-12">
      <Greeting name="Bryan" taskCount={4} />
      <PageShortcuts />
      <section className="grid grid-cols-1 lg:grid-cols-5 gap-12">
        <div className="lg:col-span-2">
          <InboxPreview />
        </div>
        <div className="lg:col-span-3">
          <TaskList />
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Run dev server and visually compare against design**

Run:
```bash
cd c:/Users/bryan/Desktop/Thoughtdrop && pnpm dev
```

Open `http://localhost:3000` and compare against the light mode design (`design/01-dashboard-light.png`). Check:
- Greeting text and date format match
- 3 page shortcut cards with correct icons, colors, note counts
- Inbox section: 3 notes with colored left borders, timestamps
- Tasks section: overdue (red), today (with completed task struck through), this week
- Sidebar icons, header layout, FAB positioning

- [ ] **Step 3: Commit**

```bash
git add src/app/\(app\)/dashboard/page.tsx
git commit -m "feat: assemble dashboard page with greeting, pages, inbox, tasks"
```

---

### Task 14: Dark Mode Toggle + Visual Verification

**Files:**
- Modify: `src/app/layout.tsx` (add dark class toggle)

- [ ] **Step 1: Add a simple dark mode toggle for testing**

We need to verify dark mode looks correct. Add a `ThemeProvider` approach. Install `next-themes`:

Run:
```bash
cd c:/Users/bryan/Desktop/Thoughtdrop && pnpm add next-themes
```

- [ ] **Step 2: Create theme provider component**

Create `src/components/theme-provider.tsx`:

```tsx
"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="light" enableSystem>
      {children}
    </NextThemesProvider>
  );
}
```

- [ ] **Step 3: Wrap root layout with ThemeProvider**

Update `src/app/layout.tsx` — wrap `{children}` in the body with:

```tsx
import { ThemeProvider } from "@/components/theme-provider";

// In the body:
<body className={`${inter.variable} font-sans antialiased`}>
  <ThemeProvider>
    {children}
  </ThemeProvider>
</body>
```

- [ ] **Step 4: Add dark mode toggle to sidebar**

Add a theme toggle button to the bottom of the sidebar (above the avatar) in `src/components/layout/sidebar.tsx`:

```tsx
// Add import at top:
import { useTheme } from "next-themes";

// Inside the Sidebar component, before the avatar div:
const { theme, setTheme } = useTheme();

// Add this button in the bottom section, before the avatar:
<button
  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
  className="w-12 h-12 flex items-center justify-center text-on-surface-variant hover:bg-surface-variant rounded-xl transition-colors"
  title="Toggle theme"
>
  <span className="material-symbols-outlined">
    {theme === "dark" ? "light_mode" : "dark_mode"}
  </span>
</button>
```

- [ ] **Step 5: Verify dark mode matches design**

Run dev server. Toggle dark mode. Compare against `design/02-dashboard-dark.png`. Check:
- Background changes to dark surface colors
- Cards get dark backgrounds
- Text colors invert properly
- Page shortcut icons still show accent colors
- Sidebar background changes

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add dark mode support with next-themes and theme toggle"
```

---

### Task 15: Clean Up + Final Verification

- [ ] **Step 1: Remove the stray `1` file from project root**

```bash
rm c:/Users/bryan/Desktop/Thoughtdrop/1
```

- [ ] **Step 2: Remove default Next.js boilerplate**

Delete any leftover default Next.js content (default favicon, default SVGs in public/).

- [ ] **Step 3: Final visual check**

Run:
```bash
cd c:/Users/bryan/Desktop/Thoughtdrop && pnpm dev
```

Verify:
- Light mode matches `design/01-dashboard-light.png`
- Dark mode matches `design/02-dashboard-dark.png`
- All interactions work (sidebar nav highlights, FAB tooltip, theme toggle)
- No console errors

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "chore: clean up boilerplate, final dashboard polish"
```
