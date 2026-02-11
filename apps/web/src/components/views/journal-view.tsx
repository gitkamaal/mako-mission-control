"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export function JournalView() {
  const activity = useQuery(api.activity.recent, { limit: 20 });

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-2">Journal</h1>
        <p className="text-secondary">Activity log and system events</p>
      </div>

      <div className="space-y-4">
        {activity === undefined ? (
          <div className="liquid-card p-8 text-center text-secondary">
            Loading journal entries...
          </div>
        ) : activity.length === 0 ? (
          <div className="liquid-card p-8 text-center text-secondary">
            No journal entries yet
          </div>
        ) : (
          activity.map((entry) => (
            <div key={entry._id} className="liquid-card p-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                  {entry.type.includes("task") ? "📋" : 
                   entry.type.includes("agent") ? "🤖" : 
                   entry.type.includes("comment") ? "💬" : "⚡"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{entry.actorName}</span>
                    <span className="text-secondary">·</span>
                    <span className="text-sm text-secondary">
                      {entry.type.replace(/_/g, " ")}
                    </span>
                  </div>
                  <p className="text-sm text-secondary mb-2">
                    {formatDate(entry._creationTime)}
                  </p>
                  {entry.data && (
                    <div className="text-sm bg-white/5 rounded-lg p-3 mt-2">
                      <pre className="text-xs text-secondary overflow-x-auto">
                        {JSON.stringify(entry.data, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
