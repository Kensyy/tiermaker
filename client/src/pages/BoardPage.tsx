import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { DndContext, DragOverlay, type DragEndEvent, type DragStartEvent } from "@dnd-kit/core";
import type { BoardHydration, ImageAsset, PresenceUser, TierItem } from "@tiermaker/shared";
import { api } from "../lib/api";
import { useSocket } from "../context/SocketContext";
import { useBoardStore } from "../state/useBoardStore";
import { useCursorStore } from "../state/useCursorStore";
import { Navbar } from "../components/layout/Navbar";
import { BoardCanvas } from "../components/board/BoardCanvas";
import { PresenceBar } from "../components/board/PresenceBar";
import { DragPreview } from "../components/board/DragPreview";
import { LibrarySidebar } from "../components/library/LibrarySidebar";
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

  const setCursor = useCursorStore((state) => state.setCursor);
  const removeCursor = useCursorStore((state) => state.removeCursor);
  const resetCursors = useCursorStore((state) => state.reset);

  const [presence, setPresence] = useState<PresenceUser[]>([]);
  const [activeDragImage, setActiveDragImage] = useState<ImageAsset | undefined>(undefined);

  useEffect(() => {
    api.get<BoardHydration>(`/boards/${boardId}`).then(hydrate);
    return () => {
      reset();
      resetCursors();
    };
  }, [boardId, hydrate, reset, resetCursors]);

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
    const onCursorMoved = setCursor;
    const onCursorLeft = ({ userId }: { userId: number }) => removeCursor(userId);

    socket.on("item:placed", onPlaced);
    socket.on("item:moved", onMoved);
    socket.on("item:removed", onRemoved);
    socket.on("presence:update", onPresenceUpdate);
    socket.on("user:joined", onUserJoined);
    socket.on("user:left", onUserLeft);
    socket.on("cursor:moved", onCursorMoved);
    socket.on("cursor:left", onCursorLeft);

    return () => {
      socket.emit("board:leave", { boardId });
      socket.off("item:placed", onPlaced);
      socket.off("item:moved", onMoved);
      socket.off("item:removed", onRemoved);
      socket.off("presence:update", onPresenceUpdate);
      socket.off("user:joined", onUserJoined);
      socket.off("user:left", onUserLeft);
      socket.off("cursor:moved", onCursorMoved);
      socket.off("cursor:left", onCursorLeft);
    };
  }, [socket, boardId, upsertItem, removeItemLocal, setCursor, removeCursor]);

  function handleDragStart(event: DragStartEvent) {
    const data = event.active.data.current as DragData | undefined;
    if (!data) return;
    if (data.kind === "image") {
      setActiveDragImage(data.image);
    } else if (data.kind === "item") {
      setActiveDragImage(useBoardStore.getState().imagesById[data.item.imageId]);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveDragImage(undefined);
    if (!socket) return;
    const activeData = event.active.data.current as DragData | undefined;
    const overData = event.over?.data.current as DragData | undefined;
    if (!activeData || !overData) return;

    const target = resolveDropTarget(overData);
    if (!target) return;

    if (activeData.kind === "image") {
      // The board store only learns about images at hydration time; register
      // this one now so TierItemCard can render it as soon as the server echoes back.
      useBoardStore.getState().addImage(activeData.image);
      socket.emit("item:place", {
        boardId,
        tierId: target.tierId,
        imageId: activeData.image.id,
        index: target.index,
      });
    } else if (activeData.kind === "item") {
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
      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragCancel={() => setActiveDragImage(undefined)}>
        <div className="flex flex-1 overflow-hidden">
          <BoardCanvas />
          <LibrarySidebar />
        </div>
        <DragOverlay>
          <DragPreview image={activeDragImage} />
        </DragOverlay>
      </DndContext>
    </div>
  );
}
