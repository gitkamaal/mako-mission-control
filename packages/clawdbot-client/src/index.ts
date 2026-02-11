/**
 * Clawdbot Gateway Client
 * Connects to the Clawdbot Gateway WebSocket for real-time agent monitoring
 */

export interface Session {
  key: string;
  kind: string;
  agentId?: string;
  model?: string;
  channel?: string;
  createdAt: string;
  lastActivity?: string;
  messages?: Message[];
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

export interface CronJob {
  id: string;
  schedule: string;
  text: string;
  enabled: boolean;
  lastRun?: string;
  nextRun?: string;
}

export interface GatewayStatus {
  version: string;
  uptime: number;
  sessions: number;
  model: string;
}

export type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'error';

export interface ClawdbotClientOptions {
  url?: string;
  token?: string;
  onStateChange?: (state: ConnectionState) => void;
  onMessage?: (message: unknown) => void;
}

export class ClawdbotClient {
  private ws: WebSocket | null = null;
  private url: string;
  private token?: string;
  private state: ConnectionState = 'disconnected';
  private options: ClawdbotClientOptions;
  private requestId = 0;
  private pendingRequests = new Map<number, { resolve: (value: unknown) => void; reject: (error: Error) => void }>();

  constructor(options: ClawdbotClientOptions = {}) {
    this.url = options.url || 'ws://127.0.0.1:18789';
    this.token = options.token;
    this.options = options;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.setState('connecting');
      
      try {
        this.ws = new WebSocket(this.url);
        
        this.ws.onopen = () => {
          this.setState('connected');
          resolve();
        };
        
        this.ws.onclose = () => {
          this.setState('disconnected');
        };
        
        this.ws.onerror = (error) => {
          this.setState('error');
          reject(new Error('WebSocket connection failed'));
        };
        
        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            // Handle RPC responses
            if (data.id !== undefined && this.pendingRequests.has(data.id)) {
              const { resolve, reject } = this.pendingRequests.get(data.id)!;
              this.pendingRequests.delete(data.id);
              
              if (data.error) {
                reject(new Error(data.error.message || 'RPC error'));
              } else {
                resolve(data.result);
              }
            }
            
            // Forward to message handler
            this.options.onMessage?.(data);
          } catch (e) {
            console.error('Failed to parse message:', e);
          }
        };
      } catch (error) {
        this.setState('error');
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.setState('disconnected');
  }

  getState(): ConnectionState {
    return this.state;
  }

  private setState(state: ConnectionState): void {
    this.state = state;
    this.options.onStateChange?.(state);
  }

  private rpc<T>(method: string, params: Record<string, unknown> = {}): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.state !== 'connected') {
        reject(new Error('Not connected'));
        return;
      }

      const id = ++this.requestId;
      this.pendingRequests.set(id, { resolve: resolve as (value: unknown) => void, reject });

      this.ws.send(JSON.stringify({
        jsonrpc: '2.0',
        id,
        method,
        params: {
          ...params,
          ...(this.token && { token: this.token }),
        },
      }));

      // Timeout after 30s
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error('Request timeout'));
        }
      }, 30000);
    });
  }

  // API Methods

  async getStatus(): Promise<GatewayStatus> {
    return this.rpc<GatewayStatus>('status');
  }

  async listSessions(options: { limit?: number; messageLimit?: number } = {}): Promise<Session[]> {
    return this.rpc<Session[]>('sessions.list', options);
  }

  async getSessionHistory(sessionKey: string, options: { limit?: number; includeTools?: boolean } = {}): Promise<Message[]> {
    return this.rpc<Message[]>('sessions.history', { sessionKey, ...options });
  }

  async sendToSession(sessionKey: string, message: string): Promise<unknown> {
    return this.rpc('sessions.send', { sessionKey, message });
  }

  async listCronJobs(includeDisabled = false): Promise<CronJob[]> {
    return this.rpc<CronJob[]>('cron.list', { includeDisabled });
  }

  async runCronJob(jobId: string): Promise<unknown> {
    return this.rpc('cron.run', { jobId });
  }
}

export default ClawdbotClient;
