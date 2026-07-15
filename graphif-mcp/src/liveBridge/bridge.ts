import { randomUUID } from "node:crypto";
import { WebSocket, WebSocketServer } from "ws";
import { GraphifMcpError } from "../errors.js";
import type { LiveBridgeStatus, LiveCommandRequest, LiveCommandResponse } from "./protocol.js";

interface PendingRequest {
  resolve: (value: unknown) => void;
  reject: (error: Error) => void;
  timeout: NodeJS.Timeout;
}

export interface LiveBridgeOptions {
  port: number;
  host?: string;
  commandTimeoutMs?: number;
}

export class LiveBridge {
  private server: WebSocketServer | null = null;
  private pluginSocket: WebSocket | null = null;
  private readonly pending = new Map<string, PendingRequest>();
  private lastConnectedAt: string | null = null;
  private replacedConnections = 0;

  constructor(private readonly options: LiveBridgeOptions) {}

  status(): LiveBridgeStatus {
    return {
      connected: this.pluginSocket?.readyState === WebSocket.OPEN,
      port: this.getPort(),
      lastConnectedAt: this.lastConnectedAt,
      replacedConnections: this.replacedConnections,
    };
  }

  async start(): Promise<void> {
    if (this.server) return;
    this.server = new WebSocketServer({
      host: this.options.host ?? "127.0.0.1",
      port: this.options.port,
    });
    this.server.on("connection", (socket) => this.handleConnection(socket));
    await new Promise<void>((resolve, reject) => {
      this.server?.once("listening", resolve);
      this.server?.once("error", reject);
    });
  }

  async stop(): Promise<void> {
    for (const request of this.pending.values()) {
      clearTimeout(request.timeout);
      request.reject(new GraphifMcpError("LIVE_COMMAND_FAILED", "Live bridge stopped before Graphif responded"));
    }
    this.pending.clear();
    this.pluginSocket?.close();
    this.pluginSocket = null;
    if (!this.server) return;
    const server = this.server;
    this.server = null;
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }

  async sendCommand(command: string, payload: unknown): Promise<unknown> {
    const socket = this.pluginSocket;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      throw new GraphifMcpError("GRAPHIF_NOT_CONNECTED", "Graphif live plugin is not connected");
    }

    const id = randomUUID();
    const request: LiveCommandRequest = {
      id,
      type: "command",
      command,
      payload,
    };

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pending.delete(id);
        reject(new GraphifMcpError("LIVE_COMMAND_TIMEOUT", `Graphif live command timed out: ${command}`));
      }, this.options.commandTimeoutMs ?? 10_000);
      this.pending.set(id, { resolve, reject, timeout });
      socket.send(JSON.stringify(request), (error) => {
        if (!error) return;
        clearTimeout(timeout);
        this.pending.delete(id);
        reject(new GraphifMcpError("LIVE_COMMAND_FAILED", `Failed to send Graphif live command: ${command}`, error.message));
      });
    });
  }

  private handleConnection(socket: WebSocket): void {
    if (this.pluginSocket && this.pluginSocket.readyState === WebSocket.OPEN) {
      this.replacedConnections += 1;
      this.pluginSocket.close();
    }
    this.pluginSocket = socket;
    this.lastConnectedAt = new Date().toISOString();
    socket.on("message", (data) => this.handleMessage(data.toString()));
    socket.on("close", () => {
      if (this.pluginSocket === socket) {
        this.pluginSocket = null;
      }
    });
  }

  private handleMessage(raw: string): void {
    let response: LiveCommandResponse;
    try {
      response = JSON.parse(raw) as LiveCommandResponse;
    } catch {
      return;
    }

    const pending = this.pending.get(response.id);
    if (!pending) return;
    clearTimeout(pending.timeout);
    this.pending.delete(response.id);
    if (response.ok) {
      pending.resolve(response.result);
      return;
    }
    pending.reject(new GraphifMcpError("LIVE_COMMAND_FAILED", response.error.message, response.error));
  }

  private getPort(): number {
    const address = this.server?.address();
    if (typeof address === "object" && address) {
      return address.port;
    }
    return this.options.port;
  }
}
