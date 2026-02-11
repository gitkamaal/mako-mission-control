"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

// Types
interface Session {
  key: string;
  kind: string;
  agentId?: string;
  model?: string;
  channel?: string;
  createdAt: string;
  lastActivity?: string;
}

interface Agent {
  id: string;
  name: string;
  emoji: string;
  role: string;
  status: "active" | "idle" | "offline";
  currentTask?: string;
  lastSeen?: string;
}

// Mock data for initial UI
const mockAgents: Agent[] = [
  {
    id: "mako",
    name: "Mako",
    emoji: "🦈",
    role: "Lead Agent",
    status: "active",
    currentTask: "Building Mission Control",
    lastSeen: "Just now",
  },
  {
    id: "scout",
    name: "Scout",
    emoji: "🔍",
    role: "Researcher",
    status: "idle",
    lastSeen: "15 min ago",
  },
  {
    id: "scribe",
    name: "Scribe",
    emoji: "✍️",
    role: "Writer",
    status: "offline",
    lastSeen: "2 hours ago",
  },
];

function AgentCard({ agent }: { agent: Agent }) {
  const statusColors = {
    active: "bg-green-500",
    idle: "bg-yellow-500",
    offline: "bg-gray-400",
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
        {agent.currentTask && (
          <div className="mt-2 rounded-md bg-slate-50 p-3">
            <p className="text-sm font-medium text-slate-700">Current Task</p>
            <p className="text-sm text-slate-600">{agent.currentTask}</p>
          </div>
        )}
        <p className="mt-3 text-xs text-muted-foreground">
          Last seen: {agent.lastSeen}
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
        {connected ? "Connected to Gateway" : "Disconnected"}
      </span>
    </div>
  );
}

export default function Dashboard() {
  const [connected, setConnected] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    // Simulate connection for now
    const timer = setTimeout(() => setConnected(true), 1000);
    return () => clearTimeout(timer);
  }, []);

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
              <CardTitle className="text-3xl">1</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Active Sessions</CardDescription>
              <CardTitle className="text-3xl">{sessions.length || 1}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Tasks Today</CardDescription>
              <CardTitle className="text-3xl">3</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Uptime</CardDescription>
              <CardTitle className="text-3xl">99.9%</CardTitle>
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
          <div className="grid gap-4 md:grid-cols-3">
            {mockAgents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        </section>

        <Separator className="my-8" />

        {/* Activity Feed */}
        <section>
          <h2 className="mb-4 text-lg font-semibold">Recent Activity</h2>
          <Card>
            <CardContent className="p-4">
              <div className="space-y-4">
                <ActivityItem
                  agent="Mako"
                  emoji="🦈"
                  action="Started building Mission Control dashboard"
                  time="Just now"
                />
                <ActivityItem
                  agent="Mako"
                  emoji="🦈"
                  action="Created GitHub repository mako-mission-control"
                  time="2 min ago"
                />
                <ActivityItem
                  agent="Mako"
                  emoji="🦈"
                  action="Connected to Clawdbot Gateway"
                  time="5 min ago"
                />
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}

function ActivityItem({
  agent,
  emoji,
  action,
  time,
}: {
  agent: string;
  emoji: string;
  action: string;
  time: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Avatar className="h-8 w-8 text-lg">
        <AvatarFallback className="bg-slate-100">{emoji}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <p className="text-sm">
          <span className="font-medium">{agent}</span>{" "}
          <span className="text-muted-foreground">{action}</span>
        </p>
        <p className="text-xs text-muted-foreground">{time}</p>
      </div>
    </div>
  );
}
