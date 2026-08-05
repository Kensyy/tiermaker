import type { Server as HttpServer } from "node:http";
import { Server, type Socket } from "socket.io";
import type { ClientToServerEvents, ServerToClientEvents } from "@tiermaker/shared";
import { env } from "../env.js";
import { sessionMiddleware } from "../session.js";
import { registerBoardHandlers } from "./board.handlers.js";
import { registerCursorHandlers } from "./cursor.handlers.js";

export type AppSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

declare module "node:http" {
  interface IncomingMessage {
    session: import("express-session").Session & Partial<import("express-session").SessionData>;
  }
}

export function createSocketServer(httpServer: HttpServer) {
  const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: { origin: env.clientOrigin, credentials: true },
  });

  // Reuse the same express-session middleware so each socket can read
  // socket.request.session.userId — this is how we know who is dragging
  // items or moving a cursor, without a separate auth handshake.
  io.engine.use(sessionMiddleware);

  io.use((socket, next) => {
    const userId = socket.request.session?.userId;
    if (!userId) {
      next(new Error("Not authenticated"));
      return;
    }
    next();
  });

  io.on("connection", (socket: AppSocket) => {
    registerBoardHandlers(io, socket);
    registerCursorHandlers(io, socket);
  });

  return io;
}
