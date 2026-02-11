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
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500/80 to-purple-600/80 flex items-center justify-center shadow-lg shadow-purple-500/20 border border-white/10">
            <span className="text-2xl">🦈</span>
          </div>
          <div>
            <h1 className="font-semibold text-[15px]">Mission Control</h1>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#30d158] shadow-[0_0_6px_rgba(48,209,88,0.8)]" />
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
                "nav-item w-full flex items-center gap-3 text-sm font-medium transition-all",
                activeTab === item.id 
                  ? "nav-item-active shadow-[0_0_20px_rgba(10,132,255,0.15)]" 
                  : "hover:translate-x-0.5"
              )}
            >
              <span className="text-base w-6 text-center">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        <div className="mt-8">
          <p className="px-3 mb-3 text-[10px] font-semibold text-tertiary uppercase tracking-widest">
            System
          </p>
          <div className="space-y-1">
            {systemItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "nav-item w-full flex items-center gap-3 text-sm font-medium transition-all",
                  activeTab === item.id 
                    ? "nav-item-active shadow-[0_0_20px_rgba(10,132,255,0.15)]" 
                    : "hover:translate-x-0.5"
                )}
              >
                <span className="text-base w-6 text-center">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* User */}
      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/50 to-purple-600/50 flex items-center justify-center text-sm border border-white/10">
            K
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Kamaal</p>
            <p className="text-[11px] text-secondary">Admin</p>
          </div>
          <span className="text-secondary text-xs">⚡</span>
        </div>
      </div>
    </aside>
  );
}
