import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// List all tasks
export const list = query({
  args: {
    status: v.optional(v.union(
      v.literal("inbox"),
      v.literal("assigned"),
      v.literal("in_progress"),
      v.literal("review"),
      v.literal("done"),
      v.literal("blocked")
    )),
  },
  handler: async (ctx, args) => {
    if (args.status) {
      return await ctx.db
        .query("tasks")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .collect();
    }
    return await ctx.db.query("tasks").collect();
  },
});

// Get task by ID
export const get = query({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get tasks by assignee
export const getByAssignee = query({
  args: { agentName: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tasks")
      .withIndex("by_assignee", (q) => q.eq("assignedTo", args.agentName))
      .collect();
  },
});

// Create a new task
export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    priority: v.optional(v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent")
    )),
    createdBy: v.string(),
    createdByType: v.union(v.literal("agent"), v.literal("human")),
    assignedTo: v.optional(v.string()),
    parentTaskId: v.optional(v.id("tasks")),
  },
  handler: async (ctx, args) => {
    const taskId = await ctx.db.insert("tasks", {
      title: args.title,
      description: args.description,
      status: args.assignedTo ? "assigned" : "inbox",
      priority: args.priority ?? "medium",
      createdBy: args.createdBy,
      createdByType: args.createdByType,
      assignedTo: args.assignedTo,
      parentTaskId: args.parentTaskId,
    });
    
    // Log activity
    await ctx.db.insert("activity", {
      type: "task_created",
      actorName: args.createdBy,
      actorType: args.createdByType,
      targetId: taskId,
      targetType: "task",
      data: { title: args.title },
    });
    
    return taskId;
  },
});

// Update task status
export const updateStatus = mutation({
  args: {
    id: v.id("tasks"),
    status: v.union(
      v.literal("inbox"),
      v.literal("assigned"),
      v.literal("in_progress"),
      v.literal("review"),
      v.literal("done"),
      v.literal("blocked")
    ),
    updatedBy: v.string(),
    updatedByType: v.union(v.literal("agent"), v.literal("human")),
  },
  handler: async (ctx, args) => {
    const updates: Record<string, unknown> = { status: args.status };
    
    if (args.status === "done") {
      updates.completedAt = Date.now();
    }
    
    await ctx.db.patch(args.id, updates);
    
    // Log activity
    await ctx.db.insert("activity", {
      type: args.status === "done" ? "task_completed" : "task_updated",
      actorName: args.updatedBy,
      actorType: args.updatedByType,
      targetId: args.id,
      targetType: "task",
      data: { newStatus: args.status },
    });
  },
});

// Claim a task
export const claim = mutation({
  args: {
    id: v.id("tasks"),
    agentName: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      assignedTo: args.agentName,
      status: "in_progress",
      claimedAt: Date.now(),
    });
    
    // Update agent's current task
    const agent = await ctx.db
      .query("agents")
      .withIndex("by_name", (q) => q.eq("name", args.agentName))
      .first();
    
    if (agent) {
      await ctx.db.patch(agent._id, { currentTaskId: args.id });
    }
    
    // Log activity
    await ctx.db.insert("activity", {
      type: "task_claimed",
      actorName: args.agentName,
      actorType: "agent",
      targetId: args.id,
      targetType: "task",
    });
  },
});

// Add comment to task
export const addComment = mutation({
  args: {
    taskId: v.id("tasks"),
    authorName: v.string(),
    authorType: v.union(v.literal("agent"), v.literal("human")),
    content: v.string(),
    mentions: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const commentId = await ctx.db.insert("comments", {
      taskId: args.taskId,
      authorName: args.authorName,
      authorType: args.authorType,
      content: args.content,
      mentions: args.mentions,
    });
    
    // Log activity
    await ctx.db.insert("activity", {
      type: "comment_added",
      actorName: args.authorName,
      actorType: args.authorType,
      targetId: args.taskId,
      targetType: "task",
      data: { commentId },
    });
    
    // Log mention activities
    if (args.mentions?.length) {
      for (const mention of args.mentions) {
        await ctx.db.insert("activity", {
          type: "mention",
          actorName: args.authorName,
          actorType: args.authorType,
          targetId: mention,
          targetType: "agent",
          data: { taskId: args.taskId, commentId },
        });
      }
    }
    
    return commentId;
  },
});

// Get comments for a task
export const getComments = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("comments")
      .withIndex("by_task", (q) => q.eq("taskId", args.taskId))
      .collect();
  },
});
