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
});
