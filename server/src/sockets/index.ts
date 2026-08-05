import type { Server as HttpServer } from "node:http";
import { Server, type Socket } from "socket.io";
import type { ClientToServerEvents, ServerToClientEvents } from "@tiermaker/shared";
import { env } from "../env.js";
import { verifyToken, type TokenInfo } from "../services/tokenService.js";
import { registerBoardHandlers } from "./board.handlers.js";
import { registerCursorHandlers } from "./cursor.handlers.js";

export type AppSocket = Socket<ClientToServerEvents, ServerToClientEvents, object, TokenInfo>;
export type AppIO = Server<ClientToServerEvents, ServerToClientEvents, object, TokenInfo>;

/** Reads the socket server that `index.ts` attaches to the Express app via `app.set("io", io)`. */
export function getIo(app: { get(name: string): unknown }): AppIO {
  return app.get("io") as AppIO;
}

export function createSocketServer(httpServer: HttpServer) {
  const io: AppIO = new Server(httpServer, {
    cors: { origin: env.clientOrigin },
  });

  // Auth is a bearer token (sent as handshake.auth.token), not a cookie —
  // see server/src/services/tokenService.ts for why.
  io.use((socket, next) => {
    const info = verifyToken(socket.handshake.auth?.token);
    if (!info) {
      next(new Error("Not authenticated"));
      return;
    }
    socket.data = info;
    next();
  });

  io.on("connection", (socket: AppSocket) => {
    registerBoardHandlers(io, socket);
    registerCursorHandlers(io, socket);
  });

  return io;
}
