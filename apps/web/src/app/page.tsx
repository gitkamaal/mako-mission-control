"use client";

import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { StatusView } from "@/components/views/status-view";
import { AgentsView } from "@/components/views/agents-view";
import { TasksView } from "@/components/views/tasks-view";
import { CampaignsView } from "@/components/views/campaigns-view";
import { IntelligenceView } from "@/components/views/intelligence-view";
import { JournalView } from "@/components/views/journal-view";
import { DocumentsView } from "@/components/views/documents-view";
import { CronView } from "@/components/views/cron-view";
import { SettingsView } from "@/components/views/settings-view";

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
      case "journal":
        return <JournalView />;
      case "documents":
        return <DocumentsView />;
      case "cron":
        return <CronView />;
      case "settings":
        return <SettingsView />;
      default:
        return <StatusView />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {renderView()}
        </div>
      </main>
    </div>
  );
}
