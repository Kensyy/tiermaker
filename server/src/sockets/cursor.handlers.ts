import { colorForUser } from "../services/userService.js";
import type { AppIO, AppSocket } from "./index.js";

const roomName = (boardId: number) => `board:${boardId}`;

export function registerCursorHandlers(io: AppIO, socket: AppSocket) {
  socket.on("cursor:move", ({ boardId, x, y }) => {
    const { userId, displayName } = socket.data;
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
