"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

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
            <Avatar className="h-12 w-12 text-2xl">
              <AvatarFallback className="bg-slate-100">
                {agent.emoji}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{agent.name}</CardTitle>
              <CardDescription>{agent.role}</CardDescription>
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
      <CardContent>
        {agent.description && (
          <p className="text-sm text-muted-foreground">{agent.description}</p>
        )}
        {agent.reportsTo && (
          <Badge variant="outline" className="mt-2">
            Reports to {agent.reportsTo}
          </Badge>
        )}
        <p className="mt-3 text-xs text-muted-foreground">
          Last heartbeat: {timeSince(agent.lastHeartbeat)}
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
        {connected ? "Connected to Convex" : "Connecting..."}
      </span>
    </div>
  );
}

function ActivityItem({ activity }: { activity: Activity }) {
  const getActivityText = (activity: Activity): string => {
    switch (activity.type) {
      case "task_created":
        return `created task "${(activity.data?.title as string) || "Untitled"}"`;
      case "task_claimed":
        return "claimed a task";
      case "task_completed":
        return "completed a task";
      case "comment_added":
        return "added a comment";
      case "mention":
        return `mentioned @${activity.targetId}`;
      case "agent_spawned":
        return activity.data?.message as string || "joined the squad";
      case "agent_heartbeat":
        return "checked in";
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

  // Get emoji for actor (lookup from agents would be better, but this works for now)
  const getEmoji = (name: string): string => {
    const emojiMap: Record<string, string> = {
      Mako: "🦈",
      Scout: "🔍",
      Scribe: "✍️",
      Atlas: "🏛️",
      Pixel: "🎨",
      Forge: "⚙️",
      System: "🤖",
      human: "👤",
    };
    return emojiMap[name] || "🤖";
  };

  return (
    <div className="flex items-start gap-3">
      <Avatar className="h-8 w-8 text-lg">
        <AvatarFallback className="bg-slate-100">
          {getEmoji(activity.actorName)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <p className="text-sm">
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
  const agents = useQuery(api.agents.list);
  const tasks = useQuery(api.tasks.list, {});
  const activity = useQuery(api.activity.recent, { limit: 10 });

  const connected = agents !== undefined;

  const activeAgents = agents?.filter((a) => a.status === "active").length ?? 0;
  const tasksByStatus = {
    inbox: tasks?.filter((t) => t.status === "inbox").length ?? 0,
    in_progress: tasks?.filter((t) => t.status === "in_progress").length ?? 0,
    done: tasks?.filter((t) => t.status === "done").length ?? 0,
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b bg-white px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🦈</span>
            <div>
              <h1 className="text-xl font-bold">Mako Mission Control</h1>
              <p className="text-sm text-muted-foreground">
                AI Agent Orchestration Dashboard
              </p>
            </div>
          </div>
          <ConnectionStatus connected={connected} />
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl p-6">
        {/* Stats Row */}
        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Active Agents</CardDescription>
              <CardTitle className="text-3xl">{activeAgents}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Tasks in Queue</CardDescription>
              <CardTitle className="text-3xl">{tasksByStatus.inbox}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>In Progress</CardDescription>
              <CardTitle className="text-3xl">{tasksByStatus.in_progress}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Completed</CardDescription>
              <CardTitle className="text-3xl">{tasksByStatus.done}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Agents Section */}
        <section className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Agent Squad</h2>
            <Button variant="outline" size="sm">
              + Add Agent
            </Button>
          </div>
          {agents === undefined ? (
            <div className="grid gap-4 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="pb-2">
                    <div className="h-12 w-12 rounded-full bg-slate-200" />
                    <div className="h-4 w-24 bg-slate-200 rounded mt-2" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : agents.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No agents yet. Run the seed script to initialize the squad.
                <pre className="mt-2 text-xs bg-slate-100 p-2 rounded">
                  npx convex run seed:seedAgents
                </pre>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {agents.map((agent) => (
                <AgentCard key={agent._id} agent={agent as Agent} />
              ))}
            </div>
          )}
        </section>

        <Separator className="my-8" />

        {/* Activity Feed */}
        <section>
          <h2 className="mb-4 text-lg font-semibold">Recent Activity</h2>
          <Card>
            <CardContent className="p-4">
              {activity === undefined ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-start gap-3 animate-pulse">
                      <div className="h-8 w-8 rounded-full bg-slate-200" />
                      <div className="flex-1">
                        <div className="h-4 w-48 bg-slate-200 rounded" />
                        <div className="h-3 w-24 bg-slate-200 rounded mt-1" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : activity.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  No activity yet. The feed will update as agents work.
                </p>
              ) : (
                <div className="space-y-4">
                  {activity.map((item) => (
                    <ActivityItem key={item._id} activity={item as Activity} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
