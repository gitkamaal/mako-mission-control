import { mutation } from "./_generated/server";

// Seed initial agent squad
export const seedAgents = mutation({
  args: {},
  handler: async (ctx) => {
    const existingAgents = await ctx.db.query("agents").collect();
    if (existingAgents.length > 0) {
      console.log("Agents already seeded, skipping...");
      return { seeded: false, count: existingAgents.length };
    }

    const agents = [
      {
        name: "Mako",
        emoji: "🦈",
        role: "Lead / Orchestrator",
        description: "Sharp, relentless, cuts through complexity. Elite dev partner.",
        soulPath: "agents/mako.md",
        status: "active" as const,
        config: { wakeInterval: 15 },
      },
      {
        name: "Scout",
        emoji: "🔍",
        role: "Researcher",
        description: "Curious and methodical. Digs deep before surfacing findings.",
        soulPath: "agents/scout.md",
        status: "idle" as const,
        reportsTo: "Mako",
        config: { wakeInterval: 15 },
      },
      {
        name: "Scribe",
        emoji: "✍️",
        role: "Writer / Documentation",
        description: "Clear and concise communicator. Makes complex things simple.",
        soulPath: "agents/scribe.md",
        status: "idle" as const,
        reportsTo: "Mako",
        config: { wakeInterval: 30 },
      },
      {
        name: "Atlas",
        emoji: "🏛️",
        role: "Architect / Technical Lead",
        description: "Big-picture thinker. Pattern recognizer. Simplicity advocate.",
        soulPath: "agents/atlas.md",
        status: "idle" as const,
        reportsTo: "Mako",
        config: { wakeInterval: 30 },
      },
      {
        name: "Pixel",
        emoji: "🎨",
        role: "Frontend Developer",
        description: "Aesthetically driven but pragmatic. Component-first mindset.",
        soulPath: "agents/pixel.md",
        status: "offline" as const,
        reportsTo: "Atlas",
        config: { wakeInterval: 15 },
      },
      {
        name: "Forge",
        emoji: "⚙️",
        role: "Backend Developer",
        description: "Systems thinker. Reliability-obsessed. Loves clean APIs.",
        soulPath: "agents/forge.md",
        status: "offline" as const,
        reportsTo: "Atlas",
        config: { wakeInterval: 15 },
      },
    ];

    for (const agent of agents) {
      await ctx.db.insert("agents", {
        ...agent,
        lastHeartbeat: Date.now(),
      });
    }

    // Log squad creation
    await ctx.db.insert("activity", {
      type: "agent_spawned",
      actorName: "System",
      actorType: "system",
      data: { message: "Agent squad initialized", count: agents.length },
    });

    return { seeded: true, count: agents.length };
  },
});

// Create some sample tasks
export const seedTasks = mutation({
  args: {},
  handler: async (ctx) => {
    const existingTasks = await ctx.db.query("tasks").collect();
    if (existingTasks.length > 0) {
      console.log("Tasks already seeded, skipping...");
      return { seeded: false, count: existingTasks.length };
    }

    const tasks = [
      {
        title: "Set up Convex authentication",
        description: "Integrate Clerk with Convex for secure user authentication",
        status: "inbox" as const,
        priority: "high" as const,
        createdBy: "Mako",
        createdByType: "agent" as const,
      },
      {
        title: "Build agent status cards",
        description: "Create reusable React components for displaying agent status in the dashboard",
        status: "inbox" as const,
        priority: "high" as const,
        createdBy: "Mako",
        createdByType: "agent" as const,
      },
      {
        title: "Design task kanban board",
        description: "Implement drag-and-drop kanban board for task management",
        status: "inbox" as const,
        priority: "medium" as const,
        createdBy: "Mako",
        createdByType: "agent" as const,
      },
      {
        title: "Write project documentation",
        description: "Create comprehensive README and setup guide",
        status: "inbox" as const,
        priority: "medium" as const,
        createdBy: "Mako",
        createdByType: "agent" as const,
      },
      {
        title: "Research WebSocket best practices",
        description: "Investigate optimal patterns for Gateway WebSocket connection",
        status: "inbox" as const,
        priority: "low" as const,
        createdBy: "Mako",
        createdByType: "agent" as const,
      },
    ];

    for (const task of tasks) {
      await ctx.db.insert("tasks", task);
    }

    return { seeded: true, count: tasks.length };
  },
});
