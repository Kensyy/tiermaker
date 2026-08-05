import { io, type Socket } from "socket.io-client";
import type { ClientToServerEvents, ServerToClientEvents } from "@tiermaker/shared";
import { API_BASE_URL, getAuthToken } from "./api";

export type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export function createSocket(): AppSocket {
  return io(API_BASE_URL || undefined, {
    auth: { token: getAuthToken() },
    autoConnect: true,
  });
}
