"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { CreateTaskModal } from "@/components/create-task-modal";

const columns = [
  { id: "inbox", label: "Inbox", icon: "📥" },
  { id: "in_progress", label: "In Progress", icon: "🔄" },
  { id: "review", label: "Review", icon: "👀" },
  { id: "done", label: "Done", icon: "✅" },
];

const priorityStyles: Record<string, string> = {
  low: "bg-white/10 text-white/70",
  medium: "bg-blue-500/20 text-blue-300",
  high: "bg-orange-500/20 text-orange-300",
  urgent: "bg-red-500/20 text-red-300",
};

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
          className="btn-primary"
        >
          + New Task
        </button>
      </div>

      <div className="flex-1 flex gap-5 overflow-x-auto pb-4">
        {columns.map((column) => (
          <div 
            key={column.id} 
            className="flex-1 min-w-[300px] max-w-[350px] flex flex-col"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span>{column.icon}</span>
                <h3 className="font-medium">{column.label}</h3>
              </div>
              <span className="px-2 py-1 rounded-lg bg-white/10 text-xs">
                {tasksByStatus[column.id]?.length ?? 0}
              </span>
            </div>

            {/* Tasks */}
            <div className="flex-1 space-y-3">
              {tasksByStatus[column.id]?.length === 0 ? (
                <div className="liquid-card p-6 text-center text-secondary text-sm">
                  No tasks
                </div>
              ) : (
                tasksByStatus[column.id]?.map((task) => (
                  <TaskCard key={task._id} task={task} />
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

function TaskCard({ task }: { task: any }) {
  const timeSince = (ts: number) => {
    const s = Math.floor((Date.now() - ts) / 1000);
    if (s < 60) return "now";
    if (s < 3600) return `${Math.floor(s / 60)}m`;
    if (s < 86400) return `${Math.floor(s / 3600)}h`;
    return `${Math.floor(s / 86400)}d`;
  };

  return (
    <div className="liquid-card p-4 cursor-pointer">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-medium text-sm leading-tight">{task.title}</h4>
        <span className={`px-2 py-0.5 rounded text-xs ${priorityStyles[task.priority]}`}>
          {task.priority}
        </span>
      </div>

      {task.description && (
        <p className="text-xs text-secondary mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between text-xs text-secondary">
        <div className="flex items-center gap-2">
          {task.assignedTo ? (
            <>
              <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px]">
                {agentEmojis[task.assignedTo] || "🤖"}
              </div>
              <span>{task.assignedTo}</span>
            </>
          ) : (
            <span className="opacity-50">Unassigned</span>
          )}
        </div>
        <span>{timeSince(task._creationTime)}</span>
      </div>
    </div>
  );
}
