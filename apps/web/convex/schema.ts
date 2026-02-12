import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Agent squad roster
  agents: defineTable({
    name: v.string(),
    emoji: v.string(),
    role: v.string(),
    description: v.optional(v.string()),
    soulPath: v.optional(v.string()), // Path to soul markdown file
    status: v.union(v.literal("active"), v.literal("idle"), v.literal("offline")),
    currentTaskId: v.optional(v.id("tasks")),
    lastHeartbeat: v.optional(v.number()),
    config: v.optional(v.object({
      model: v.optional(v.string()),
      wakeInterval: v.optional(v.number()), // minutes
      sessionKey: v.optional(v.string()),
    })),
    reportsTo: v.optional(v.string()), // agent name
  }).index("by_name", ["name"])
    .index("by_status", ["status"]),

  // Task queue (kanban board)
  tasks: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    status: v.union(
      v.literal("inbox"),
      v.literal("assigned"),
      v.literal("in_progress"),
      v.literal("review"),
      v.literal("done"),
      v.literal("blocked")
    ),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent")
    ),
    createdBy: v.string(), // agent name or "human"
    createdByType: v.union(v.literal("agent"), v.literal("human")),
    assignedTo: v.optional(v.string()), // agent name
    claimedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    parentTaskId: v.optional(v.id("tasks")),
    deliverables: v.optional(v.array(v.id("documents"))),
    metadata: v.optional(v.any()),
  }).index("by_status", ["status"])
    .index("by_assignee", ["assignedTo"])
    .index("by_parent", ["parentTaskId"]),

  // Comments on tasks
  comments: defineTable({
    taskId: v.id("tasks"),
    authorName: v.string(),
    authorType: v.union(v.literal("agent"), v.literal("human")),
    content: v.string(), // Markdown
    mentions: v.optional(v.array(v.string())), // @mentioned agent names
  }).index("by_task", ["taskId"]),

  // Activity feed
  activity: defineTable({
    type: v.union(
      v.literal("task_created"),
      v.literal("task_claimed"),
      v.literal("task_updated"),
      v.literal("task_completed"),
      v.literal("comment_added"),
      v.literal("mention"),
      v.literal("agent_spawned"),
      v.literal("agent_heartbeat"),
      v.literal("session_started"),
      v.literal("session_ended")
    ),
    actorName: v.string(),
    actorType: v.union(v.literal("agent"), v.literal("human"), v.literal("system")),
    targetId: v.optional(v.string()),
    targetType: v.optional(v.union(v.literal("task"), v.literal("agent"), v.literal("comment"), v.literal("session"))),
    data: v.optional(v.any()),
  }).index("by_type", ["type"])
    .index("by_actor", ["actorName"]),

  // Documents and deliverables
  documents: defineTable({
    taskId: v.optional(v.id("tasks")),
    title: v.string(),
    type: v.union(v.literal("markdown"), v.literal("code"), v.literal("data"), v.literal("image")),
    content: v.optional(v.string()),
    path: v.optional(v.string()), // File path if stored locally
    createdBy: v.string(),
  }).index("by_task", ["taskId"]),

  // Clawdbot session tracking
  sessions: defineTable({
    sessionKey: v.string(),
    agentName: v.optional(v.string()),
    channel: v.optional(v.string()),
    model: v.optional(v.string()),
    status: v.union(v.literal("active"), v.literal("idle"), v.literal("ended")),
    startedAt: v.number(),
    lastActivity: v.optional(v.number()),
    messageCount: v.optional(v.number()),
  }).index("by_session_key", ["sessionKey"])
    .index("by_agent", ["agentName"])
    .index("by_status", ["status"]),

  // ==========================================
  // INTELLIGENCE MODULE
  // ==========================================

  // Topics to monitor (AI, SaaS ideas, pain points, etc.)
  intelTopics: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    keywords: v.array(v.string()), // Search terms
    emoji: v.string(),
    enabled: v.boolean(),
    lastScanned: v.optional(v.number()),
  }).index("by_name", ["name"])
    .index("by_enabled", ["enabled"]),

  // Individual intel items (articles, findings, etc.)
  intelItems: defineTable({
    title: v.string(),
    url: v.optional(v.string()),
    source: v.string(), // TechCrunch, Reddit, HN, etc.
    sourceIcon: v.string(),
    summary: v.optional(v.string()),
    content: v.optional(v.string()), // Full content if fetched
    relevance: v.union(v.literal("high"), v.literal("medium"), v.literal("low")),
    topicId: v.optional(v.id("intelTopics")),
    tags: v.array(v.string()),
    publishedAt: v.optional(v.number()),
    discoveredAt: v.number(),
    saved: v.boolean(), // User bookmarked
    read: v.boolean(),
    aiInsights: v.optional(v.string()), // Scout's analysis
  }).index("by_topic", ["topicId"])
    .index("by_saved", ["saved"])
    .index("by_relevance", ["relevance"])
    .index("by_discovered", ["discoveredAt"]),

  // Daily digests compiled by Scout
  intelDigests: defineTable({
    date: v.string(), // YYYY-MM-DD
    title: v.string(),
    summary: v.string(), // Executive summary
    highlights: v.array(v.object({
      title: v.string(),
      insight: v.string(),
      url: v.optional(v.string()),
      relevance: v.union(v.literal("high"), v.literal("medium"), v.literal("low")),
    })),
    topInsights: v.array(v.string()), // Key takeaways
    saasIdeas: v.optional(v.array(v.object({
      idea: v.string(),
      painPoint: v.string(),
      opportunity: v.string(),
    }))),
    itemIds: v.array(v.id("intelItems")), // Source items
    generatedAt: v.number(),
    read: v.boolean(),
  }).index("by_date", ["date"]),

  // Research requests (Ask Scout)
  intelResearch: defineTable({
    query: v.string(),
    status: v.union(v.literal("pending"), v.literal("researching"), v.literal("completed"), v.literal("failed")),
    results: v.optional(v.array(v.object({
      title: v.string(),
      url: v.string(),
      snippet: v.string(),
    }))),
    summary: v.optional(v.string()), // Scout's summary
    insights: v.optional(v.array(v.string())),
    requestedAt: v.number(),
    completedAt: v.optional(v.number()),
  }).index("by_status", ["status"]),
});
