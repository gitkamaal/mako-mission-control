"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Session {
  key: string;
  kind?: string;
  agentId?: string;
  model?: string;
  channel?: string;
}

interface GatewayStatusProps {
  gatewayUrl?: string;
}

export function GatewayStatus({ gatewayUrl = "ws://127.0.0.1:18789" }: GatewayStatusProps) {
  const [connected, setConnected] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);

  const connect = useCallback(() => {
    try {
      const socket = new WebSocket(gatewayUrl);
      
      socket.onopen = () => {
        setConnected(true);
        setError(null);
        // Request sessions list
        socket.send(JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "sessions.list",
          params: { limit: 10 }
        }));
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.result && Array.isArray(data.result)) {
            setSessions(data.result);
          }
        } catch (e) {
          console.error("Failed to parse message:", e);
        }
      };

      socket.onclose = () => {
        setConnected(false);
        setWs(null);
      };

      socket.onerror = () => {
        setError("Connection failed");
        setConnected(false);
      };

      setWs(socket);
    } catch (e) {
      setError("Failed to connect");
    }
  }, [gatewayUrl]);

  const disconnect = useCallback(() => {
    if (ws) {
      ws.close();
      setWs(null);
    }
  }, [ws]);

  // Auto-reconnect on mount
  useEffect(() => {
    connect();
    return () => {
      if (ws) ws.close();
    };
  }, []);

  // Poll for sessions every 30s when connected
  useEffect(() => {
    if (!connected || !ws) return;

    const interval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          jsonrpc: "2.0",
          id: Date.now(),
          method: "sessions.list",
          params: { limit: 10 }
        }));
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [connected, ws]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Clawdbot Gateway</CardTitle>
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${connected ? "bg-green-500" : "bg-red-500"}`} />
            <span className="text-xs text-muted-foreground">
              {connected ? "Connected" : "Disconnected"}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <p className="text-xs text-red-500 mb-2">{error}</p>
        )}
        
        {!connected ? (
          <Button size="sm" variant="outline" onClick={connect} className="w-full">
            Connect to Gateway
          </Button>
        ) : sessions.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-2">
            No active sessions
          </p>
        ) : (
          <div className="space-y-2">
            {sessions.slice(0, 5).map((session) => (
              <div
                key={session.key}
                className="flex items-center justify-between p-2 bg-slate-50 rounded text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-mono truncate">{session.key.slice(0, 12)}...</span>
                  {session.channel && (
                    <Badge variant="secondary" className="text-[10px]">
                      {session.channel}
                    </Badge>
                  )}
                </div>
                {session.model && (
                  <span className="text-muted-foreground truncate ml-2">
                    {session.model.split("/").pop()}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
