import { io, Socket } from "socket.io-client";
import { API_BASE_URL } from "@/lib/config";

export type WsStatus = "disconnected" | "connecting" | "connected";

type Listener = (data: Record<string, unknown>) => void;

const MAX_PENDING_SENDS = 30;

const SUPPORT_EVENTS = [
  "support.message",
  "support.edit",
  "support.typing",
  "support.read",
  "support.send.ack",
  "support.error",
  "support:ticket_status_updated",
  "support:ticket_replied",
  "support:ticket_created",
] as const;

class SupportSocket {
  private socket: Socket | null = null;
  private listeners = new Map<string, Set<Listener>>();
  private statusListeners = new Set<(status: WsStatus) => void>();
  private _status: WsStatus = "disconnected";
  private connectAttemptInFlight = false;
  private pendingSends: Array<{ event: string; data: Record<string, unknown> }> =
    [];
  private pendingTicketId: number | null = null;
  private currentToken: string | null = null;

  get status() {
    return this._status;
  }

  private setStatus(s: WsStatus) {
    this._status = s;
    this.statusListeners.forEach((fn) => fn(s));
  }

  private flushPendingJoin() {
    if (!this.socket?.connected || this.pendingTicketId === null) return;
    this.socket.emit("support.join", { ticket_id: this.pendingTicketId });
  }

  private flushPendingSends() {
    if (!this.socket?.connected || this.pendingSends.length === 0) return;
    const batch = this.pendingSends.splice(0);
    for (const { event, data } of batch) {
      this.socket.emit(event, data);
    }
  }

  private bindSocketEvents() {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      this.connectAttemptInFlight = false;
      this.setStatus("connected");
      this.flushPendingJoin();
      queueMicrotask(() => this.flushPendingSends());
    });

    this.socket.on("disconnect", () => {
      this.setStatus("disconnected");
    });

    this.socket.on("connect_error", () => {
      this.connectAttemptInFlight = false;
      this.setStatus("disconnected");
    });

    this.socket.on("reconnect", () => {
      this.flushPendingJoin();
    });

    for (const event of SUPPORT_EVENTS) {
      this.socket.on(event, (payload: Record<string, unknown>) => {
        const data =
          typeof payload === "object" && payload !== null
            ? { ...payload, type: event }
            : { type: event };
        this.listeners.get(event)?.forEach((fn) => fn(data));
        this.listeners.get("*")?.forEach((fn) => fn(data));
      });
    }
  }

  connect(accessToken: string) {
    if (!accessToken) {
      this.setStatus("disconnected");
      return;
    }

    if (this.socket?.connected && this.currentToken === accessToken) {
      this.flushPendingJoin();
      return;
    }

    if (this.connectAttemptInFlight) return;

    this.setStatus("connecting");
    this.connectAttemptInFlight = true;
    this.currentToken = accessToken;

    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }

    try {
      this.socket = io(API_BASE_URL, {
        auth: { token: `Bearer ${accessToken}` },
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionDelay: 1500,
        reconnectionDelayMax: 10000,
        reconnectionAttempts: 10,
      });

      this.bindSocketEvents();
    } catch {
      this.connectAttemptInFlight = false;
      this.setStatus("disconnected");
    }
  }

  updateToken(accessToken: string) {
    if (!accessToken) return;
    if (this.socket?.connected && this.currentToken !== accessToken) {
      this.currentToken = accessToken;
      this.socket.auth = { token: `Bearer ${accessToken}` };
      this.socket.disconnect().connect();
    } else if (!this.socket?.connected) {
      this.connect(accessToken);
    }
  }

  disconnect() {
    this.connectAttemptInFlight = false;
    this.pendingSends = [];
    this.currentToken = null;
    this.socket?.disconnect();
    this.socket?.removeAllListeners();
    this.socket = null;
    this.setStatus("disconnected");
  }

  joinTicket(ticketId: number) {
    this.pendingTicketId = ticketId;
    this.flushPendingJoin();
  }

  leaveTicket(ticketId: number) {
    if (this.pendingTicketId === ticketId) this.pendingTicketId = null;
    this.socket?.emit("support.leave", { ticket_id: ticketId });
  }

  send(event: string, data: Record<string, unknown>) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
      return true;
    }
    if (this.pendingSends.length < MAX_PENDING_SENDS) {
      this.pendingSends.push({ event, data });
    }
    return false;
  }

  on(type: string, fn: Listener) {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type)!.add(fn);
    return () => {
      this.listeners.get(type)?.delete(fn);
    };
  }

  onStatus(fn: (status: WsStatus) => void) {
    this.statusListeners.add(fn);
    return () => {
      this.statusListeners.delete(fn);
    };
  }
}

export const supportWs = new SupportSocket();
