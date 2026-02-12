import { v } from "convex/values";
import { query, mutation, action } from "./_generated/server";
import { api } from "./_generated/api";

// ==========================================
// QUERIES
// ==========================================

// Get all topics
export const listTopics = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("intelTopics")
      .order("asc")
      .collect();
  },
});

// Get enabled topics
export const getActiveTopics = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("intelTopics")
      .withIndex("by_enabled", (q) => q.eq("enabled", true))
      .collect();
  },
});

// Get recent intel items
export const listItems = query({
  args: {
    topicId: v.optional(v.id("intelTopics")),
    savedOnly: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { topicId, savedOnly, limit = 20 }) => {
    let q = ctx.db.query("intelItems");
    
    if (savedOnly) {
      q = q.withIndex("by_saved", (q) => q.eq("saved", true));
    } else if (topicId) {
      q = q.withIndex("by_topic", (q) => q.eq("topicId", topicId));
    }
    
    return await q.order("desc").take(limit);
  },
});

// Get latest digest
export const getLatestDigest = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("intelDigests")
      .order("desc")
      .first();
  },
});

// Get digest by date
export const getDigestByDate = query({
  args: { date: v.string() },
  handler: async (ctx, { date }) => {
    return await ctx.db
      .query("intelDigests")
      .withIndex("by_date", (q) => q.eq("date", date))
      .first();
  },
});

// Get all digests
export const listDigests = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 10 }) => {
    return await ctx.db
      .query("intelDigests")
      .order("desc")
      .take(limit);
  },
});

// Get research requests
export const listResearch = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 10 }) => {
    return await ctx.db
      .query("intelResearch")
      .order("desc")
      .take(limit);
  },
});

// ==========================================
// MUTATIONS
// ==========================================

// Create/update a topic
export const upsertTopic = mutation({
  args: {
    id: v.optional(v.id("intelTopics")),
    name: v.string(),
    description: v.optional(v.string()),
    keywords: v.array(v.string()),
    emoji: v.string(),
    enabled: v.boolean(),
  },
  handler: async (ctx, { id, ...data }) => {
    if (id) {
      await ctx.db.patch(id, data);
      return id;
    } else {
      return await ctx.db.insert("intelTopics", data);
    }
  },
});

// Add an intel item
export const addItem = mutation({
  args: {
    title: v.string(),
    url: v.optional(v.string()),
    source: v.string(),
    sourceIcon: v.string(),
    summary: v.optional(v.string()),
    relevance: v.union(v.literal("high"), v.literal("medium"), v.literal("low")),
    topicId: v.optional(v.id("intelTopics")),
    tags: v.array(v.string()),
    publishedAt: v.optional(v.number()),
    aiInsights: v.optional(v.string()),
  },
  handler: async (ctx, data) => {
    return await ctx.db.insert("intelItems", {
      ...data,
      discoveredAt: Date.now(),
      saved: false,
      read: false,
    });
  },
});

// Toggle saved status
export const toggleSaved = mutation({
  args: { id: v.id("intelItems") },
  handler: async (ctx, { id }) => {
    const item = await ctx.db.get(id);
    if (!item) throw new Error("Item not found");
    await ctx.db.patch(id, { saved: !item.saved });
  },
});

// Mark as read
export const markRead = mutation({
  args: { id: v.id("intelItems") },
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, { read: true });
  },
});

// Mark digest as read
export const markDigestRead = mutation({
  args: { id: v.id("intelDigests") },
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, { read: true });
  },
});

// Create a digest
export const createDigest = mutation({
  args: {
    date: v.string(),
    title: v.string(),
    summary: v.string(),
    highlights: v.array(v.object({
      title: v.string(),
      insight: v.string(),
      url: v.optional(v.string()),
      relevance: v.union(v.literal("high"), v.literal("medium"), v.literal("low")),
    })),
    topInsights: v.array(v.string()),
    saasIdeas: v.optional(v.array(v.object({
      idea: v.string(),
      painPoint: v.string(),
      opportunity: v.string(),
    }))),
    itemIds: v.array(v.id("intelItems")),
  },
  handler: async (ctx, data) => {
    return await ctx.db.insert("intelDigests", {
      ...data,
      generatedAt: Date.now(),
      read: false,
    });
  },
});

// Create a research request
export const createResearch = mutation({
  args: { query: v.string() },
  handler: async (ctx, { query }) => {
    return await ctx.db.insert("intelResearch", {
      query,
      status: "pending",
      requestedAt: Date.now(),
    });
  },
});

// Update research status
export const updateResearch = mutation({
  args: {
    id: v.id("intelResearch"),
    status: v.union(v.literal("pending"), v.literal("researching"), v.literal("completed"), v.literal("failed")),
    results: v.optional(v.array(v.object({
      title: v.string(),
      url: v.string(),
      snippet: v.string(),
    }))),
    summary: v.optional(v.string()),
    insights: v.optional(v.array(v.string())),
  },
  handler: async (ctx, { id, ...data }) => {
    await ctx.db.patch(id, {
      ...data,
      ...(data.status === "completed" ? { completedAt: Date.now() } : {}),
    });
  },
});

// Seed default topics
export const seedTopics = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("intelTopics").collect();
    if (existing.length > 0) return { seeded: false, message: "Topics already exist" };

    const defaultTopics = [
      {
        name: "AI Agents",
        description: "Multi-agent systems, LLM orchestration, autonomous AI",
        keywords: ["AI agents", "multi-agent", "LLM orchestration", "autonomous AI", "agent framework"],
        emoji: "🤖",
        enabled: true,
      },
      {
        name: "SaaS Ideas",
        description: "Micro-SaaS opportunities, indie hacking, bootstrapped startups",
        keywords: ["micro saas", "indie hacker", "saas idea", "bootstrapped startup", "side project revenue"],
        emoji: "💡",
        enabled: true,
      },
      {
        name: "Pain Points",
        description: "Problems people complain about, opportunities in disguise",
        keywords: ["frustrated with", "wish there was", "why is there no", "hate when", "annoying that"],
        emoji: "😤",
        enabled: true,
      },
      {
        name: "Dev Tools",
        description: "Developer tools, APIs, frameworks, and infrastructure",
        keywords: ["developer tools", "devtools", "API", "framework launch", "infrastructure"],
        emoji: "🛠️",
        enabled: true,
      },
      {
        name: "Market Trends",
        description: "Funding news, market shifts, emerging opportunities",
        keywords: ["series A", "funding round", "market trend", "emerging market", "YC batch"],
        emoji: "📈",
        enabled: true,
      },
    ];

    for (const topic of defaultTopics) {
      await ctx.db.insert("intelTopics", topic);
    }

    return { seeded: true, count: defaultTopics.length };
  },
});
