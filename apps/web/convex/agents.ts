import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// List all agents
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("agents").collect();
  },
});

// Get agent by name
export const getByName = query({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("agents")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();
  },
});

// Create a new agent
export const create = mutation({
  args: {
    name: v.string(),
    emoji: v.string(),
    role: v.string(),
    description: v.optional(v.string()),
    soulPath: v.optional(v.string()),
    reportsTo: v.optional(v.string()),
    config: v.optional(v.object({
      model: v.optional(v.string()),
      wakeInterval: v.optional(v.number()),
      sessionKey: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const agentId = await ctx.db.insert("agents", {
      ...args,
      status: "offline",
      lastHeartbeat: Date.now(),
    });
    
    // Log activity
    await ctx.db.insert("activity", {
      type: "agent_spawned",
      actorName: args.name,
      actorType: "system",
      targetId: agentId,
      targetType: "agent",
      data: { role: args.role },
    });
    
    return agentId;
  },
});

// Update agent status
export const updateStatus = mutation({
  args: {
    name: v.string(),
    status: v.union(v.literal("active"), v.literal("idle"), v.literal("offline")),
  },
  handler: async (ctx, args) => {
    const agent = await ctx.db
      .query("agents")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();
    
    if (!agent) throw new Error(`Agent not found: ${args.name}`);
    
    await ctx.db.patch(agent._id, {
      status: args.status,
      lastHeartbeat: Date.now(),
    });
  },
});

// Record heartbeat
export const heartbeat = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const agent = await ctx.db
      .query("agents")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();
    
    if (!agent) throw new Error(`Agent not found: ${args.name}`);
    
    await ctx.db.patch(agent._id, {
      lastHeartbeat: Date.now(),
      status: "active",
    });
    
    // Log heartbeat activity
    await ctx.db.insert("activity", {
      type: "agent_heartbeat",
      actorName: args.name,
      actorType: "agent",
      targetId: agent._id,
      targetType: "agent",
    });
  },
});

// Assign task to agent
export const assignTask = mutation({
  args: {
    agentName: v.string(),
    taskId: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    const agent = await ctx.db
      .query("agents")
      .withIndex("by_name", (q) => q.eq("name", args.agentName))
      .first();
    
    if (!agent) throw new Error(`Agent not found: ${args.agentName}`);
    
    await ctx.db.patch(agent._id, {
      currentTaskId: args.taskId,
    });
    
    await ctx.db.patch(args.taskId, {
      assignedTo: args.agentName,
      status: "assigned",
    });
  },
});
