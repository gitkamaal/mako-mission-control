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
          iconClass="accent-green"
          label="Status"
          value="Online"
          detail="Ready and waiting for tasks"
        />
        <StatusCard
          icon="◐"
          iconClass="accent-blue"
          label="Workshop"
          value={`${inProgressTasks} active`}
          detail={`${queuedTasks} queued`}
        />
        <StatusCard
          icon="👥"
          iconClass="accent-purple"
          label="Agents"
          value={`${activeAgents}/${agents?.length ?? 0}`}
          detail="Currently online"
        />
        <StatusCard
          icon="✓"
          iconClass="accent-green"
          label="Completed"
          value={String(doneTasks)}
          detail="Tasks done"
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-[1fr_320px] gap-6">
        {/* Activity Feed */}
        <div className="liquid-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold">Live Activity</h2>
            <span className="text-sm text-secondary">{activity?.length ?? 0} events</span>
          </div>
          
          <div className="space-y-2">
            {activity === undefined ? (
              <div className="text-center text-secondary py-8">Loading...</div>
            ) : activity.length === 0 ? (
              <div className="text-center text-secondary py-8">No activity yet</div>
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
              <QuickAction icon="📋" label="Create Task" />
              <QuickAction icon="🔄" label="Refresh Status" />
              <QuickAction icon="📊" label="View Analytics" />
            </div>
          </div>

          {/* Recent Tasks */}
          <div className="liquid-card p-5">
            <h3 className="font-semibold mb-4">Recent Tasks</h3>
            <div className="space-y-3">
              {tasks?.slice(0, 4).map((task) => (
                <div key={task._id} className="flex items-center gap-3">
                  <div className={`status-dot ${
                    task.status === "done" ? "status-active" : 
                    task.status === "in_progress" ? "status-idle" : "status-offline"
                  }`} />
                  <span className="text-sm truncate flex-1">{task.title}</span>
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
  iconClass,
  label, 
  value, 
  detail 
}: { 
  icon: string;
  iconClass: string;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="liquid-card p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className={iconClass}>{icon}</span>
        <span className="text-sm text-secondary">{label}</span>
      </div>
      <div className="text-2xl font-semibold mb-1">{value}</div>
      <div className="text-sm text-secondary">{detail}</div>
    </div>
  );
}

function ActivityRow({ activity }: { activity: any }) {
  const getIcon = (type: string) => {
    if (type.includes("task")) return "📋";
    if (type.includes("agent")) return "🤖";
    if (type.includes("comment")) return "💬";
    return "⚡";
  };

  const getStatusClass = (type: string) => {
    if (type.includes("completed")) return "status-active";
    if (type.includes("progress") || type.includes("claimed")) return "status-idle";
    return "status-offline";
  };

  const timeSince = (ts: number) => {
    const s = Math.floor((Date.now() - ts) / 1000);
    if (s < 60) return "now";
    if (s < 3600) return `${Math.floor(s / 60)}m`;
    return `${Math.floor(s / 3600)}h`;
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors">
      <div className={`status-dot ${getStatusClass(activity.type)}`} />
      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-sm">
        {getIcon(activity.type)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{activity.actorName}</p>
        <p className="text-xs text-secondary truncate">
          {activity.type.replace(/_/g, " ")}
        </p>
      </div>
      <span className="text-xs text-secondary">{timeSince(activity._creationTime)}</span>
    </div>
  );
}

function QuickAction({ icon, label }: { icon: string; label: string }) {
  return (
    <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-left">
      <span className="text-lg">{icon}</span>
      <span className="text-sm">{label}</span>
    </button>
  );
}
