import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { DndContext, DragOverlay, type DragEndEvent, type DragStartEvent } from "@dnd-kit/core";
import { toPng } from "html-to-image";
import type { BoardHydration, ImageAsset, PresenceUser, TierItemBroadcast } from "@tiermaker/shared";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { useBoardStore } from "../state/useBoardStore";
import { useCursorStore } from "../state/useCursorStore";
import { useToastStore } from "../state/useToastStore";
import { Navbar } from "../components/layout/Navbar";
import { BoardCanvas } from "../components/board/BoardCanvas";
import { PresenceBar } from "../components/board/PresenceBar";
import { DragPreview } from "../components/board/DragPreview";
import { ToastStack } from "../components/board/ToastStack";
import { LibrarySidebar } from "../components/library/LibrarySidebar";
import { Button } from "../components/ui/Button";
import type { DragData } from "../components/board/dndTypes";

function describeAction(
  presence: PresenceUser[],
  userId: number,
  tierId: number,
  imageId: number,
  verb: "placed" | "moved" | "removed",
): string {
  const actor = presence.find((u) => u.userId === userId)?.displayName ?? "Someone";
  const tier = useBoardStore.getState().tiers.find((t) => t.id === tierId);
  const image = useBoardStore.getState().imagesById[imageId];
  const imageName = image?.originalName ?? "an image";
  const tierLabel = tier?.label ?? "?";
  const preposition = verb === "removed" ? "from" : "to";
  return `${actor} ${verb} ${imageName} ${preposition} ${tierLabel}`;
}

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
  const { user } = useAuth();

  const board = useBoardStore((state) => state.board);
  const hydrate = useBoardStore((state) => state.hydrate);
  const reset = useBoardStore((state) => state.reset);
  const upsertItem = useBoardStore((state) => state.upsertItem);
  const removeItemLocal = useBoardStore((state) => state.removeItem);
  const addImage = useBoardStore((state) => state.addImage);
  const upsertTier = useBoardStore((state) => state.upsertTier);
  const removeTierLocal = useBoardStore((state) => state.removeTier);

  const addToast = useToastStore((state) => state.addToast);

  const setCursor = useCursorStore((state) => state.setCursor);
  const removeCursor = useCursorStore((state) => state.removeCursor);
  const resetCursors = useCursorStore((state) => state.reset);

  const [presence, setPresence] = useState<PresenceUser[]>([]);
  const [activeDragImage, setActiveDragImage] = useState<ImageAsset | undefined>(undefined);
  const [exporting, setExporting] = useState(false);
  const boardCanvasRef = useRef<HTMLDivElement>(null);

  // Socket listeners below are only registered once per socket/board, so they
  // must read presence through a ref rather than closing over the state
  // directly — otherwise toast messages would use a stale, possibly-empty list.
  const presenceRef = useRef(presence);
  useEffect(() => {
    presenceRef.current = presence;
  }, [presence]);

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

    const onPlaced = ({ item, image }: TierItemBroadcast) => {
      addImage(image);
      upsertItem(item);
      if (item.placedBy !== user?.id) {
        addToast(describeAction(presenceRef.current, item.placedBy!, item.tierId, item.imageId, "placed"));
      }
    };
    const onMoved = ({ item, image }: TierItemBroadcast) => {
      addImage(image);
      upsertItem(item);
      if (item.placedBy !== user?.id) {
        addToast(describeAction(presenceRef.current, item.placedBy!, item.tierId, item.imageId, "moved"));
      }
    };
    const onRemoved = ({ itemId, tierId, imageId, removedBy }: { itemId: number; tierId: number; imageId: number; removedBy: number }) => {
      removeItemLocal(itemId);
      if (removedBy !== user?.id) {
        addToast(describeAction(presenceRef.current, removedBy, tierId, imageId, "removed"));
      }
    };
    const onPresenceUpdate = (users: PresenceUser[]) => setPresence(users);
    const onUserJoined = (joinedUser: PresenceUser) => setPresence((prev) => [...prev, joinedUser]);
    const onUserLeft = (leftUser: PresenceUser) =>
      setPresence((prev) => prev.filter((u) => u.userId !== leftUser.userId));
    const onCursorMoved = setCursor;
    const onCursorLeft = ({ userId }: { userId: number }) => removeCursor(userId);
    const onTierAdded = upsertTier;
    const onTierUpdated = upsertTier;
    const onTierRemoved = ({ tierId }: { tierId: number }) => removeTierLocal(tierId);

    socket.on("item:placed", onPlaced);
    socket.on("item:moved", onMoved);
    socket.on("item:removed", onRemoved);
    socket.on("presence:update", onPresenceUpdate);
    socket.on("user:joined", onUserJoined);
    socket.on("user:left", onUserLeft);
    socket.on("cursor:moved", onCursorMoved);
    socket.on("cursor:left", onCursorLeft);
    socket.on("tier:added", onTierAdded);
    socket.on("tier:updated", onTierUpdated);
    socket.on("tier:removed", onTierRemoved);

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
      socket.off("tier:added", onTierAdded);
      socket.off("tier:updated", onTierUpdated);
      socket.off("tier:removed", onTierRemoved);
    };
  }, [
    socket,
    boardId,
    upsertItem,
    removeItemLocal,
    addImage,
    addToast,
    user?.id,
    setCursor,
    removeCursor,
    upsertTier,
    removeTierLocal,
  ]);

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

  async function handleExport() {
    const node = boardCanvasRef.current;
    if (!node || exporting) return;

    setExporting(true);
    // Temporarily un-clip the scroll container so the export captures every
    // tier row, not just whatever currently fits in the viewport.
    const prevHeight = node.style.height;
    const prevOverflow = node.style.overflowY;
    node.style.height = `${node.scrollHeight}px`;
    node.style.overflowY = "visible";

    try {
      const dataUrl = await toPng(node, {
        backgroundColor: "#05060a",
        pixelRatio: 2,
        filter: (el) => !(el instanceof HTMLElement && "exportIgnore" in el.dataset),
      });
      const link = document.createElement("a");
      link.download = `${board?.name ?? "tiermaker"}.png`;
      link.href = dataUrl;
      link.click();
    } finally {
      node.style.height = prevHeight;
      node.style.overflowY = prevOverflow;
      setExporting(false);
    }
  }

  return (
    <div className="flex h-screen flex-col">
      <Navbar />
      <div className="glass flex items-center justify-between px-4 py-2">
        <h1 className="font-mono text-sm text-neon-muted">{board?.name ?? "Loading…"}</h1>
        <div className="flex items-center gap-3">
          <PresenceBar users={presence} />
          <Button variant="secondary" onClick={handleExport} disabled={exporting} className="py-1.5">
            {exporting ? "Exporting…" : "Export PNG"}
          </Button>
        </div>
      </div>
      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragCancel={() => setActiveDragImage(undefined)}>
        <div className="flex flex-1 overflow-hidden">
          <BoardCanvas exportRef={boardCanvasRef} />
          <LibrarySidebar />
        </div>
        <DragOverlay>
          <DragPreview image={activeDragImage} />
        </DragOverlay>
      </DndContext>
      <ToastStack />
    </div>
  );
}
