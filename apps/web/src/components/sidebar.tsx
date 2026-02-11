"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: "status", label: "Status", icon: "📊", description: "Overview" },
  { id: "agents", label: "Agents", icon: "🤖", description: "Squad" },
  { id: "tasks", label: "Tasks", icon: "📋", description: "Board" },
  { id: "campaigns", label: "Campaigns", icon: "🚀", description: "Projects" },
  { id: "intelligence", label: "Intel", icon: "🔍", description: "Research" },
];

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside 
      className={cn(
        "glass-sidebar h-screen flex flex-col transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl glass flex items-center justify-center text-2xl">
          🦈
        </div>
        {!collapsed && (
          <div>
            <h1 className="font-bold text-lg text-gradient">Mako</h1>
            <p className="text-xs text-muted-foreground">Mission Control</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
              "glass-hover",
              activeTab === tab.id && "glass-active glow-blue"
            )}
          >
            <span className="text-xl">{tab.icon}</span>
            {!collapsed && (
              <div className="text-left">
                <div className="font-medium text-sm">{tab.label}</div>
                <div className="text-xs text-muted-foreground">{tab.description}</div>
              </div>
            )}
          </button>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="p-4 border-t border-border/30">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg glass-hover text-sm text-muted-foreground"
        >
          {collapsed ? "→" : "← Collapse"}
        </button>
      </div>
    </aside>
  );
}
