"use client";

import { cn } from "@/lib/utils";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navigation = [
  { id: "status", label: "Dashboard", icon: "◉" },
];

const mainNav = [
  { id: "journal", label: "Journal", icon: "📓" },
  { id: "documents", label: "Documents", icon: "📄" },
  { id: "agents", label: "Agents", icon: "🤖" },
  { id: "intelligence", label: "Intelligence", icon: "🔍" },
  { id: "campaigns", label: "Weekly Recaps", icon: "📊" },
  { id: "tasks", label: "Tasks", icon: "✅" },
];

const systemNav = [
  { id: "cron", label: "Cron Jobs", icon: "⏰" },
  { id: "api", label: "API Usage", icon: "📡" },
  { id: "workshops", label: "Workshops", icon: "🔧" },
];

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <aside className="glass-sidebar w-56 h-screen flex flex-col">
      {/* Header */}
      <div className="p-4 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-lg">🦈</span>
          </div>
          <div>
            <h1 className="font-semibold text-sm">Mission Control</h1>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full status-online" />
              <span className="text-xs text-muted-foreground">Idle</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 overflow-y-auto">
        {/* Main Navigation */}
        <div className="space-y-0.5">
          <p className="px-3 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Navigation
          </p>
          {navigation.map((item) => (
            <NavItem
              key={item.id}
              item={item}
              active={activeTab === item.id}
              onClick={() => onTabChange(item.id)}
            />
          ))}
          {mainNav.map((item) => (
            <NavItem
              key={item.id}
              item={item}
              active={activeTab === item.id}
              onClick={() => onTabChange(item.id)}
            />
          ))}
        </div>

        {/* System */}
        <div className="mt-6 space-y-0.5">
          <p className="px-3 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            System
          </p>
          {systemNav.map((item) => (
            <NavItem
              key={item.id}
              item={item}
              active={activeTab === item.id}
              onClick={() => onTabChange(item.id)}
            />
          ))}
        </div>

        {/* Recent Documents */}
        <div className="mt-6 space-y-0.5">
          <p className="px-3 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Recent Documents
          </p>
          <div className="px-3 py-2 text-xs text-muted-foreground">
            No recent documents
          </div>
        </div>
      </nav>

      {/* User */}
      <div className="p-3 border-t border-border/30">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/5 cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center">
            <span className="text-sm">👤</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">User</p>
            <p className="text-xs text-muted-foreground">Pro Plan</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function NavItem({ 
  item, 
  active, 
  onClick 
}: { 
  item: { id: string; label: string; icon: string }; 
  active: boolean; 
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150",
        active 
          ? "nav-selected bg-blue-500/10 text-white" 
          : "text-muted-foreground hover:text-foreground hover:bg-white/5"
      )}
    >
      <span className="text-base w-5 text-center">{item.icon}</span>
      <span>{item.label}</span>
    </button>
  );
}
