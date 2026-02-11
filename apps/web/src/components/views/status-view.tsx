"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export function StatusView() {
  const agents = useQuery(api.agents.list);
  const tasks = useQuery(api.tasks.list, {});
  const activity = useQuery(api.activity.recent, { limit: 10 });

  const activeAgents = agents?.filter((a) => a.status === "active").length ?? 0;
  const totalTasks = tasks?.length ?? 0;
  const doneTasks = tasks?.filter((t) => t.status === "done").length ?? 0;
  const inProgressTasks = tasks?.filter((t) => 
    t.status === "in_progress" || t.status === "assigned"
  ).length ?? 0;

  const stats = [
    { label: "Active Agents", value: `${activeAgents}/${agents?.length ?? 0}`, icon: "🤖", color: "glow-green" },
    { label: "Total Tasks", value: totalTasks, icon: "📋", color: "" },
    { label: "In Progress", value: inProgressTasks, icon: "🔄", color: "glow-blue" },
    { label: "Completed", value: doneTasks, icon: "✅", color: "glow-green" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gradient">Status Overview</h2>
        <p className="text-muted-foreground">Real-time mission status</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className={`glass-card p-6 ${stat.color}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{stat.icon}</span>
            </div>
            <div className="text-3xl font-bold mb-1">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Activity Feed */}
      <div className="glass-card p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <span>⚡</span> Live Activity
        </h3>
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {activity === undefined ? (
            <div className="text-center text-muted-foreground py-8">Loading...</div>
          ) : activity.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">No activity yet</div>
          ) : (
            activity.map((item) => (
              <ActivityItem key={item._id} activity={item} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function ActivityItem({ activity }: { activity: any }) {
  const agentEmojis: Record<string, string> = {
    Mako: "🦈", Scout: "🔍", Scribe: "✍️", Atlas: "🏛️", Pixel: "🎨", Forge: "⚙️", System: "🤖",
  };

  const getActivityText = (a: any): string => {
    switch (a.type) {
      case "task_created": return `created "${a.data?.title || "task"}"`;
      case "task_claimed": return "claimed a task";
      case "task_completed": return "completed a task";
      case "task_updated": return `moved task to ${a.data?.newStatus}`;
      case "agent_heartbeat": return "checked in ✓";
      default: return a.type.replace(/_/g, " ");
    }
  };

  const timeSince = (ts: number) => {
    const s = Math.floor((Date.now() - ts) / 1000);
    if (s < 60) return "Just now";
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    return `${Math.floor(s / 3600)}h ago`;
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg glass-hover">
      <div className="w-8 h-8 rounded-full glass flex items-center justify-center text-sm">
        {agentEmojis[activity.actorName] || "🤖"}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm">
          <span className="font-medium">{activity.actorName}</span>{" "}
          <span className="text-muted-foreground">{getActivityText(activity)}</span>
        </p>
      </div>
      <span className="text-xs text-muted-foreground">{timeSince(activity._creationTime)}</span>
    </div>
  );
}
