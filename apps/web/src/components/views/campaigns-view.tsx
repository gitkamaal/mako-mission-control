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

export function CampaignsView() {
  const [campaigns] = useState(mockCampaigns);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; text: string; dot: string }> = {
      active: { bg: "bg-[#30d158]/15", text: "text-[#30d158]", dot: "bg-[#30d158]" },
      paused: { bg: "bg-[#ff9f0a]/15", text: "text-[#ff9f0a]", dot: "bg-[#ff9f0a]" },
      completed: { bg: "bg-white/10", text: "text-white/60", dot: "bg-white/40" },
    };
    return styles[status] || styles.paused;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Campaigns</h2>
          <p className="text-secondary">Coordinate multi-task projects</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <span>+</span> New Campaign
        </button>
      </div>

      {/* Campaign List */}
      <div className="space-y-4">
        {campaigns.map((campaign) => {
          const statusStyle = getStatusBadge(campaign.status);
          return (
            <div 
              key={campaign.id} 
              className="liquid-card p-6 hover-lift cursor-pointer group"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg group-hover:text-white transition-colors">
                      {campaign.name}
                    </h3>
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 ${statusStyle.bg} ${statusStyle.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                      {campaign.status}
                    </span>
                  </div>
                  <p className="text-sm text-secondary leading-relaxed">{campaign.description}</p>
                </div>
                <div className="text-right ml-6">
                  <div className="text-2xl font-bold">{campaign.progress}%</div>
                  <div className="text-xs text-tertiary">Progress</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="progress-bar mb-5">
                <div 
                  className="progress-fill"
                  style={{ width: `${campaign.progress}%` }}
                />
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                {/* Assigned Agents */}
                <div className="flex items-center gap-3">
                  <span className="text-xs text-tertiary">Agents:</span>
                  <div className="flex -space-x-2">
                    {campaign.agents.map((agent) => (
                      <div 
                        key={agent}
                        className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-sm border border-white/10 hover:scale-110 transition-transform"
                        title={agent}
                      >
                        {agentEmojis[agent]}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Task Count */}
                <div className="text-sm text-secondary">
                  <span className="font-semibold text-primary">{campaign.tasksCompleted}</span>
                  <span> / {campaign.totalTasks} tasks</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
