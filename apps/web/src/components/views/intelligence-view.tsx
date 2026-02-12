"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

type Topic = {
  _id: Id<"intelTopics">;
  name: string;
  emoji: string;
  keywords: string[];
  enabled: boolean;
};

type IntelItem = {
  _id: Id<"intelItems">;
  title: string;
  url?: string;
  source: string;
  sourceIcon: string;
  summary?: string;
  relevance: "high" | "medium" | "low";
  tags: string[];
  discoveredAt: number;
  saved: boolean;
  read: boolean;
  aiInsights?: string;
};

type Digest = {
  _id: Id<"intelDigests">;
  date: string;
  title: string;
  summary: string;
  highlights: Array<{
    title: string;
    insight: string;
    url?: string;
    relevance: "high" | "medium" | "low";
  }>;
  topInsights: string[];
  saasIdeas?: Array<{
    idea: string;
    painPoint: string;
    opportunity: string;
  }>;
  generatedAt: number;
  read: boolean;
};

export function IntelligenceView() {
  const [activeTab, setActiveTab] = useState<"digest" | "browse" | "saved" | "research">("digest");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<Id<"intelTopics"> | null>(null);
  const [selectedItem, setSelectedItem] = useState<IntelItem | null>(null);

  // Convex queries
  const topics = useQuery(api.intel.listTopics);
  const latestDigest = useQuery(api.intel.getLatestDigest);
  const items = useQuery(api.intel.listItems, {
    topicId: selectedTopic ?? undefined,
    savedOnly: activeTab === "saved",
    limit: 30,
  });
  const researchHistory = useQuery(api.intel.listResearch, { limit: 5 });

  // Mutations
  const seedTopics = useMutation(api.intel.seedTopics);
  const toggleSaved = useMutation(api.intel.toggleSaved);
  const markRead = useMutation(api.intel.markRead);
  const createResearch = useMutation(api.intel.createResearch);

  // Seed topics on first load if empty
  useEffect(() => {
    if (topics && topics.length === 0) {
      seedTopics();
    }
  }, [topics, seedTopics]);

  const handleResearch = async () => {
    if (!searchQuery.trim()) return;
    await createResearch({ query: searchQuery });
    setSearchQuery("");
    setActiveTab("research");
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold mb-1">Intelligence</h1>
            <p className="text-secondary text-sm">AI trends, SaaS opportunities & market insights</p>
          </div>
          <button className="btn-primary flex items-center gap-2">
            <span>⚙️</span> Configure
          </button>
        </div>

        {/* Ask Scout Search */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleResearch()}
              placeholder="Ask Scout to research anything..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-10 text-sm placeholder:text-white/30 focus:outline-none focus:border-[#0a84ff]/50 focus:ring-1 focus:ring-[#0a84ff]/20"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">🔍</span>
          </div>
          <button 
            onClick={handleResearch}
            disabled={!searchQuery.trim()}
            className="btn-primary px-6 disabled:opacity-50"
          >
            Research
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {[
            { id: "digest", label: "📊 Daily Digest", count: latestDigest && !latestDigest.read ? 1 : 0 },
            { id: "browse", label: "🌐 Browse", count: 0 },
            { id: "saved", label: "⭐ Saved", count: items?.filter(i => i.saved).length || 0 },
            { id: "research", label: "🔬 Research", count: researchHistory?.filter(r => r.status === "pending").length || 0 },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? "bg-[#0a84ff]/20 text-[#0a84ff] border border-[#0a84ff]/30"
                  : "bg-white/5 hover:bg-white/10 text-secondary"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#ff453a] text-white text-xs flex items-center justify-center">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "digest" && (
          <DigestView digest={latestDigest} />
        )}
        {activeTab === "browse" && (
          <BrowseView 
            topics={topics || []}
            items={items || []}
            selectedTopic={selectedTopic}
            onSelectTopic={setSelectedTopic}
            selectedItem={selectedItem}
            onSelectItem={(item) => {
              setSelectedItem(item);
              if (item && !item.read) markRead({ id: item._id });
            }}
            onToggleSaved={(id) => toggleSaved({ id })}
          />
        )}
        {activeTab === "saved" && (
          <SavedView 
            items={items?.filter(i => i.saved) || []}
            onToggleSaved={(id) => toggleSaved({ id })}
          />
        )}
        {activeTab === "research" && (
          <ResearchView history={researchHistory || []} />
        )}
      </div>
    </div>
  );
}

// ==========================================
// DIGEST VIEW
// ==========================================

