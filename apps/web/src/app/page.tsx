"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { KanbanBoard } from "@/components/kanban-board";
import { CreateTaskModal } from "@/components/create-task-modal";
import { GatewayStatus } from "@/components/gateway-status";

// Types
interface Agent {
  _id: string;
  name: string;
  emoji: string;
  role: string;
  description?: string;
  status: "active" | "idle" | "offline";
  currentTaskId?: string;
  lastHeartbeat?: number;
  reportsTo?: string;
}

interface Task {
  _id: string;
  _creationTime: number;
  title: string;
  description?: string;
  status: "inbox" | "assigned" | "in_progress" | "review" | "done" | "blocked";
  priority: "low" | "medium" | "high" | "urgent";
  createdBy: string;
  createdByType: "agent" | "human";
  assignedTo?: string;
}

interface Activity {
  _id: string;
  _creationTime: number;
  type: string;
  actorName: string;
  actorType: "agent" | "human" | "system";
  targetId?: string;
  targetType?: string;
  data?: Record<string, unknown>;
}

function AgentCard({ agent }: { agent: Agent }) {
  const statusColors = {
    active: "bg-green-500",
    idle: "bg-yellow-500",
    offline: "bg-gray-400",
  };

  const timeSince = (timestamp?: number) => {
    if (!timestamp) return "Never";
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 text-xl">
              <AvatarFallback className="bg-slate-100">
                {agent.emoji}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base">{agent.name}</CardTitle>
              <CardDescription className="text-xs">{agent.role}</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${statusColors[agent.status]}`} />
            <span className="text-xs text-muted-foreground capitalize">
              {agent.status}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-xs text-muted-foreground">
          Last seen: {timeSince(agent.lastHeartbeat)}
        </p>
      </CardContent>
    </Card>
  );
}

function ConnectionStatus({ connected }: { connected: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`h-2 w-2 rounded-full ${
          connected ? "bg-green-500 animate-pulse" : "bg-red-500"
        }`}
      />
      <span className="text-sm text-muted-foreground">
        {connected ? "Connected" : "Connecting..."}
      </span>
    </div>
  );
}

function ActivityItem({ activity }: { activity: Activity }) {
  const getActivityText = (activity: Activity): string => {
    switch (activity.type) {
      case "task_created":
        return `created "${(activity.data?.title as string) || "task"}"`;
      case "task_claimed":
        return "claimed a task";
      case "task_completed":
        return "completed a task";
      case "task_updated":
        return `moved task to ${activity.data?.newStatus}`;
      case "comment_added":
        return "added a comment";
      case "mention":
        return `mentioned @${activity.targetId}`;
      case "agent_spawned":
        return activity.data?.message as string || "joined the squad";
      case "agent_heartbeat":
        return "checked in ✓";
      default:
        return activity.type.replace(/_/g, " ");
    }
  };

  const timeSince = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const agentEmojis: Record<string, string> = {
    Mako: "🦈",
    Scout: "🔍",
    Scribe: "✍️",
    Atlas: "🏛️",
    Pixel: "🎨",
    Forge: "⚙️",
    System: "🤖",
    human: "👤",
  };

  return (
    <div className="flex items-start gap-3 py-2">
      <Avatar className="h-6 w-6 text-sm">
        <AvatarFallback className="bg-slate-100 text-xs">
          {agentEmojis[activity.actorName] || "🤖"}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm truncate">
          <span className="font-medium">{activity.actorName}</span>{" "}
          <span className="text-muted-foreground">{getActivityText(activity)}</span>
        </p>
        <p className="text-xs text-muted-foreground">
          {timeSince(activity._creationTime)}
        </p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  
  const agents = useQuery(api.agents.list);
  const tasks = useQuery(api.tasks.list, {});
  const activity = useQuery(api.activity.recent, { limit: 15 });

  const connected = agents !== undefined;

  const activeAgents = agents?.filter((a) => a.status === "active").length ?? 0;
  const totalTasks = tasks?.length ?? 0;
  const doneTasks = tasks?.filter((t) => t.status === "done").length ?? 0;
  const inProgressTasks = tasks?.filter((t) => 
    t.status === "in_progress" || t.status === "assigned"
  ).length ?? 0;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-white px-6 py-3">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🦈</span>
            <div>
              <h1 className="text-lg font-bold">Mako Mission Control</h1>
              <p className="text-xs text-muted-foreground">
                AI Agent Orchestration
              </p>
            </div>
          </div>
          <ConnectionStatus connected={connected} />
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-[1600px] p-6">
        {/* Top Row: Stats + Sidebar */}
        <div className="grid gap-6 lg:grid-cols-[1fr_350px] mb-6">
          {/* Left: Stats + Agents */}
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-4 sm:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs">Active Agents</CardDescription>
                  <CardTitle className="text-2xl">{activeAgents} / {agents?.length ?? 0}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs">Total Tasks</CardDescription>
                  <CardTitle className="text-2xl">{totalTasks}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs">In Progress</CardDescription>
                  <CardTitle className="text-2xl text-blue-600">{inProgressTasks}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs">Completed</CardDescription>
                  <CardTitle className="text-2xl text-green-600">{doneTasks}</CardTitle>
                </CardHeader>
              </Card>
            </div>

            {/* Agent Squad */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold">Agent Squad</h2>
              </div>
              {agents === undefined ? (
                <div className="grid gap-3 sm:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="animate-pulse h-24" />
                  ))}
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {agents.map((agent) => (
                    <AgentCard key={agent._id} agent={agent as Agent} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar: Activity + Gateway */}
          <div className="space-y-4">
            {/* Gateway Status */}
            <GatewayStatus />

            {/* Activity Feed */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Activity Feed</CardTitle>
              </CardHeader>
              <CardContent className="max-h-[350px] overflow-y-auto">
                {activity === undefined ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-start gap-3 animate-pulse">
                        <div className="h-6 w-6 rounded-full bg-slate-200" />
                        <div className="flex-1">
                          <div className="h-4 w-32 bg-slate-200 rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : activity.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No activity yet
                  </p>
                ) : (
                  <div className="divide-y">
                    {activity.map((item) => (
                      <ActivityItem key={item._id} activity={item as Activity} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Kanban Board */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Task Board</h2>
            <Button onClick={() => setCreateTaskOpen(true)}>
              + New Task
            </Button>
          </div>
          
          {tasks === undefined ? (
            <div className="flex gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex-1 min-w-[280px] h-[300px] bg-slate-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <KanbanBoard tasks={tasks as any} />
          )}
        </section>
      </main>

      {/* Create Task Modal */}
      <CreateTaskModal open={createTaskOpen} onOpenChange={setCreateTaskOpen} />
    </div>
  );
}
