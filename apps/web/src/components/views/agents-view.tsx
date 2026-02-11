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

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Agent Squad</h1>
          <p className="text-secondary">Your AI team members</p>
        </div>
        <button className="btn-primary">
          + Add Agent
        </button>
      </div>

      {agents === undefined ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="liquid-card p-6 h-48 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {agents.map((agent) => (
            <div key={agent._id} className="liquid-card p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center text-2xl">
                    {agent.emoji}
                  </div>
                  <div>
                    <h3 className="font-semibold">{agent.name}</h3>
                    <p className="text-sm text-secondary">{agent.role}</p>
                  </div>
                </div>
                <div className={`status-dot ${
                  agent.status === "active" ? "status-active" : 
                  agent.status === "idle" ? "status-idle" : "status-offline"
                }`} />
              </div>

              {agent.description && (
                <p className="text-sm text-secondary mb-4 line-clamp-2">
                  {agent.description}
                </p>
              )}

              <div className="flex items-center justify-between text-sm pt-4 border-t border-white/5">
                <span className="text-secondary capitalize">{agent.status}</span>
                <span className="text-secondary">{timeSince(agent.lastHeartbeat)}</span>
              </div>

              {agent.reportsTo && (
                <div className="mt-3 text-xs text-secondary">
                  Reports to: <span className="text-primary">{agent.reportsTo}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
