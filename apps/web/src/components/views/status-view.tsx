"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export function StatusView() {
  const agents = useQuery(api.agents.list);
  const tasks = useQuery(api.tasks.list, {});
  const activity = useQuery(api.activity.recent, { limit: 8 });

  const activeAgents = agents?.filter((a) => a.status === "active").length ?? 0;
  const totalTasks = tasks?.length ?? 0;
  const doneTasks = tasks?.filter((t) => t.status === "done").length ?? 0;
  const inProgressTasks = tasks?.filter((t) => 
    t.status === "in_progress" || t.status === "assigned"
  ).length ?? 0;
  const queuedTasks = tasks?.filter((t) => t.status === "inbox").length ?? 0;

  const completionPercent = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Mission Control</h1>
        <p className="text-sm text-muted-foreground">Real-time overview of all systems</p>
      </div>

      {/* Status Cards Row */}
      <div className="grid grid-cols-4 gap-4">
        <StatusCard
          icon="●"
          iconColor="text-green-500"
          label="STATUS"
          value="Online"
          detail="Ready and waiting for tasks"
          subDetail={`⏱ ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
          hasRefresh
        />
        <StatusCard
          icon="◉"
          iconColor="text-blue-400"
          label="WORKSHOP"
          value={`${inProgressTasks} active`}
          detail={`${queuedTasks} queued · ${completionPercent}% done`}
          hasArrow
        />
        <StatusCard
          icon="👤"
          iconColor="text-purple-400"
          label="CLIENTS"
          value={String(activeAgents)}
          detail="No recent activity"
        />
        <StatusCard
          icon="📄"
          iconColor="text-cyan-400"
          label="DOCUMENTS"
          value={String(doneTasks)}
          detail="Total processed"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-[1fr_300px] gap-6">
        {/* Left Column - Activity & Commits */}
        <div className="space-y-6">
          {/* Live Activity */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold flex items-center gap-2">
                <span className="text-blue-400">⚡</span> Live Activity
              </h2>
              <button className="text-xs text-blue-400 hover:text-blue-300">
                View Workshop →
              </button>
            </div>
            
            <div className="space-y-1">
              {activity === undefined ? (
                <div className="text-center text-muted-foreground py-8">Loading...</div>
              ) : activity.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">No activity yet</div>
              ) : (
                activity.slice(0, 5).map((item) => (
                  <ActivityRow key={item._id} activity={item} />
                ))
              )}
            </div>
          </div>

          {/* Recent Commits */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold flex items-center gap-2">
                <span className="text-orange-400">⬤</span> Recent Commits
              </h2>
              <span className="text-xs text-muted-foreground">{doneTasks} total</span>
            </div>
            
            <div className="space-y-3">
              {tasks === undefined ? (
                <div className="text-center text-muted-foreground py-4">Loading...</div>
              ) : (
                tasks
                  .filter((t) => t.status === "done")
                  .slice(0, 4)
                  .map((task) => (
                    <CommitRow key={task._id} task={task} />
                  ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar widgets */}
        <div className="space-y-4">
          {/* Bandwidth */}
          <div className="glass-card p-4">
            <h3 className="text-xs font-semibold text-muted-foreground mb-3">BANDWIDTH</h3>
            <p className="text-sm text-muted-foreground">Available for new tasks</p>
          </div>

          {/* Recent Documents */}
          <div className="glass-card p-4">
            <h3 className="text-xs font-semibold text-muted-foreground mb-3">Recent Documents</h3>
            <div className="flex items-center justify-center py-6 text-muted-foreground">
              <div className="text-center">
                <span className="text-2xl mb-2 block opacity-50">📄</span>
                <p className="text-xs">No documents yet</p>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="glass-card p-4">
            <h3 className="text-xs font-semibold text-muted-foreground mb-3">Quick Links</h3>
            <div className="space-y-2">
              <QuickLink icon="🔄" label="Workshop Queue" color="text-blue-400" />
              <QuickLink icon="🤖" label="Agent Intelligence" color="text-purple-400" />
              <QuickLink icon="📊" label="Analytics" color="text-green-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusCard({ 
  icon, 
  iconColor, 
  label, 
  value, 
  detail, 
  subDetail,
  hasRefresh,
  hasArrow 
}: { 
  icon: string;
  iconColor: string;
  label: string;
  value: string;
  detail: string;
  subDetail?: string;
  hasRefresh?: boolean;
  hasArrow?: boolean;
}) {
  return (
    <div className="glass-status p-4 hover:glow-blue transition-all duration-300">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={iconColor}>{icon}</span>
          <span className="text-xs font-semibold text-muted-foreground">{label}</span>
        </div>
        {hasRefresh && (
          <button className="text-muted-foreground hover:text-foreground text-sm">⟳</button>
        )}
        {hasArrow && (
          <span className="text-muted-foreground text-sm">→</span>
        )}
      </div>
      <div className="text-lg font-semibold mb-1">{value}</div>
      <div className="text-xs text-muted-foreground">{detail}</div>
      {subDetail && (
        <div className="text-xs text-muted-foreground mt-1">{subDetail}</div>
      )}
    </div>
  );
}

function ActivityRow({ activity }: { activity: any }) {
  const agentEmojis: Record<string, string> = {
    Mako: "🦈", Scout: "🔍", Scribe: "✍️", Atlas: "🏛️", Pixel: "🎨", Forge: "⚙️", System: "🤖",
  };

  const getStatusColor = (type: string) => {
    if (type.includes("completed") || type.includes("success")) return "status-success";
    if (type.includes("progress") || type.includes("claimed")) return "status-progress";
    return "status-active";
  };

  const getActivityText = (a: any): string => {
    switch (a.type) {
      case "task_created": return `Created: ${a.data?.title || "task"}`;
      case "task_claimed": return "Claimed task";
      case "task_completed": return "Completed task";
      case "task_updated": return `Status: ${a.data?.newStatus}`;
      case "agent_heartbeat": return "HEARTBEAT_OK No system events";
      default: return a.type.replace(/_/g, " ");
    }
  };

  const timeSince = (ts: number) => {
    const s = Math.floor((Date.now() - ts) / 1000);
    if (s < 60) return "now";
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    return `${Math.floor(s / 3600)}h ago`;
  };

  return (
    <div className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-white/5 transition-colors">
      <div className={`w-2 h-2 rounded-full ${getStatusColor(activity.type)}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">
            {activity.type.includes("progress") ? "In Progress" : activity.type.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
          </span>
        </div>
        <p className="text-xs text-muted-foreground truncate">{getActivityText(activity)}</p>
      </div>
      <span className="text-xs text-muted-foreground">{timeSince(activity._creationTime)}</span>
    </div>
  );
}

function CommitRow({ task }: { task: any }) {
  const timeSince = (ts: number) => {
    const s = Math.floor((Date.now() - ts) / 1000);
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
  };

  return (
    <div className="flex items-start gap-3 py-2">
      <span className="text-orange-400 mt-0.5">⬤</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{task.title}</p>
        <p className="text-xs text-muted-foreground">{task.assignedTo || "Mako"}</p>
      </div>
      <span className="text-xs text-muted-foreground">{timeSince(task._creationTime)}</span>
    </div>
  );
}

function QuickLink({ icon, label, color }: { icon: string; label: string; color: string }) {
  return (
    <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-left">
      <span className={color}>{icon}</span>
      <span className="text-sm">{label}</span>
    </button>
  );
}
