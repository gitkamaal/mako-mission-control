# 🦈 Mako Mission Control — Detailed Plan

## Research Summary

### What Bhanu Teja Built (The OG Mission Control)

**Architecture:**
- **Shared Brain:** All 10 agents read/write to a single Convex database — the "virtual office"
- **Heartbeat System:** Cron jobs wake agents every 15 minutes to check for tasks/notifications (saves API costs)
- **Specialized Souls:** Each agent has a distinct personality (Jarvis as leader, Shuri for skeptical analysis, Fury for research, Loki for content)
- **Persistent Memory:** `WORKING.md` (current progress) + `MEMORY.md` (long-term decisions)

**What the agents do:**
- Create tasks autonomously
- Claim tasks from the queue
- @mention and communicate with each other
- Review and refute each other's work
- Work 24/7 without human input

### Orchestration Patterns (From Research)

| Pattern | Description | Use Case |
|---------|-------------|----------|
| **Sequential** | Linear pipeline, each agent builds on previous | Document processing, refinement workflows |
| **Concurrent** | Parallel execution, results aggregated | Multi-perspective analysis, brainstorming |
| **Heartbeat** | Self-organizing hierarchy, recursive delegation | Status reporting, organizational workflows |
| **Handoff** | Dynamic routing to specialized agents | Customer support, task classification |

**The Agentic Heartbeat Pattern** (from research):
- Two phases: Expansion (gather data down the hierarchy) → Contraction (aggregate up)
- Agents can spawn other agents as tools
- Recursion stops when leaf nodes (individual contributors) are reached
- Simple, self-organizing, less rigid code structure

### Existing Open Source

**manish-raana/openclaw-mission-control:**
- React + Vite + Convex + Tailwind
- Kanban board (Inbox → Assigned → In Progress → Review → Done)
- Real-time sync via Convex
- OpenClaw webhook integration for automatic task tracking
- Agent roster monitoring
- Comments and activity feed

---

## Key Decisions to Make

### 1. Architecture Approach

**Option A: Webhook-Based (Like existing Mission Control)**
```
Clawdbot Agent → Lifecycle Events → Webhook → Convex → Dashboard
```
- Pros: Simple, decoupled, works with existing Clawdbot
- Cons: One-way flow, limited control

**Option B: Direct Gateway Integration**
```
Dashboard ↔ Clawdbot Gateway (WebSocket) ↔ Agents
         ↔ Convex (state/tasks)
```
- Pros: Bidirectional, can send commands, richer control
- Cons: More complex, tighter coupling

**Option C: Hybrid (Recommended)**
```
Dashboard ↔ Convex (source of truth for tasks/agents)
         ↔ Clawdbot Gateway (session monitoring, commands)
Clawdbot → Webhook → Convex (event logging)
```
- Pros: Best of both — rich state in Convex, real-time monitoring via Gateway
- Cons: Two integrations to maintain

### 2. Database Schema (Convex)

```typescript
// agents — The squad roster
agents: {
  id: string
  name: string
  emoji: string
  role: string
  soul: string           // Link to soul definition markdown
  status: "active" | "idle" | "offline"
  currentTaskId?: string
  lastHeartbeat: number
  config: {
    model?: string
    wakeInterval?: number  // minutes between heartbeats
  }
}

// tasks — The work queue
tasks: {
  id: string
  title: string
  description: string
  status: "inbox" | "assigned" | "in_progress" | "review" | "done" | "blocked"
  priority: "low" | "medium" | "high" | "urgent"
  createdBy: string      // agent id or "human"
  assignedTo?: string    // agent id
  claimedAt?: number
  completedAt?: number
  parentTaskId?: string  // For subtasks
  deliverables: string[] // Links to documents
  metadata: Record<string, any>
}

// comments — Discussion on tasks
comments: {
  id: string
  taskId: string
  authorId: string       // agent id or user id
  authorType: "agent" | "human"
  content: string        // Markdown
  mentions: string[]     // @mentioned agent ids
  createdAt: number
}

// activity — Event log
activity: {
  id: string
  type: "task_created" | "task_claimed" | "task_completed" | "comment" | "mention" | "agent_spawned" | "heartbeat"
  actorId: string
  actorType: "agent" | "human" | "system"
  targetId?: string
  targetType?: "task" | "agent" | "comment"
  data: Record<string, any>
  createdAt: number
}

// documents — Deliverables and resources
documents: {
  id: string
  taskId?: string
  title: string
  type: "markdown" | "code" | "data" | "image"
  content: string
  path?: string          // File path if stored locally
  createdBy: string
  createdAt: number
  updatedAt: number
}

// sessions — Clawdbot session tracking
sessions: {
  id: string
  sessionKey: string
  agentId?: string
  channel?: string
  model?: string
  status: "active" | "idle" | "ended"
  startedAt: number
  lastActivity: number
  messageCount: number
}
```

### 3. Agent Soul Structure

```markdown
# Agent Name 🎯

## Identity
- **Name:** Scout
- **Symbol:** 🔍
- **Role:** Researcher
- **Wake Schedule:** Every 15 minutes

## Personality
- [Personality traits]

## Capabilities
- [What this agent can do]

## Tools
- [Tools this agent has access to]

## Triggers
- [What prompts this agent to act]

## Memory
- WORKING.md: Current task context
- MEMORY.md: Long-term decisions and learnings

## Relationships
- Reports to: Mako
- Collaborates with: Scribe, Auditor
```

