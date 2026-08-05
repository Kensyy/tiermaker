import { useBoardStore } from "../../state/useBoardStore";
import { useSocket } from "../../context/SocketContext";
import { TierRow } from "./TierRow";

export function BoardCanvas() {
  const socket = useSocket();
  const boardId = useBoardStore((state) => state.boardId);
  const tiers = useBoardStore((state) => state.tiers);

  return (
    <div className="relative flex-1 overflow-y-auto">
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
    </div>
  );
}
