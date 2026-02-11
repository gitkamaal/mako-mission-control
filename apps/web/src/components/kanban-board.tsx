"use client";

import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Id } from "../../convex/_generated/dataModel";

interface Task {
  _id: Id<"tasks">;
  _creationTime: number;
  title: string;
  description?: string;
  status: "inbox" | "assigned" | "in_progress" | "review" | "done" | "blocked";
  priority: "low" | "medium" | "high" | "urgent";
  createdBy: string;
  createdByType: "agent" | "human";
  assignedTo?: string;
  claimedAt?: number;
  completedAt?: number;
}

interface KanbanBoardProps {
  tasks: Task[];
}

const statusColumns = [
  { id: "inbox", label: "📥 Inbox", color: "bg-slate-100" },
  { id: "in_progress", label: "🔄 In Progress", color: "bg-blue-50" },
  { id: "review", label: "👀 Review", color: "bg-yellow-50" },
  { id: "done", label: "✅ Done", color: "bg-green-50" },
] as const;

const priorityColors = {
  low: "bg-slate-200 text-slate-700",
  medium: "bg-blue-200 text-blue-700",
  high: "bg-orange-200 text-orange-700",
  urgent: "bg-red-200 text-red-700",
};

const agentEmojis: Record<string, string> = {
  Mako: "🦈",
  Scout: "🔍",
  Scribe: "✍️",
  Atlas: "🏛️",
  Pixel: "🎨",
  Forge: "⚙️",
  human: "👤",
};

function TaskCard({ task }: { task: Task }) {
  const timeSince = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <Card className="mb-3 cursor-pointer hover:shadow-md transition-shadow">
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h4 className="font-medium text-sm leading-tight">{task.title}</h4>
          <Badge className={`text-xs shrink-0 ${priorityColors[task.priority]}`}>
            {task.priority}
          </Badge>
        </div>
        
        {task.description && (
          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
            {task.description}
          </p>
        )}
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            {task.assignedTo ? (
              <>
                <Avatar className="h-5 w-5 text-xs">
                  <AvatarFallback className="bg-slate-100 text-[10px]">
                    {agentEmojis[task.assignedTo] || "🤖"}
                  </AvatarFallback>
                </Avatar>
                <span>{task.assignedTo}</span>
              </>
            ) : (
              <span className="text-muted-foreground/50">Unassigned</span>
            )}
          </div>
          <span>{timeSince(task._creationTime)}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function KanbanColumn({ 
  id, 
  label, 
  color, 
  tasks 
}: { 
  id: string; 
  label: string; 
  color: string; 
  tasks: Task[];
}) {
  return (
    <div className={`flex-1 min-w-[280px] max-w-[320px] ${color} rounded-lg p-3`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">{label}</h3>
        <Badge variant="secondary" className="text-xs">
          {tasks.length}
        </Badge>
      </div>
      
      <div className="space-y-0 min-h-[200px]">
        {tasks.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-8">
            No tasks
          </p>
        ) : (
          tasks.map((task) => <TaskCard key={task._id} task={task} />)
        )}
      </div>
    </div>
  );
}

export function KanbanBoard({ tasks }: KanbanBoardProps) {
  // Group tasks by status
  const tasksByStatus = statusColumns.reduce((acc, col) => {
    acc[col.id] = tasks.filter((t) => {
      // Combine "assigned" into "in_progress" for display
      if (col.id === "in_progress") {
        return t.status === "in_progress" || t.status === "assigned";
      }
      return t.status === col.id;
    });
    return acc;
  }, {} as Record<string, Task[]>);

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {statusColumns.map((col) => (
        <KanbanColumn
          key={col.id}
          id={col.id}
          label={col.label}
          color={col.color}
          tasks={tasksByStatus[col.id] || []}
        />
      ))}
    </div>
  );
}
