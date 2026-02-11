"use client";

import { cn } from "@/lib/utils";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: "status", label: "Dashboard", icon: "📊" },
  { id: "journal", label: "Journal", icon: "📓" },
  { id: "documents", label: "Documents", icon: "📄" },
  { id: "agents", label: "Agents", icon: "🤖" },
  { id: "intelligence", label: "Intelligence", icon: "🔍" },
  { id: "campaigns", label: "Campaigns", icon: "🚀" },
  { id: "tasks", label: "Tasks", icon: "✅" },
];

const systemItems = [
  { id: "cron", label: "Cron Jobs", icon: "⏰" },
  { id: "api", label: "API Usage", icon: "📡" },
  { id: "settings", label: "Settings", icon: "⚙️" },
];

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <aside className="liquid-sidebar w-60 h-screen flex flex-col">
      {/* Logo */}
      <div className="p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
            <span className="text-xl">🦈</span>
          </div>
          <div>
            <h1 className="font-semibold">Mission Control</h1>
            <div className="flex items-center gap-2">
              <div className="status-dot status-online" />
              <span className="text-xs text-secondary">Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto">
        <div className="space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "nav-item w-full flex items-center gap-3 text-sm",
                activeTab === item.id && "nav-item-active"
              )}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        <div className="mt-8">
          <p className="px-3 mb-2 text-[11px] font-medium text-tertiary uppercase tracking-wider">
            System
          </p>
          <div className="space-y-1">
            {systemItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "nav-item w-full flex items-center gap-3 text-sm",
                  activeTab === item.id && "nav-item-active"
                )}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* User */}
      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-500 to-gray-700 flex items-center justify-center">
            <span>👤</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Kamaal</p>
            <p className="text-xs text-secondary">Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
