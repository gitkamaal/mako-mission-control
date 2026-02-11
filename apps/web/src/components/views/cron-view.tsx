"use client";

import { useState } from "react";

interface CronJob {
  id: string;
  name: string;
  schedule: string;
  agent: string;
  status: "active" | "paused";
  lastRun: string;
  nextRun: string;
}

const mockCronJobs: CronJob[] = [
  { 
    id: "1", 
    name: "Mako Heartbeat", 
    schedule: "*/15 * * * *", 
    agent: "Mako", 
    status: "active",
    lastRun: "5 min ago",
    nextRun: "in 10 min"
  },
  { 
    id: "2", 
    name: "Scout Research Scan", 
    schedule: "0 */6 * * *", 
    agent: "Scout", 
    status: "active",
    lastRun: "2 hours ago",
    nextRun: "in 4 hours"
  },
  { 
    id: "3", 
    name: "Daily Digest", 
    schedule: "0 9 * * *", 
    agent: "Scribe", 
    status: "paused",
    lastRun: "1 day ago",
    nextRun: "paused"
  },
];

export function CronView() {
  const [jobs] = useState(mockCronJobs);

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Cron Jobs</h1>
          <p className="text-secondary">Scheduled agent tasks and automations</p>
        </div>
        <button className="btn-glass">
          + New Job
        </button>
      </div>

      <div className="space-y-4">
        {jobs.map((job) => (
          <div key={job.id} className="liquid-card p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`status-dot ${job.status === "active" ? "status-active" : "status-offline"}`} />
                <div>
                  <h3 className="font-medium">{job.name}</h3>
                  <p className="text-sm text-secondary font-mono">{job.schedule}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-6 text-sm">
                <div>
                  <p className="text-secondary">Agent</p>
                  <p>{job.agent}</p>
                </div>
                <div>
                  <p className="text-secondary">Last Run</p>
                  <p>{job.lastRun}</p>
                </div>
                <div>
                  <p className="text-secondary">Next Run</p>
                  <p className={job.status === "paused" ? "text-secondary" : "accent-green"}>
                    {job.nextRun}
                  </p>
                </div>
                <button className="btn-glass text-xs">
                  {job.status === "active" ? "Pause" : "Resume"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