### 4. Heartbeat System

**How it works:**
1. Cron job runs every N minutes (configurable per agent)
2. Agent wakes up and checks:
   - Notifications (mentions, task assignments)
   - Inbox for claimable tasks matching their role
   - Current task progress
3. Agent takes action or goes back to sleep
4. Dashboard shows last heartbeat time and next scheduled wake

**Implementation with Clawdbot:**
```typescript
// Use Clawdbot's cron tool
{
  id: "scout-heartbeat",
  schedule: "*/15 * * * *",  // Every 15 min
  text: "Check for research tasks and notifications",
  agentId: "scout"
}
```

### 5. Inter-Agent Communication

**Option A: @mentions in comments (Bhanu's approach)**
- Agent posts comment with @mention
- Target agent sees notification on next heartbeat
- Simple, async, auditable

**Option B: Direct session messages**
- Use `sessions_send` to message another agent's session
- Faster, but requires active sessions

**Option C: Task assignment**
- Create subtask assigned to specific agent
- Clear ownership, trackable

**Recommendation:** Start with @mentions + task assignment. Add direct messaging later if needed.

---

## Implementation Phases

### Phase 0: Foundation (Current)
- [x] Create GitHub repo
- [x] Scaffold Next.js + Tailwind + shadcn/ui
- [x] Create Clawdbot client library
- [ ] **Document this plan** ← You are here

### Phase 1: Core Dashboard (Week 1)
**Goal:** Working dashboard connected to Clawdbot

1. **Convex Setup**
   - Initialize Convex project
   - Define schema (agents, tasks, activity)
   - Set up Clerk auth

2. **Dashboard Views**
   - Agent roster with status
   - Task kanban board
   - Activity feed
   - Session monitor (connected to Gateway)

3. **Clawdbot Integration**
   - WebSocket connection to Gateway
   - Display active sessions
   - Basic session commands (send message)

**Deliverables:**
- Live dashboard at localhost:3000
- Real-time agent/task display from Convex
- Session list from Clawdbot Gateway

### Phase 2: Task System (Week 2)
**Goal:** Full task management with agent participation

1. **Task CRUD**
   - Create/edit/delete tasks
   - Drag-and-drop kanban
   - Task detail panel
   - Comments and @mentions

2. **Agent Actions**
   - Claim task
   - Update status
   - Post comments
   - Create subtasks

3. **Webhook Endpoint**
   - Receive Clawdbot lifecycle events
   - Auto-create tasks from agent runs
   - Track completion and duration

**Deliverables:**
- Full task management UI
- Agents can interact via Convex
- Webhook receives Clawdbot events

### Phase 3: Heartbeat & Automation (Week 3)
**Goal:** Agents work autonomously

1. **Heartbeat Cron Jobs**
   - Create cron jobs per agent
   - Wake and check logic
   - Notification system

2. **Agent Autonomy**
   - Auto-claim matching tasks
   - Self-assign work
   - Inter-agent collaboration

3. **Memory Integration**
   - WORKING.md per agent
   - MEMORY.md for learnings
   - Memory browser in dashboard

**Deliverables:**
- Agents wake on schedule
- Auto-claiming and task progression
- Persistent memory across sessions

### Phase 4: Squad Expansion (Week 4+)
**Goal:** Multi-agent collaboration

1. **Additional Agents**
   - Scout (Researcher)
   - Scribe (Writer)
   - Auditor (Reviewer)
   - Ops (DevOps)

2. **Orchestration Patterns**
   - Sequential workflows
   - Parallel execution
   - Review chains

3. **Integrations**
   - GitHub (PRs, issues)
   - Notion sync
   - Notifications (Telegram/Discord)

---

## Tech Stack (Final)

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Frontend** | Next.js 14 (App Router) | SSR, routing, API routes |
| **Styling** | Tailwind v4 + shadcn/ui | Fast iteration, consistent design |
| **Database** | Convex | Real-time sync, serverless, industry standard for this use case |
| **Auth** | Clerk | Easy setup, Convex integration |
| **Agent Runtime** | Clawdbot | Already set up, Gateway API |
| **Package Manager** | Bun | Fast, modern |

---

## Open Questions

1. **Do we fork an existing Mission Control or build from scratch?**
   - `manish-raana/openclaw-mission-control` exists and works
   - Building from scratch gives full control and learning
   - **Recommendation:** Build from scratch, reference existing for patterns

2. **How do agents communicate with each other?**
   - Via Convex (comments/@mentions) — async, auditable
   - Via Clawdbot sessions — sync, direct
   - **Recommendation:** Start with Convex, add direct later

3. **Where does agent state live?**
   - Convex: tasks, comments, activity
   - Clawdbot memory: WORKING.md, MEMORY.md
   - **Recommendation:** Both — Convex for shared state, Clawdbot for agent-specific context

4. **How many agents to start with?**
   - Bhanu started with 10 specialized agents
   - **Recommendation:** Start with 3 (Mako + Scout + Scribe), expand as needed

---

## Next Steps

1. Review this plan
2. Decide on open questions
3. Set up Convex and Clerk
4. Build the core dashboard
5. Wire up Clawdbot Gateway connection

---

*Last updated: 2026-02-11*
