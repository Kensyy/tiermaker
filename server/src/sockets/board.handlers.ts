import type { PresenceUser } from "@tiermaker/shared";
import { colorForUser } from "../services/userService.js";
import { moveItem, placeItem, removeItem } from "../services/tierItemService.js";
import { getImage } from "../services/imageService.js";
import type { AppIO, AppSocket } from "./index.js";

const roomName = (boardId: number) => `board:${boardId}`;

/** boardId -> socketId -> presence info. In-memory only; rebuilt on server restart. */
const presenceByBoard = new Map<number, Map<string, PresenceUser>>();

function presenceUserFor(socket: AppSocket): PresenceUser {
  const { userId, displayName } = socket.data;
  return { userId, displayName, color: colorForUser(userId) };
}

function leaveBoard(io: AppIO, socket: AppSocket, boardId: number) {
  socket.leave(roomName(boardId));
  const presence = presenceByBoard.get(boardId);
  const user = presence?.get(socket.id);
  presence?.delete(socket.id);
  if (user) {
    io.to(roomName(boardId)).emit("user:left", user);
    io.to(roomName(boardId)).emit("cursor:left", { userId: user.userId });
  }
}

export function registerBoardHandlers(io: AppIO, socket: AppSocket) {
  socket.on("board:join", ({ boardId }) => {
    socket.join(roomName(boardId));

    const user = presenceUserFor(socket);
    const presence = presenceByBoard.get(boardId) ?? new Map<string, PresenceUser>();
    presence.set(socket.id, user);
    presenceByBoard.set(boardId, presence);

    socket.emit("presence:update", [...presence.values()]);
    socket.to(roomName(boardId)).emit("user:joined", user);
  });

  socket.on("board:leave", ({ boardId }) => {
    leaveBoard(io, socket, boardId);
  });

  socket.on("item:place", async ({ boardId, tierId, imageId, index }) => {
    try {
      const item = await placeItem({ boardId, tierId, imageId, index, placedBy: socket.data.userId });
      const image = await getImage(item.imageId);
      if (image) io.to(roomName(boardId)).emit("item:placed", { item, image });
    } catch {
      socket.emit("error", { message: "Failed to place item" });
    }
  });

  socket.on("item:move", async ({ boardId, itemId, toTierId, index }) => {
    try {
      const item = await moveItem({ itemId, toTierId, index, placedBy: socket.data.userId });
      if (!item) return;
      const image = await getImage(item.imageId);
      if (image) io.to(roomName(boardId)).emit("item:moved", { item, image });
    } catch {
      socket.emit("error", { message: "Failed to move item" });
    }
  });

  socket.on("item:remove", async ({ boardId, itemId }) => {
    try {
      const removed = await removeItem(itemId);
      if (removed) {
        io.to(roomName(boardId)).emit("item:removed", {
          itemId,
          tierId: removed.tierId,
          imageId: removed.imageId,
          removedBy: socket.data.userId,
        });
      }
    } catch {
      socket.emit("error", { message: "Failed to remove item" });
    }
  });

  socket.on("disconnect", () => {
    for (const boardId of presenceByBoard.keys()) {
      if (presenceByBoard.get(boardId)?.has(socket.id)) {
        leaveBoard(io, socket, boardId);
      }
    }
  });
}
