"use client";

export function ApiUsageView() {
  const endpoints = [
    { method: "GET", path: "/api/status", calls: 156, avgMs: 45 },
    { method: "GET", path: "/api/tasks", calls: 89, avgMs: 62 },
    { method: "POST", path: "/api/tasks", calls: 12, avgMs: 78 },
    { method: "GET", path: "/api/agents", calls: 67, avgMs: 38 },
    { method: "POST", path: "/api/agents/heartbeat", calls: 234, avgMs: 25 },
    { method: "GET", path: "/api/activity", calls: 45, avgMs: 52 },
  ];

  const totalCalls = endpoints.reduce((sum, e) => sum + e.calls, 0);

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-2">API Usage</h1>
        <p className="text-secondary">Monitor your API endpoints and usage</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-5 mb-8">
        <div className="liquid-card p-5">
          <p className="text-sm text-secondary mb-1">Total Calls (24h)</p>
          <p className="text-3xl font-semibold">{totalCalls}</p>
        </div>
        <div className="liquid-card p-5">
          <p className="text-sm text-secondary mb-1">Avg Response</p>
          <p className="text-3xl font-semibold">48ms</p>
        </div>
        <div className="liquid-card p-5">
          <p className="text-sm text-secondary mb-1">Error Rate</p>
          <p className="text-3xl font-semibold accent-green">0.2%</p>
        </div>
      </div>

      {/* Endpoints Table */}
      <div className="liquid-card overflow-hidden">
        <div className="p-5 border-b border-white/5">
          <h2 className="font-semibold">Endpoints</h2>
        </div>
        <div className="divide-y divide-white/5">
          {endpoints.map((endpoint, i) => (
            <div key={i} className="flex items-center px-5 py-4 hover:bg-white/5">
              <span className={`w-16 text-xs font-mono font-medium ${
                endpoint.method === "GET" ? "accent-green" : 
                endpoint.method === "POST" ? "accent-blue" : "accent-orange"
              }`}>
                {endpoint.method}
              </span>
              <span className="flex-1 font-mono text-sm">{endpoint.path}</span>
              <span className="w-24 text-right text-sm">{endpoint.calls} calls</span>
              <span className="w-24 text-right text-sm text-secondary">{endpoint.avgMs}ms</span>
            </div>
          ))}
        </div>
      </div>

      {/* API Key */}
      <div className="liquid-card p-5 mt-6">
        <h3 className="font-semibold mb-4">Your API Endpoint</h3>
        <div className="flex items-center gap-3">
          <code className="flex-1 bg-white/5 rounded-lg px-4 py-3 text-sm font-mono">
            https://prestigious-marten-892.convex.site/api
          </code>
          <button className="btn-glass">Copy</button>
        </div>
      </div>
    </div>
  );
}
