import type { Server } from "socket.io";
import type { ClientToServerEvents, ServerToClientEvents } from "@tiermaker/shared";
import { colorForUser } from "../services/userService.js";
import type { AppSocket } from "./index.js";

type AppServer = Server<ClientToServerEvents, ServerToClientEvents>;

const roomName = (boardId: number) => `board:${boardId}`;

export function registerCursorHandlers(io: AppServer, socket: AppSocket) {
  socket.on("cursor:move", ({ boardId, x, y }) => {
    const userId = socket.request.session.userId!;
    const displayName = socket.request.session.displayName!;
    // Ephemeral relay only — cursor positions are never written to the database.
    socket.to(roomName(boardId)).emit("cursor:moved", {
      userId,
      displayName,
      color: colorForUser(userId),
      x,
      y,
    });
  });
}
