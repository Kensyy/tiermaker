import { useEffect, useRef, type RefObject } from "react";
import { useBoardStore } from "../../state/useBoardStore";
import { useSocket } from "../../context/SocketContext";
import { throttle } from "../../lib/throttle";
import { TierRow } from "./TierRow";
import { CursorsOverlay } from "./CursorsOverlay";

interface BoardCanvasProps {
  /** Exposes the board's root node so BoardPage can export it as an image. */
  exportRef: RefObject<HTMLDivElement>;
}

export function BoardCanvas({ exportRef }: BoardCanvasProps) {
  const socket = useSocket();
  const boardId = useBoardStore((state) => state.boardId);
  const tiers = useBoardStore((state) => state.tiers);
  const containerRef = exportRef;

  // The throttled callback is only created once, so it must read the socket
  // through a ref rather than closing over it directly — otherwise it would
  // keep emitting on a stale (possibly null) socket from the first render.
  const socketRef = useRef(socket);
  useEffect(() => {
    socketRef.current = socket;
  }, [socket]);

  const sendCursor = useRef(
    throttle((boardId: number, x: number, y: number) => {
      socketRef.current?.emit("cursor:move", { boardId, x, y });
    }, 50),
  ).current;

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!boardId || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    sendCursor(boardId, e.clientX - rect.left, e.clientY - rect.top);
  }

  return (
    <div ref={containerRef} className="relative flex-1 overflow-y-auto" onPointerMove={handlePointerMove}>
      <div className="flex flex-col">
        {tiers.map((tier) => (
          <TierRow
            key={tier.id}
            tier={tier}
            onRemoveItem={(itemId) => {
              if (boardId) socket?.emit("item:remove", { boardId, itemId });
            }}
          />
        ))}
      </div>
      <CursorsOverlay />
    </div>
  );
}
