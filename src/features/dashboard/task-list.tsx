"use client";

import { useState } from "react";
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

const initialTaskGroups: TaskGroup[] = [
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
  const [taskGroups, setTaskGroups] = useState<TaskGroup[]>(initialTaskGroups);
  const [showNewTask, setShowNewTask] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDueDate, setNewDueDate] = useState("");

  function toggleTask(taskId: string) {
    setTaskGroups((prev) =>
      prev.map((group) => ({
        ...group,
        tasks: group.tasks.map((task) =>
          task.id === taskId ? { ...task, completed: !task.completed } : task
        ),
      }))
    );
  }

  function addTask() {
    if (!newTitle.trim()) return;

    const newTask: Task = {
      id: crypto.randomUUID(),
      title: newTitle.trim(),
      time: newDueDate
        ? new Date(newDueDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })
        : "No date",
      accentColor: "#006b62",
      completed: false,
    };

    setTaskGroups((prev) =>
      prev.map((group) =>
        group.label === "Today"
          ? { ...group, tasks: [...group.tasks, newTask] }
          : group
      )
    );

    setNewTitle("");
    setNewDueDate("");
    setShowNewTask(false);
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight">Tasks</h2>
        <button
          onClick={() => setShowNewTask(!showNewTask)}
          className="text-on-surface-variant text-xs font-semibold hover:text-on-surface transition-colors flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          New Task
        </button>
      </div>

      {showNewTask && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            addTask();
          }}
          className="bg-surface-container-lowest p-4 rounded-xl shadow-sm space-y-3"
        >
          <input
            type="text"
            placeholder="Task title..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-on-surface placeholder:text-on-surface-variant/50 font-medium outline-none text-sm"
          />
          <div className="flex items-center justify-between">
            <input
              type="date"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              className="bg-surface-container text-on-surface-variant text-xs px-3 py-1.5 rounded-lg outline-none"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowNewTask(false);
                  setNewTitle("");
                  setNewDueDate("");
                }}
                className="text-on-surface-variant text-xs px-3 py-1.5 hover:bg-surface-variant rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-tertiary text-on-error text-xs font-semibold px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
              >
                Add
              </button>
            </div>
          </div>
        </form>
      )}

      {taskGroups.map((group) => (
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
                    ? "bg-surface-container-lowest/50 border-l-2 border-error/30"
                    : "bg-surface-container-lowest",
                  group.label === "This week" && "opacity-80"
                )}
              >
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => toggleTask(task.id)}
                    className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                      task.completed
                        ? "border-tertiary text-tertiary"
                        : group.label === "Overdue"
                          ? "border-outline-variant opacity-50 hover:border-tertiary hover:opacity-100"
                          : "border-outline-variant hover:border-tertiary"
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
                  </button>
                  <span
                    className={cn(
                      "text-on-surface font-medium transition-all",
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
