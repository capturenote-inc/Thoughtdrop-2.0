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
          className="bg-surface-container-lowest p-6 rounded-xl transition-all flex flex-col justify-between h-40 shadow-[0px_4px_20px_-10px_rgba(45,52,53,0.06)] border-l-4"
          style={{ borderLeftColor: page.accentColor }}
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
            <h3 className="font-bold text-on-surface">
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
