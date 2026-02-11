"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export function AgentsView() {
  const agents = useQuery(api.agents.list);

  const timeSince = (timestamp?: number) => {
    if (!timestamp) return "Never";
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const getStatusBadge = (status: string) => {
    const classes: Record<string, string> = {
      active: "agent-active",
      idle: "agent-idle",
      offline: "agent-offline",
    };
    return classes[status] || classes.offline;
  };

  // Group agents: lead first, then by reports-to
  const sortedAgents = agents?.slice().sort((a, b) => {
    if (!a.reportsTo && b.reportsTo) return -1;
    if (a.reportsTo && !b.reportsTo) return 1;
    return 0;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Agent Squad</h1>
          <p className="text-secondary">Your AI team members</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <span>+</span> Add Agent
        </button>
      </div>

      {agents === undefined ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="liquid-card p-6 h-48 animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5" />
                <div className="flex-1">
                  <div className="h-4 bg-white/5 rounded w-24 mb-2" />
                  <div className="h-3 bg-white/5 rounded w-32" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sortedAgents?.map((agent) => (
            <div 
              key={agent._id} 
              className={`liquid-card p-6 hover-lift cursor-pointer ${
                agent.status === "active" ? "border-[#30d158]/30" : ""
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="agent-avatar">
                    {agent.emoji}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{agent.name}</h3>
                    <p className="text-sm text-secondary">{agent.role}</p>
                  </div>
                </div>
                <div className={`w-2.5 h-2.5 rounded-full ${
                  agent.status === "active" ? "bg-[#30d158] shadow-[0_0_8px_rgba(48,209,88,0.6)]" : 
                  agent.status === "idle" ? "bg-[#ff9f0a] shadow-[0_0_8px_rgba(255,159,10,0.5)]" : 
                  "bg-white/30"
                }`} />
              </div>

              {agent.description && (
                <p className="text-sm text-secondary mb-4 line-clamp-2 leading-relaxed">
                  {agent.description}
                </p>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <span className={`agent-status ${getStatusBadge(agent.status)}`}>
                  {agent.status === "active" && "●"} {agent.status}
                </span>
                <span className="text-xs text-tertiary">{timeSince(agent.lastHeartbeat)}</span>
              </div>

              {agent.reportsTo && (
                <div className="mt-3 pt-3 border-t border-white/5 text-xs text-secondary flex items-center gap-1.5">
                  <span className="opacity-60">↳</span> 
                  Reports to: <span className="text-primary font-medium">{agent.reportsTo}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      {agents && (
        <div className="mt-8 flex items-center justify-center gap-8 text-sm text-secondary">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#30d158]" />
            <span>{agents.filter(a => a.status === "active").length} Active</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#ff9f0a]" />
            <span>{agents.filter(a => a.status === "idle").length} Idle</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-white/30" />
            <span>{agents.filter(a => a.status === "offline").length} Offline</span>
          </div>
        </div>
      )}
    </div>
  );
}
