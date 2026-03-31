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