function DigestView({ digest }: { digest: Digest | null | undefined }) {
  if (!digest) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">📰</div>
          <h3 className="text-xl font-semibold mb-2">No digest yet</h3>
          <p className="text-secondary mb-6">
            Scout will compile your first morning briefing soon. Check back tomorrow or trigger a manual scan.
          </p>
          <button className="btn-primary">
            🔄 Generate Digest Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto pr-2">
      <div className="max-w-3xl mx-auto">
        {/* Digest Header */}
        <div className="liquid-card p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">🦈</span>
            <div>
              <h2 className="text-xl font-semibold">{digest.title}</h2>
              <p className="text-sm text-secondary">
                {new Date(digest.generatedAt).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
          <p className="text-secondary leading-relaxed">{digest.summary}</p>
        </div>

        {/* Top Insights */}
        <div className="liquid-card p-6 mb-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <span>💡</span> Key Takeaways
          </h3>
          <ul className="space-y-3">
            {digest.topInsights.map((insight, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-[#30d158]">→</span>
                <span className="text-secondary">{insight}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Highlights */}
        <div className="mb-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <span>📌</span> Highlights
          </h3>
          <div className="space-y-3">
            {digest.highlights.map((h, i) => (
              <div key={i} className="liquid-card p-4 hover-lift cursor-pointer">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h4 className="font-medium">{h.title}</h4>
                  <span className={`priority-badge priority-${h.relevance}`}>
                    {h.relevance}
                  </span>
                </div>
                <p className="text-sm text-secondary">{h.insight}</p>
              </div>
            ))}
          </div>
        </div>

        {/* SaaS Ideas */}
        {digest.saasIdeas && digest.saasIdeas.length > 0 && (
          <div className="liquid-card p-6 mb-6 border-l-4 border-[#ff9f0a]">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <span>💰</span> SaaS Opportunities
            </h3>
            <div className="space-y-4">
              {digest.saasIdeas.map((idea, i) => (
                <div key={i} className="p-4 bg-white/5 rounded-xl">
                  <h4 className="font-medium text-[#ff9f0a] mb-2">{idea.idea}</h4>
                  <p className="text-sm text-secondary mb-2">
                    <strong>Pain point:</strong> {idea.painPoint}
                  </p>
                  <p className="text-sm text-secondary">
                    <strong>Opportunity:</strong> {idea.opportunity}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// BROWSE VIEW
// ==========================================

function BrowseView({
  topics,
  items,
  selectedTopic,
  onSelectTopic,
  selectedItem,
  onSelectItem,
  onToggleSaved,
}: {
  topics: Topic[];
  items: IntelItem[];
  selectedTopic: Id<"intelTopics"> | null;
  onSelectTopic: (id: Id<"intelTopics"> | null) => void;
  selectedItem: IntelItem | null;
  onSelectItem: (item: IntelItem | null) => void;
  onToggleSaved: (id: Id<"intelItems">) => void;
}) {
  return (
    <div className="h-full flex gap-6">
      {/* Topics + Items List */}
      <div className="w-[400px] flex flex-col">
        {/* Topic Pills */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => onSelectTopic(null)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              !selectedTopic ? "bg-[#0a84ff]/20 text-[#0a84ff]" : "bg-white/5 hover:bg-white/10"
            }`}
          >
            All
          </button>
          {topics.filter(t => t.enabled).map((topic) => (
            <button
              key={topic._id}
              onClick={() => onSelectTopic(topic._id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                selectedTopic === topic._id 
                  ? "bg-[#0a84ff]/20 text-[#0a84ff]" 
                  : "bg-white/5 hover:bg-white/10"
              }`}
            >
              <span>{topic.emoji}</span>
              <span>{topic.name}</span>
            </button>
          ))}
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
          {items.length === 0 ? (
            <div className="empty-state py-12">
              <div className="empty-state-icon">🔍</div>
              <span>No items yet</span>
              <p className="text-xs text-tertiary mt-2">Scout will find intel soon</p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item._id}
                onClick={() => onSelectItem(item)}
                className={`liquid-card p-4 cursor-pointer transition-all ${
                  selectedItem?._id === item._id ? "border-[#0a84ff]/50 bg-[#0a84ff]/10" : ""
                } ${!item.read ? "border-l-2 border-l-[#0a84ff]" : ""}`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="font-medium text-sm leading-tight line-clamp-2">{item.title}</h4>
                  <span className={`priority-badge priority-${item.relevance} flex-shrink-0`}>
                    {item.relevance}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-secondary">
                  <span>{item.sourceIcon}</span>
                  <span>{item.source}</span>
                  <span>•</span>
                  <span>{formatTime(item.discoveredAt)}</span>
                  {item.saved && <span className="text-[#ff9f0a]">★</span>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Detail Panel */}
      <div className="flex-1 liquid-card p-6 overflow-y-auto">
        {selectedItem ? (
          <ItemDetail item={selectedItem} onToggleSaved={onToggleSaved} />
        ) : (
          <div className="h-full flex items-center justify-center text-secondary">
            <div className="text-center">
              <div className="text-4xl mb-4">📰</div>
              <p>Select an item to read</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ItemDetail({ item, onToggleSaved }: { item: IntelItem; onToggleSaved: (id: Id<"intelItems">) => void }) {
  return (
    <article className="max-w-2xl">
      {/* Header */}
      <div className="mb-6 pb-6 border-b border-white/10">
        <div className="flex items-center gap-2 text-sm text-secondary mb-3">
          <span className="text-lg">{item.sourceIcon}</span>
          <span className="font-medium">{item.source}</span>
          <span>•</span>
          <span>{formatTime(item.discoveredAt)}</span>
        </div>
        <h1 className="text-2xl font-bold mb-4">{item.title}</h1>
        <div className="flex flex-wrap gap-2">
          {item.tags.map((tag) => (
            <span key={tag} className="px-3 py-1 rounded-full bg-white/5 text-xs">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Summary */}
      {item.summary && (
        <p className="text-lg leading-relaxed text-secondary mb-6">
          {item.summary}
        </p>
      )}

      {/* AI Insights */}
      {item.aiInsights && (
        <div className="p-4 rounded-xl bg-[#bf5af2]/10 border border-[#bf5af2]/20 mb-6">
          <h3 className="font-semibold mb-2 flex items-center gap-2 text-[#bf5af2]">
            <span>🦈</span> Scout's Analysis
          </h3>
          <p className="text-sm text-secondary">{item.aiInsights}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button 
          onClick={() => onToggleSaved(item._id)}
          className={`px-4 py-2 rounded-xl text-sm flex items-center gap-2 ${
            item.saved 
              ? "bg-[#ff9f0a]/20 text-[#ff9f0a] border border-[#ff9f0a]/30" 
              : "bg-white/5 hover:bg-white/10"
          }`}
        >
          {item.saved ? "★ Saved" : "☆ Save"}
        </button>
        <button className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm flex items-center gap-2">
          📋 Create Task
        </button>
        {item.url && (
          <a 
            href={item.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm flex items-center gap-2"
          >
            🔗 Open Source
          </a>
        )}
      </div>
    </article>
  );
}

// ==========================================
// SAVED VIEW
// ==========================================

function SavedView({ 
  items, 
  onToggleSaved 
}: { 
  items: IntelItem[]; 
  onToggleSaved: (id: Id<"intelItems">) => void;
}) {
  if (items.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⭐</div>
          <h3 className="text-xl font-semibold mb-2">No saved items</h3>
          <p className="text-secondary">Save interesting findings while browsing</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 overflow-y-auto pr-2">
      {items.map((item) => (
        <div key={item._id} className="liquid-card p-5 hover-lift">
          <div className="flex items-start justify-between gap-2 mb-3">
            <h4 className="font-medium leading-tight">{item.title}</h4>
            <button 
              onClick={() => onToggleSaved(item._id)}
              className="text-[#ff9f0a] hover:scale-110 transition-transform"
            >
              ★
            </button>
          </div>
          {item.summary && (
            <p className="text-sm text-secondary line-clamp-3 mb-3">{item.summary}</p>
          )}
          <div className="flex items-center gap-2 text-xs text-tertiary">
            <span>{item.sourceIcon}</span>
            <span>{item.source}</span>
            <span>•</span>
            <span>{formatTime(item.discoveredAt)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ==========================================
// RESEARCH VIEW
// ==========================================

function ResearchView({ history }: { history: any[] }) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">🔬</div>
        <h3 className="text-xl font-semibold mb-2">Research Queue</h3>
        <p className="text-secondary">
          Ask Scout to research any topic. Results will appear here.
        </p>
      </div>

      {history.length === 0 ? (
        <div className="liquid-card p-8 text-center">
          <p className="text-secondary">No research requests yet</p>
          <p className="text-xs text-tertiary mt-2">Use the search bar above to ask Scout</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((research) => (
            <div key={research._id} className="liquid-card p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <h4 className="font-medium">{research.query}</h4>
                <span className={`px-2 py-1 rounded text-xs ${
                  research.status === "completed" ? "bg-[#30d158]/20 text-[#30d158]" :
                  research.status === "researching" ? "bg-[#0a84ff]/20 text-[#0a84ff]" :
                  research.status === "failed" ? "bg-[#ff453a]/20 text-[#ff453a]" :
                  "bg-white/10 text-secondary"
                }`}>
                  {research.status}
                </span>
              </div>
              
              {research.summary && (
                <p className="text-sm text-secondary mb-3">{research.summary}</p>
              )}
              
              {research.insights && research.insights.length > 0 && (
                <ul className="space-y-1 mb-3">
                  {research.insights.map((insight: string, i: number) => (
                    <li key={i} className="text-sm text-secondary flex items-start gap-2">
                      <span className="text-[#30d158]">→</span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="text-xs text-tertiary">
                {formatTime(research.requestedAt)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ==========================================
// HELPERS
// ==========================================

function formatTime(ts: number): string {
  const seconds = Math.floor((Date.now() - ts) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
