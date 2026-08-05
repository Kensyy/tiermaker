import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import type { BoardHydration, PresenceUser, TierItem } from "@tiermaker/shared";
import { api } from "../lib/api";
import { useSocket } from "../context/SocketContext";
import { useBoardStore } from "../state/useBoardStore";
import { Navbar } from "../components/layout/Navbar";
import { BoardCanvas } from "../components/board/BoardCanvas";
import { PresenceBar } from "../components/board/PresenceBar";
import type { DragData } from "../components/board/dndTypes";

function resolveDropTarget(overData: DragData): { tierId: number; index: number } | null {
  if (overData.kind === "tier") {
    const count = useBoardStore.getState().itemsForTier(overData.tierId).length;
    return { tierId: overData.tierId, index: count };
  }
  if (overData.kind === "item") {
    const overItem = overData.item;
    const siblings = useBoardStore.getState().itemsForTier(overItem.tierId);
    const index = siblings.findIndex((i) => i.id === overItem.id);
    return { tierId: overItem.tierId, index: Math.max(index, 0) };
  }
  return null;
}

export function BoardPage() {
  const { boardId: boardIdParam } = useParams<{ boardId: string }>();
  const boardId = Number(boardIdParam);
  const socket = useSocket();

  const board = useBoardStore((state) => state.board);
  const hydrate = useBoardStore((state) => state.hydrate);
  const reset = useBoardStore((state) => state.reset);
  const upsertItem = useBoardStore((state) => state.upsertItem);
  const removeItemLocal = useBoardStore((state) => state.removeItem);

  const [presence, setPresence] = useState<PresenceUser[]>([]);

  useEffect(() => {
    api.get<BoardHydration>(`/boards/${boardId}`).then(hydrate);
    return () => {
      reset();
    };
  }, [boardId, hydrate, reset]);

  useEffect(() => {
    if (!socket) return;

    socket.emit("board:join", { boardId });

    const onPlaced = (item: TierItem) => upsertItem(item);
    const onMoved = (item: TierItem) => upsertItem(item);
    const onRemoved = ({ itemId }: { itemId: number }) => removeItemLocal(itemId);
    const onPresenceUpdate = (users: PresenceUser[]) => setPresence(users);
    const onUserJoined = (user: PresenceUser) => setPresence((prev) => [...prev, user]);
    const onUserLeft = (user: PresenceUser) =>
      setPresence((prev) => prev.filter((u) => u.userId !== user.userId));

    socket.on("item:placed", onPlaced);
    socket.on("item:moved", onMoved);
    socket.on("item:removed", onRemoved);
    socket.on("presence:update", onPresenceUpdate);
    socket.on("user:joined", onUserJoined);
    socket.on("user:left", onUserLeft);

    return () => {
      socket.emit("board:leave", { boardId });
      socket.off("item:placed", onPlaced);
      socket.off("item:moved", onMoved);
      socket.off("item:removed", onRemoved);
      socket.off("presence:update", onPresenceUpdate);
      socket.off("user:joined", onUserJoined);
      socket.off("user:left", onUserLeft);
    };
  }, [socket, boardId, upsertItem, removeItemLocal]);

  function handleDragEnd(event: DragEndEvent) {
    if (!socket) return;
    const activeData = event.active.data.current as DragData | undefined;
    const overData = event.over?.data.current as DragData | undefined;
    if (!activeData || !overData) return;

    const target = resolveDropTarget(overData);
    if (!target) return;

    if (activeData.kind === "item") {
      socket.emit("item:move", {
        boardId,
        itemId: activeData.item.id,
        toTierId: target.tierId,
        index: target.index,
      });
    }
  }

  return (
    <div className="flex h-screen flex-col">
      <Navbar />
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2">
        <h1 className="text-lg font-semibold text-slate-100">{board?.name ?? "Loading…"}</h1>
        <PresenceBar users={presence} />
      </div>
      <DndContext onDragEnd={handleDragEnd}>
        <div className="flex flex-1 overflow-hidden">
          <BoardCanvas />
        </div>
      </DndContext>
    </div>
  );
}
