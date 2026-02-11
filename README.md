# 🦈 Mako Mission Control

AI Agent Orchestration Dashboard — A mission control interface for managing AI agent squads powered by Clawdbot.

## Overview

Mission Control provides a real-time dashboard for:
- **Agent Management** — Monitor and coordinate multiple AI agents
- **Task Orchestration** — Assign, track, and review tasks across agents  
- **Session Monitoring** — Live view of all Clawdbot sessions
- **Activity Feed** — Real-time stream of agent actions and communications
- **Memory Browser** — Search and view agent memory files

## Tech Stack

- **Frontend:** Next.js 14 (App Router) + React 19
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Database:** Convex (real-time)
- **Backend:** Clawdbot Gateway API
- **Package Manager:** Bun

## Project Structure

```
mako-mission-control/
├── apps/
│   └── web/                 # Next.js dashboard
├── packages/
│   └── clawdbot-client/     # Gateway WebSocket client
├── agents/                  # Agent soul definitions
│   ├── mako.md              # Lead agent
│   └── scout.md             # Researcher agent
└── docs/                    # Documentation
```

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) v1.0+
- [Clawdbot](https://github.com/clawdbot/clawdbot) running locally
- Node.js v20+ (for Convex CLI)

### Installation

```bash
# Clone the repo
git clone https://github.com/gitkamaal/mako-mission-control.git
cd mako-mission-control

# Install dependencies
bun install

# Start the development server
bun dev
```

### Clawdbot Gateway

Make sure Clawdbot Gateway is running:

```bash
clawdbot gateway status
# or start it with:
clawdbot gateway start
```

The dashboard connects to `ws://127.0.0.1:18789` by default.

## Agent Squad

| Agent | Role | Status |
|-------|------|--------|
| 🦈 **Mako** | Lead / Orchestrator | Active |
| 🔍 **Scout** | Researcher | Planned |
| ✍️ **Scribe** | Writer | Planned |
| 🔎 **Auditor** | Reviewer | Planned |
| ⚙️ **Ops** | DevOps | Planned |

## Roadmap

### Phase 1: Foundation ✅
- [x] Project scaffolding
- [x] Next.js + Tailwind setup
- [x] Basic dashboard UI
- [x] Agent cards component
- [x] Clawdbot client library

### Phase 2: Core Features 🚧
- [ ] Convex database integration
- [ ] Real-time Gateway connection
- [ ] Session list view
- [ ] Task board (Kanban)
- [ ] Activity feed

### Phase 3: Agent Squad
- [ ] Agent heartbeat system
- [ ] Inter-agent communication
- [ ] Task claiming and delegation
- [ ] Memory persistence

### Phase 4: Integrations
- [ ] GitHub (PRs, issues, CI)
- [ ] Notion sync
- [ ] Slack/Discord notifications

## Inspiration

Inspired by [Bhanu Teja's Mission Control](https://x.com/pbteja1998/status/2017662163540971756) — a system where 10 AI agents work together like a real team.

## License

MIT
