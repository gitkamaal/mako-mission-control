"use client";

import { useState, useEffect } from "react";

interface Article {
  id: string;
  title: string;
  source: string;
  sourceIcon: string;
  summary: string;
  relevance: "high" | "medium" | "low";
  timestamp: string;
  url: string;
  tags: string[];
  read: boolean;
}

// Mock data - in production this would come from web search API
const mockArticles: Article[] = [
  {
    id: "1",
    title: "The Rise of Multi-Agent AI Systems in 2025",
    source: "TechCrunch",
    sourceIcon: "📰",
    summary: "Multi-agent AI systems are becoming the new standard for complex task automation. Companies are moving beyond single-agent chatbots to coordinated teams of specialized AI agents that can handle entire workflows autonomously. This shift represents a fundamental change in how businesses approach automation.",
    relevance: "high",
    timestamp: "2 hours ago",
    url: "#",
    tags: ["AI", "Agents", "Automation"],
    read: false,
  },
  {
    id: "2",
    title: "Building Mission Control Dashboards for AI Agent Orchestration",
    source: "Dev.to",
    sourceIcon: "👨‍💻",
    summary: "A deep dive into the architecture patterns for building real-time dashboards that coordinate multiple AI agents. Covers WebSocket connections, state management with Convex, and UI patterns for visualizing agent activity.",
    relevance: "high",
    timestamp: "5 hours ago",
    url: "#",
    tags: ["Tutorial", "Dashboard", "Architecture"],
    read: false,
  },
  {
    id: "3",
    title: "Convex Announces New Real-time Collaboration Features",
    source: "Convex Blog",
    sourceIcon: "⚡",
    summary: "Convex has released new features for building collaborative applications, including improved conflict resolution and new query patterns for real-time data synchronization.",
    relevance: "medium",
    timestamp: "1 day ago",
    url: "#",
    tags: ["Convex", "Database", "Update"],
    read: true,
  },
  {
    id: "4",
    title: "The Heartbeat Pattern for Agent Coordination",
    source: "Medium",
    sourceIcon: "📝",
    summary: "Exploring how staggered cron jobs can coordinate AI agents efficiently while minimizing API costs. The heartbeat pattern allows agents to check in periodically, claim tasks, and communicate asynchronously.",
    relevance: "high",
    timestamp: "2 days ago",
    url: "#",
    tags: ["Pattern", "Agents", "Architecture"],
    read: true,
  },
  {
    id: "5",
    title: "Tauri 3.0: Build Native Apps with Web Technology",
    source: "Tauri Blog",
    sourceIcon: "🦀",
    summary: "Tauri 3.0 introduces new APIs for system integration, improved security model, and better support for building cross-platform desktop applications with Rust and web technologies.",
    relevance: "medium",
    timestamp: "3 days ago",
    url: "#",
    tags: ["Tauri", "Desktop", "Rust"],
    read: false,
  },
];

const relevanceColors: Record<string, string> = {
  high: "bg-green-500/20 text-green-300 border-green-500/30",
  medium: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  low: "bg-slate-500/20 text-slate-300 border-slate-500/30",
};

export function IntelligenceView() {
  const [articles, setArticles] = useState(mockArticles);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [filter, setFilter] = useState<"all" | "unread" | "high">("all");
  const [searching, setSearching] = useState(false);

  const filteredArticles = articles.filter((a) => {
    if (filter === "unread") return !a.read;
    if (filter === "high") return a.relevance === "high";
    return true;
  });

  const handleSearch = () => {
    setSearching(true);
    // Simulate search
    setTimeout(() => setSearching(false), 2000);
  };

  const markAsRead = (id: string) => {
    setArticles(articles.map(a => a.id === id ? { ...a, read: true } : a));
  };

  return (
    <div className="flex gap-6 h-full">
      {/* Article List */}
      <div className="w-[400px] flex flex-col">
        {/* Header */}
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gradient">Intelligence</h2>
          <p className="text-muted-foreground">Research & insights</p>
        </div>

        {/* Search & Filters */}
        <div className="flex gap-2 mb-4">
          <button 
            onClick={handleSearch}
            disabled={searching}
            className="flex-1 px-4 py-2 rounded-xl glass glass-hover text-sm font-medium"
          >
            {searching ? "🔄 Searching..." : "🔍 Search Web"}
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          {(["all", "unread", "high"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === f ? "glass-active" : "glass glass-hover"
              }`}
            >
              {f === "all" ? "All" : f === "unread" ? "Unread" : "High Priority"}
            </button>
          ))}
        </div>

        {/* Article List */}
        <div className="flex-1 space-y-2 overflow-y-auto pr-2">
          {filteredArticles.map((article) => (
            <div
              key={article.id}
              onClick={() => {
                setSelectedArticle(article);
                markAsRead(article.id);
              }}
              className={`p-4 rounded-xl glass cursor-pointer transition-all duration-200 ${
                selectedArticle?.id === article.id ? "glass-active glow-blue" : "glass-hover"
              } ${!article.read ? "border-l-2 border-l-blue-500" : ""}`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className="font-medium text-sm leading-tight line-clamp-2">{article.title}</h4>
                <span className={`px-2 py-0.5 rounded text-[10px] border ${relevanceColors[article.relevance]}`}>
                  {article.relevance}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{article.sourceIcon}</span>
                <span>{article.source}</span>
                <span>•</span>
                <span>{article.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Article Detail */}
      <div className="flex-1 glass-card p-6 overflow-y-auto">
        {selectedArticle ? (
          <article className="max-w-2xl">
            {/* Article Header */}
            <div className="mb-6 pb-6 border-b border-border/30">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                <span className="text-lg">{selectedArticle.sourceIcon}</span>
                <span className="font-medium">{selectedArticle.source}</span>
                <span>•</span>
                <span>{selectedArticle.timestamp}</span>
              </div>
              <h1 className="text-2xl font-bold mb-4">{selectedArticle.title}</h1>
              <div className="flex flex-wrap gap-2">
                {selectedArticle.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 rounded-full glass text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Article Content */}
            <div className="prose prose-invert max-w-none">
              <p className="text-lg leading-relaxed text-muted-foreground mb-6">
                {selectedArticle.summary}
              </p>
              
              <div className="p-4 rounded-xl glass mb-6">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <span>💡</span> Key Takeaways
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• This article is relevant to our current mission</li>
                  <li>• Consider applying these concepts to Mission Control</li>
                  <li>• Scout agent could research this topic further</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <button className="px-4 py-2 rounded-xl glass glass-hover text-sm">
                  📋 Create Task
                </button>
                <button className="px-4 py-2 rounded-xl glass glass-hover text-sm">
                  🔗 Open Source
                </button>
                <button className="px-4 py-2 rounded-xl glass glass-hover text-sm">
                  📤 Share
                </button>
              </div>
            </div>
          </article>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <div className="text-4xl mb-4">📰</div>
              <p>Select an article to read</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
