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
    <div className="flex h-screen overflow-hidden bg-[#080810]">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header Bar */}
        <header className="h-12 flex items-center justify-end px-6 border-b border-border/20">
          <div className="flex items-center gap-6">
            <span className="text-xs text-muted-foreground">
              {new Date().toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
              {" · "}
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
