import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

// CORS headers for external access
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Helper to create JSON response
const jsonResponse = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

// Handle CORS preflight
http.route({
  path: "/api/agents",
  method: "OPTIONS",
  handler: httpAction(async () => new Response(null, { headers: corsHeaders })),
});

http.route({
  path: "/api/tasks",
  method: "OPTIONS",
  handler: httpAction(async () => new Response(null, { headers: corsHeaders })),
});

http.route({
  path: "/api/activity",
  method: "OPTIONS",
  handler: httpAction(async () => new Response(null, { headers: corsHeaders })),
});

// GET /api/agents - List all agents
http.route({
  path: "/api/agents",
  method: "GET",
  handler: httpAction(async (ctx) => {
    const agents = await ctx.runQuery(api.agents.list);
    return jsonResponse(agents);
  }),
});

// GET /api/tasks - List all tasks (optional status filter via query param)
http.route({
  path: "/api/tasks",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const status = url.searchParams.get("status") as any;
    const tasks = await ctx.runQuery(api.tasks.list, status ? { status } : {});
    return jsonResponse(tasks);
  }),
});

// POST /api/tasks - Create a new task
http.route({
  path: "/api/tasks",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      const taskId = await ctx.runMutation(api.tasks.create, {
        title: body.title,
        description: body.description,
        priority: body.priority || "medium",
        createdBy: body.createdBy || "Mako",
        createdByType: body.createdByType || "agent",
        assignedTo: body.assignedTo,
        parentTaskId: body.parentTaskId,
      });
      return jsonResponse({ success: true, taskId }, 201);
    } catch (error) {
      return jsonResponse({ error: String(error) }, 400);
    }
  }),
});

// POST /api/tasks/claim - Claim a task
http.route({
  path: "/api/tasks/claim",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      await ctx.runMutation(api.tasks.claim, {
        id: body.taskId,
        agentName: body.agentName,
      });
      return jsonResponse({ success: true });
    } catch (error) {
      return jsonResponse({ error: String(error) }, 400);
    }
  }),
});

// POST /api/tasks/status - Update task status
http.route({
  path: "/api/tasks/status",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      await ctx.runMutation(api.tasks.updateStatus, {
        id: body.taskId,
        status: body.status,
        updatedBy: body.updatedBy || "Mako",
        updatedByType: body.updatedByType || "agent",
      });
      return jsonResponse({ success: true });
    } catch (error) {
      return jsonResponse({ error: String(error) }, 400);
    }
  }),
});

// POST /api/tasks/comment - Add comment to task
http.route({
  path: "/api/tasks/comment",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      const commentId = await ctx.runMutation(api.tasks.addComment, {
        taskId: body.taskId,
        authorName: body.authorName || "Mako",
        authorType: body.authorType || "agent",
        content: body.content,
        mentions: body.mentions,
      });
      return jsonResponse({ success: true, commentId }, 201);
    } catch (error) {
      return jsonResponse({ error: String(error) }, 400);
    }
  }),
});

// GET /api/activity - Get recent activity
http.route({
  path: "/api/activity",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const activity = await ctx.runQuery(api.activity.recent, { limit });
    return jsonResponse(activity);
  }),
});

// POST /api/agents/heartbeat - Record agent heartbeat
http.route({
  path: "/api/agents/heartbeat",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      await ctx.runMutation(api.agents.heartbeat, {
        name: body.name || "Mako",
      });
      return jsonResponse({ success: true });
    } catch (error) {
      return jsonResponse({ error: String(error) }, 400);
    }
  }),
});

// GET /api/status - Dashboard status summary
http.route({
  path: "/api/status",
  method: "GET",
  handler: httpAction(async (ctx) => {
    const agents = await ctx.runQuery(api.agents.list);
    const tasks = await ctx.runQuery(api.tasks.list, {});
    
    const activeAgents = agents.filter((a: any) => a.status === "active").length;
    const tasksByStatus = {
      inbox: tasks.filter((t: any) => t.status === "inbox").length,
      assigned: tasks.filter((t: any) => t.status === "assigned").length,
      in_progress: tasks.filter((t: any) => t.status === "in_progress").length,
      review: tasks.filter((t: any) => t.status === "review").length,
      done: tasks.filter((t: any) => t.status === "done").length,
    };

    return jsonResponse({
      agents: {
        total: agents.length,
        active: activeAgents,
      },
      tasks: {
        total: tasks.length,
        byStatus: tasksByStatus,
      },
    });
  }),
});

// ==========================================
// INTEL ENDPOINTS
// ==========================================

http.route({
  path: "/api/intel/topics",
  method: "OPTIONS",
  handler: httpAction(async () => new Response(null, { headers: corsHeaders })),
});

http.route({
  path: "/api/intel/items",
  method: "OPTIONS",
  handler: httpAction(async () => new Response(null, { headers: corsHeaders })),
});

http.route({
  path: "/api/intel/digest",
  method: "OPTIONS",
  handler: httpAction(async () => new Response(null, { headers: corsHeaders })),
});

// GET /api/intel/topics - Get all intel topics
http.route({
  path: "/api/intel/topics",
  method: "GET",
  handler: httpAction(async (ctx) => {
    const topics = await ctx.runQuery(api.intel.listTopics);
    return jsonResponse(topics);
  }),
});

// POST /api/intel/items - Add intel item (Scout posts findings here)
http.route({
  path: "/api/intel/items",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      const itemId = await ctx.runMutation(api.intel.addItem, {
        title: body.title,
        url: body.url,
        source: body.source || "Web",
        sourceIcon: body.sourceIcon || "🌐",
        summary: body.summary,
        relevance: body.relevance || "medium",
        topicId: body.topicId,
        tags: body.tags || [],
        publishedAt: body.publishedAt,
        aiInsights: body.aiInsights,
      });
      return jsonResponse({ success: true, itemId }, 201);
    } catch (error) {
      return jsonResponse({ error: String(error) }, 400);
    }
  }),
});

// POST /api/intel/digest - Create a digest (Scout posts compiled digest)
http.route({
  path: "/api/intel/digest",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      const digestId = await ctx.runMutation(api.intel.createDigest, {
        date: body.date || new Date().toISOString().split("T")[0],
        title: body.title,
        summary: body.summary,
        highlights: body.highlights || [],
        topInsights: body.topInsights || [],
        saasIdeas: body.saasIdeas,
        itemIds: body.itemIds || [],
      });
      return jsonResponse({ success: true, digestId }, 201);
    } catch (error) {
      return jsonResponse({ error: String(error) }, 400);
    }
  }),
});

// GET /api/intel/digest/latest - Get latest digest
http.route({
  path: "/api/intel/digest/latest",
  method: "GET",
  handler: httpAction(async (ctx) => {
    const digest = await ctx.runQuery(api.intel.getLatestDigest);
    return jsonResponse(digest);
  }),
});

export default http;
