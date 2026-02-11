import { v } from "convex/values";
import { query } from "./_generated/server";

// Get recent activity
export const recent = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    return await ctx.db
      .query("activity")
      .order("desc")
      .take(limit);
  },
});

// Get activity by type
export const byType = query({
  args: {
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
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    return await ctx.db
      .query("activity")
      .withIndex("by_type", (q) => q.eq("type", args.type))
      .order("desc")
      .take(limit);
  },
});

// Get activity by actor (agent or human)
export const byActor = query({
  args: {
    actorName: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    return await ctx.db
      .query("activity")
      .withIndex("by_actor", (q) => q.eq("actorName", args.actorName))
      .order("desc")
      .take(limit);
  },
});

// Get notifications for an agent (mentions + task assignments)
export const getNotifications = query({
  args: { agentName: v.string() },
  handler: async (ctx, args) => {
    // Get mentions
    const mentions = await ctx.db
      .query("activity")
      .withIndex("by_type", (q) => q.eq("type", "mention"))
      .order("desc")
      .take(100);
    
    // Filter to mentions targeting this agent
    const agentMentions = mentions.filter(
      (m) => m.targetId === args.agentName && m.targetType === "agent"
    );
    
    // Get task assignments
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_assignee", (q) => q.eq("assignedTo", args.agentName))
      .collect();
    
    const newTasks = tasks.filter(
      (t) => t.status === "assigned" || t.status === "inbox"
    );
    
    return {
      mentions: agentMentions,
      newTasks,
    };
  },
});
