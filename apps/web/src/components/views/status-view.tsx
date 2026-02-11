"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export function StatusView() {
  const agents = useQuery(api.agents.list);
  const tasks = useQuery(api.tasks.list, {});
  const activity = useQuery(api.activity.recent, { limit: 6 });

  const activeAgents = agents?.filter((a) => a.status === "active").length ?? 0;
  const totalTasks = tasks?.length ?? 0;
  const doneTasks = tasks?.filter((t) => t.status === "done").length ?? 0;
  const inProgressTasks = tasks?.filter((t) => 
    t.status === "in_progress" || t.status === "assigned"
  ).length ?? 0;
  const queuedTasks = tasks?.filter((t) => t.status === "inbox").length ?? 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold mb-2">Mission Control</h1>
        <p className="text-secondary">Real-time overview of all systems</p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-4 gap-5">
        <StatusCard
          icon="●"
          color="green"
          label="Status"
          value="Online"
          detail="Ready and waiting for tasks"
        />
        <StatusCard
          icon="◐"
          color="blue"
          label="Workshop"
          value={`${inProgressTasks} active`}
          detail={`${queuedTasks} queued`}
        />
        <StatusCard
          icon="👥"
          color="purple"
          label="Agents"
          value={`${activeAgents}/${agents?.length ?? 0}`}
          detail="Currently online"
        />
        <StatusCard
          icon="✓"
          color="orange"
          label="Completed"
          value={String(doneTasks)}
          detail="Tasks done"
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-[1fr_340px] gap-6">
        {/* Activity Feed */}
        <div className="liquid-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold">Live Activity</h2>
            <span className="kanban-count">{activity?.length ?? 0} events</span>
          </div>
          
          <div className="space-y-1">
            {activity === undefined ? (
              <div className="empty-state">
                <div className="empty-state-icon">⏳</div>
                <span>Loading activity...</span>
              </div>
            ) : activity.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📭</div>
                <span>No activity yet</span>
              </div>
            ) : (
              activity.map((item) => (
                <ActivityRow key={item._id} activity={item} />
              ))
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          {/* Quick Actions */}
          <div className="liquid-card p-5">
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <QuickAction icon="📋" label="Create Task" color="blue" />
              <QuickAction icon="🔄" label="Refresh Status" color="green" />
              <QuickAction icon="📊" label="View Analytics" color="purple" />
            </div>
          </div>

          {/* Recent Tasks */}
          <div className="liquid-card p-5">
            <h3 className="font-semibold mb-4">Recent Tasks</h3>
            <div className="space-y-3">
              {tasks?.slice(0, 4).map((task) => (
                <div key={task._id} className="flex items-center gap-3 group">
                  <div className={`w-2 h-2 rounded-full ${
                    task.status === "done" ? "bg-[#30d158]" : 
                    task.status === "in_progress" ? "bg-[#ff9f0a]" : "bg-white/30"
                  }`} />
                  <span className="text-sm truncate flex-1 group-hover:text-white transition-colors">{task.title}</span>
                </div>
              ))}
              {(!tasks || tasks.length === 0) && (
                <p className="text-sm text-secondary">No tasks yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusCard({ 
  icon, 
  color,
  label, 
  value, 
  detail 
}: { 
  icon: string;
  color: "green" | "blue" | "purple" | "orange";
  label: string;
  value: string;
  detail: string;
}) {
  const colorClasses = {
    green: "stat-card-green accent-green",
    blue: "stat-card-blue accent-blue",
    purple: "stat-card-purple accent-purple",
    orange: "stat-card-orange accent-orange",
  };

  return (
    <div className={`liquid-card stat-card ${colorClasses[color].split(" ")[0]} p-5 hover-lift`}>
      <div className="flex items-center gap-2 mb-3">
        <span className={colorClasses[color].split(" ")[1]}>{icon}</span>
        <span className="text-sm text-secondary">{label}</span>
      </div>
      <div className="text-2xl font-semibold mb-1">{value}</div>
      <div className="text-sm text-secondary">{detail}</div>
    </div>
  );
}

function ActivityRow({ activity }: { activity: any }) {
  const getIconData = (type: string) => {
    if (type.includes("task")) return { icon: "📋", bg: "activity-icon-task" };
    if (type.includes("agent") || type.includes("heartbeat")) return { icon: "🤖", bg: "activity-icon-agent" };
    if (type.includes("system") || type.includes("spawn")) return { icon: "⚡", bg: "activity-icon-system" };
    return { icon: "📌", bg: "activity-icon-task" };
  };

  const timeSince = (ts: number) => {
    const s = Math.floor((Date.now() - ts) / 1000);
    if (s < 60) return "now";
    if (s < 3600) return `${Math.floor(s / 60)}m`;
    return `${Math.floor(s / 3600)}h`;
  };

  const { icon, bg } = getIconData(activity.type);

  return (
    <div className="activity-item group cursor-pointer">
      <div className={`activity-icon ${bg}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium group-hover:text-white transition-colors">{activity.actorName}</p>
        <p className="text-xs text-secondary">
          {activity.type.replace(/_/g, " ")}
        </p>
      </div>
      <span className="text-xs text-tertiary">{timeSince(activity._creationTime)}</span>
    </div>
  );
}

function QuickAction({ icon, label, color }: { icon: string; label: string; color: string }) {
  const hoverClasses: Record<string, string> = {
    blue: "hover:bg-[#0a84ff]/10",
    green: "hover:bg-[#30d158]/10",
    purple: "hover:bg-[#bf5af2]/10",
  };

  return (
    <button className={`w-full flex items-center gap-3 p-3 rounded-xl ${hoverClasses[color]} transition-all text-left hover:translate-x-1`}>
      <span className="text-lg">{icon}</span>
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}
