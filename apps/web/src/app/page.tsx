"use client";

import { useState } from "react";
import { UserButton } from "@clerk/nextjs";
import { Sidebar } from "@/components/sidebar";
import { StatusView } from "@/components/views/status-view";
import { AgentsView } from "@/components/views/agents-view";
import { TasksView } from "@/components/views/tasks-view";
import { CampaignsView } from "@/components/views/campaigns-view";
import { IntelligenceView } from "@/components/views/intelligence-view";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("status");

  const renderView = () => {
    switch (activeTab) {
      case "status":
        return <StatusView />;
      case "agents":
        return <AgentsView />;
      case "tasks":
        return <TasksView />;
      case "campaigns":
        return <CampaignsView />;
      case "intelligence":
        return <IntelligenceView />;
      default:
        return <StatusView />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 glass-sidebar flex items-center justify-between px-6 border-b border-border/30">
          <div className="flex items-center gap-4">
            <div className="w-2 h-2 rounded-full status-active animate-pulse-glow" />
            <span className="text-sm text-muted-foreground">System Online</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric",
              })}
            </span>
            <UserButton afterSignOutUrl="/sign-in" />
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6">
          {renderView()}
        </div>
      </main>
    </div>
  );
}
