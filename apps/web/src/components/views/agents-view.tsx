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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gradient">Agent Squad</h2>
          <p className="text-muted-foreground">Your AI team members</p>
        </div>
        <button className="px-4 py-2 rounded-xl glass glass-hover text-sm font-medium">
          + Add Agent
        </button>
      </div>

      {/* Agent Grid */}
      {agents === undefined ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="glass-card p-6 animate-pulse h-48" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => (
            <div key={agent._id} className="glass-card p-6 hover:glow-blue transition-all duration-300">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl glass flex items-center justify-center text-2xl">
                    {agent.emoji}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{agent.name}</h3>
                    <p className="text-sm text-muted-foreground">{agent.role}</p>
                  </div>
                </div>
                <div className={`w-3 h-3 rounded-full status-${agent.status}`} />
              </div>

              {/* Description */}
              {agent.description && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {agent.description}
                </p>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border/30">
                <span className="capitalize">{agent.status}</span>
                <span>Last seen: {timeSince(agent.lastHeartbeat)}</span>
              </div>

              {/* Reports To */}
              {agent.reportsTo && (
                <div className="mt-3 px-3 py-1.5 rounded-lg glass text-xs">
                  Reports to: <span className="font-medium">{agent.reportsTo}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
