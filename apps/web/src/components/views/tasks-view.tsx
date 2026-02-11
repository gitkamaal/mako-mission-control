"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { CreateTaskModal } from "@/components/create-task-modal";

const columns = [
  { id: "inbox", label: "Inbox", icon: "📥", color: "blue" },
  { id: "in_progress", label: "In Progress", icon: "🔄", color: "orange" },
  { id: "review", label: "Review", icon: "👀", color: "purple" },
  { id: "done", label: "Done", icon: "✅", color: "green" },
];

const agentEmojis: Record<string, string> = {
  Mako: "🦈", Scout: "🔍", Scribe: "✍️", Atlas: "🏛️", Pixel: "🎨", Forge: "⚙️",
};

export function TasksView() {
  const [createOpen, setCreateOpen] = useState(false);
  const tasks = useQuery(api.tasks.list, {});

  const tasksByStatus = columns.reduce((acc, col) => {
    acc[col.id] = tasks?.filter((t) => {
      if (col.id === "in_progress") {
        return t.status === "in_progress" || t.status === "assigned";
      }
      return t.status === col.id;
    }) ?? [];
    return acc;
  }, {} as Record<string, typeof tasks>);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Task Board</h1>
          <p className="text-secondary">Manage your mission tasks</p>
        </div>
        <button 
          onClick={() => setCreateOpen(true)}
          className="btn-primary flex items-center gap-2"
        >
          <span>+</span> New Task
        </button>
      </div>

      <div className="flex-1 flex gap-5 overflow-x-auto pb-4">
        {columns.map((column) => (
          <div 
            key={column.id} 
            className="flex-1 min-w-[300px] max-w-[350px] flex flex-col kanban-column"
          >
            {/* Column Header */}
            <div className="kanban-column-header">
              <div className="flex items-center gap-2">
                <span className="text-lg">{column.icon}</span>
                <h3 className="font-semibold">{column.label}</h3>
              </div>
              <span className="kanban-count">
                {tasksByStatus[column.id]?.length ?? 0}
              </span>
            </div>

            {/* Tasks */}
            <div className="flex-1 p-3 space-y-3 overflow-y-auto max-h-[calc(100vh-280px)]">
              {tasksByStatus[column.id]?.length === 0 ? (
                <div className="empty-state py-8">
                  <div className="empty-state-icon">{column.icon}</div>
                  <span className="text-sm">No tasks</span>
                </div>
              ) : (
                tasksByStatus[column.id]?.map((task) => (
                  <TaskCard key={task._id} task={task} columnColor={column.color} />
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      <CreateTaskModal open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}

function TaskCard({ task, columnColor }: { task: any; columnColor: string }) {
  const timeSince = (ts: number) => {
    const s = Math.floor((Date.now() - ts) / 1000);
    if (s < 60) return "now";
    if (s < 3600) return `${Math.floor(s / 60)}m`;
    if (s < 86400) return `${Math.floor(s / 3600)}h`;
    return `${Math.floor(s / 86400)}d`;
  };

  const getPriorityClass = (priority: string) => {
    const classes: Record<string, string> = {
      low: "priority-low",
      medium: "priority-medium",
      high: "priority-high",
      urgent: "priority-urgent",
    };
    return classes[priority] || classes.medium;
  };

  return (
    <div className="liquid-card p-4 hover-lift cursor-pointer group">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-medium text-sm leading-snug group-hover:text-white transition-colors">
          {task.title}
        </h4>
        <span className={`priority-badge ${getPriorityClass(task.priority)}`}>
          {task.priority}
        </span>
      </div>

      {task.description && (
        <p className="text-xs text-secondary mb-3 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-white/5">
        <div className="flex items-center gap-2">
          {task.assignedTo ? (
            <>
              <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center text-xs">
                {agentEmojis[task.assignedTo] || "🤖"}
              </div>
              <span className="text-xs text-secondary">{task.assignedTo}</span>
            </>
          ) : (
            <span className="text-xs text-tertiary">Unassigned</span>
          )}
        </div>
        <span className="text-xs text-tertiary">{timeSince(task._creationTime)}</span>
      </div>
    </div>
  );
}
