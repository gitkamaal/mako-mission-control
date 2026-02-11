"use client";

export function SettingsView() {
  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-2">Settings</h1>
        <p className="text-secondary">Configure your Mission Control</p>
      </div>

      <div className="space-y-6">
        {/* Gateway */}
        <div className="liquid-card p-6">
          <h2 className="font-semibold mb-4">Gateway Connection</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-secondary mb-2">Gateway URL</label>
              <input 
                type="text" 
                defaultValue="ws://127.0.0.1:18789"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-white/20"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Auto-reconnect</span>
              <button className="w-12 h-7 bg-blue-500 rounded-full relative">
                <div className="absolute right-1 top-1 w-5 h-5 bg-white rounded-full" />
              </button>
            </div>
          </div>
        </div>

        {/* Agents */}
        <div className="liquid-card p-6">
          <h2 className="font-semibold mb-4">Agent Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Heartbeat Interval</p>
                <p className="text-sm text-secondary">How often agents check in</p>
              </div>
              <select className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm">
                <option>Every 15 minutes</option>
                <option>Every 30 minutes</option>
                <option>Every hour</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Auto-claim Tasks</p>
                <p className="text-sm text-secondary">Agents automatically pick up matching tasks</p>
              </div>
              <button className="w-12 h-7 bg-white/20 rounded-full relative">
                <div className="absolute left-1 top-1 w-5 h-5 bg-white rounded-full" />
              </button>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="liquid-card p-6">
          <h2 className="font-semibold mb-4">Notifications</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Task Completed</p>
                <p className="text-sm text-secondary">Notify when agents complete tasks</p>
              </div>
              <button className="w-12 h-7 bg-blue-500 rounded-full relative">
                <div className="absolute right-1 top-1 w-5 h-5 bg-white rounded-full" />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Agent Errors</p>
                <p className="text-sm text-secondary">Notify on agent failures</p>
              </div>
              <button className="w-12 h-7 bg-blue-500 rounded-full relative">
                <div className="absolute right-1 top-1 w-5 h-5 bg-white rounded-full" />
              </button>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="liquid-card p-6 border-red-500/30">
          <h2 className="font-semibold mb-4 text-red-400">Danger Zone</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Reset All Data</p>
              <p className="text-sm text-secondary">Clear all tasks, activity, and settings</p>
            </div>
            <button className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30">
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
