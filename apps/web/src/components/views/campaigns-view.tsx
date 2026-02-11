"use client";

import { useState } from "react";

interface Campaign {
  id: string;
  name: string;
  description: string;
  status: "active" | "paused" | "completed";
  progress: number;
  agents: string[];
  tasksCompleted: number;
  totalTasks: number;
}

const mockCampaigns: Campaign[] = [
  {
    id: "1",
    name: "Mission Control MVP",
    description: "Build the core dashboard with agent management and task tracking",
    status: "active",
    progress: 85,
    agents: ["Mako", "Pixel", "Forge"],
    tasksCompleted: 6,
    totalTasks: 7,
  },
  {
    id: "2",
    name: "Content Marketing Launch",
    description: "Create blog posts, social content, and documentation",
    status: "paused",
    progress: 30,
    agents: ["Scout", "Scribe"],
    tasksCompleted: 3,
    totalTasks: 10,
  },
  {
    id: "3",
    name: "API Integration",
    description: "Connect external services and build webhook handlers",
    status: "active",
    progress: 45,
    agents: ["Forge", "Atlas"],
    tasksCompleted: 4,
    totalTasks: 9,
  },
];

const agentEmojis: Record<string, string> = {
  Mako: "🦈", Scout: "🔍", Scribe: "✍️", Atlas: "🏛️", Pixel: "🎨", Forge: "⚙️",
};

const statusStyles: Record<string, string> = {
  active: "status-active",
  paused: "status-idle",
  completed: "status-offline",
};

export function CampaignsView() {
  const [campaigns] = useState(mockCampaigns);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gradient">Campaigns</h2>
          <p className="text-muted-foreground">Coordinate multi-task projects</p>
        </div>
        <button className="px-4 py-2 rounded-xl glass glass-hover text-sm font-medium">
          + New Campaign
        </button>
      </div>

      {/* Campaign List */}
      <div className="space-y-4">
        {campaigns.map((campaign) => (
          <div 
            key={campaign.id} 
            className="glass-card p-6 hover:glow-blue transition-all duration-300 cursor-pointer"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-bold text-lg">{campaign.name}</h3>
                  <div className={`w-2 h-2 rounded-full ${statusStyles[campaign.status]}`} />
                  <span className="text-xs text-muted-foreground capitalize">{campaign.status}</span>
                </div>
                <p className="text-sm text-muted-foreground">{campaign.description}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{campaign.progress}%</div>
                <div className="text-xs text-muted-foreground">Progress</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="h-2 rounded-full glass mb-4 overflow-hidden">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                style={{ width: `${campaign.progress}%` }}
              />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between">
              {/* Assigned Agents */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground mr-2">Agents:</span>
                <div className="flex -space-x-2">
                  {campaign.agents.map((agent) => (
                    <div 
                      key={agent}
                      className="w-8 h-8 rounded-full glass flex items-center justify-center text-sm border-2 border-background"
                      title={agent}
                    >
                      {agentEmojis[agent]}
                    </div>
                  ))}
                </div>
              </div>

              {/* Task Count */}
              <div className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{campaign.tasksCompleted}</span>
                <span> / {campaign.totalTasks} tasks</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
