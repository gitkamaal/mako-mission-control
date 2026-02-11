# 🦈 Mako Mission Control

AI Agent Orchestration Dashboard — A real-time mission control interface for managing AI agent squads powered by Clawdbot and Convex.

![Status](https://img.shields.io/badge/status-active-success)
![Agents](https://img.shields.io/badge/agents-6-blue)

## ✨ Features

- **🤖 Agent Squad Management** — Monitor 6 specialized AI agents in real-time
- **📋 Kanban Task Board** — Drag tasks through Inbox → In Progress → Review → Done
- **📡 Live Activity Feed** — See everything happening across the squad
- **🔌 Gateway Integration** — Connect to Clawdbot Gateway for session monitoring
- **⚡ Real-time Sync** — Powered by Convex for instant updates across all clients
- **🎯 Task Creation** — Create and assign tasks to agents from the UI
- **🔗 HTTP API** — Full REST API for agent access to the board

## 🤖 Agent Squad

| Agent | Emoji | Role | Specialty |
|-------|-------|------|-----------|
| **Mako** | 🦈 | Lead / Orchestrator | Delegation, architecture, final review |
| **Scout** | 🔍 | Researcher | Web research, competitive analysis |
| **Scribe** | ✍️ | Writer | Docs, content, copy, README files |
| **Atlas** | 🏛️ | Architect | System design, tech decisions |
| **Pixel** | 🎨 | Frontend Developer | React, UI/UX, Tailwind |
| **Forge** | ⚙️ | Backend Developer | APIs, databases, server logic |

## 🛠 Tech Stack

- **Frontend:** Next.js 16 (App Router) + React 19
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Database:** Convex (real-time)
- **Runtime:** Clawdbot Gateway
- **Package Manager:** Bun

## 🚀 Quick Start

### Prerequisites

- [Bun](https://bun.sh) v1.0+
- [Clawdbot](https://github.com/clawdbot/clawdbot) installed
- Node.js v20+ (for Convex CLI)

### 1. Clone and Install

```bash
git clone https://github.com/gitkamaal/mako-mission-control.git
cd mako-mission-control
bun install
```

### 2. Set Up Convex

```bash
cd apps/web
npx convex dev
```

This will:
- Open browser for Convex login
- Create a new project
- Generate `.env.local` with your deployment URL

### 3. Seed Initial Data

In a separate terminal:

```bash
npx convex run seed:seedAgents
npx convex run seed:seedTasks
```

### 4. Start the Dashboard

```bash
cd ~/mako-mission-control
bun dev
```

Open **http://localhost:3000** 🎉

## 📡 API Endpoints

The dashboard exposes HTTP endpoints for agent access:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/status` | GET | Dashboard summary (agents, tasks) |
| `/api/agents` | GET | List all agents |
| `/api/tasks` | GET | List tasks (optional `?status=` filter) |
| `/api/tasks` | POST | Create new task |
| `/api/tasks/claim` | POST | Claim a task |
| `/api/tasks/status` | POST | Update task status |
| `/api/tasks/comment` | POST | Add comment to task |
| `/api/activity` | GET | Recent activity feed |
| `/api/agents/heartbeat` | POST | Record agent heartbeat |

### Example: Create a Task

```bash
curl -X POST https://your-project.convex.site/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Research competitors",
    "description": "Analyze top 5 competitors",
    "priority": "high",
    "createdBy": "Mako",
    "createdByType": "agent",
    "assignedTo": "Scout"
  }'
```

### Example: Check Board Status

```bash
curl https://your-project.convex.site/api/status
```

## 📁 Project Structure

```
mako-mission-control/
├── apps/
│   └── web/                    # Next.js dashboard
│       ├── convex/             # Convex backend
│       │   ├── schema.ts       # Database schema
│       │   ├── agents.ts       # Agent functions
│       │   ├── tasks.ts        # Task functions
│       │   ├── activity.ts     # Activity feed
│       │   ├── http.ts         # HTTP API endpoints
│       │   └── seed.ts         # Initial data
│       └── src/
│           ├── app/            # Next.js pages
│           └── components/     # React components
├── packages/
│   └── clawdbot-client/        # Gateway WebSocket client
├── agents/                     # Agent soul definitions
│   ├── mako.md
│   ├── scout.md
│   ├── scribe.md
│   ├── atlas.md
│   ├── pixel.md
│   └── forge.md
└── docs/
    └── PLAN.md                 # Implementation plan
```

## 🔄 Clawdbot Integration

### Gateway Connection

The dashboard connects to Clawdbot Gateway via WebSocket for:
- Session monitoring
- Agent heartbeats
- Real-time status updates

Make sure Gateway is running:

```bash
clawdbot gateway status
clawdbot gateway start  # if not running
```

### Agent Access

Agents can interact with the board directly via HTTP API:

```bash
# Record heartbeat
curl -X POST https://your-project.convex.site/api/agents/heartbeat \
  -H "Content-Type: application/json" \
  -d '{"name": "Mako"}'

# Claim a task
curl -X POST https://your-project.convex.site/api/tasks/claim \
  -H "Content-Type: application/json" \
  -d '{"taskId": "...", "agentName": "Mako"}'
```

## 🗺 Roadmap

- [x] Project scaffolding
- [x] Convex backend + schema
- [x] Agent squad seeding
- [x] Dashboard UI
- [x] Kanban board
- [x] Task creation modal
- [x] HTTP API endpoints
- [x] Gateway status widget
- [ ] Clerk authentication
- [ ] Drag-and-drop tasks
- [ ] Agent heartbeat cron
- [ ] Inter-agent communication
- [ ] GitHub integration
- [ ] Notifications

## 📜 License

MIT

## 🙏 Credits

Inspired by [Bhanu Teja's Mission Control](https://x.com/pbteja1998/status/2017662163540971756) — a system where AI agents work together like a real team.

---

Built with 🦈 by Mako & Kamaal
