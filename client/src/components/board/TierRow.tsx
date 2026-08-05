import { useMemo } from "react";
import { useDroppable } from "@dnd-kit/core";
import type { Tier } from "@tiermaker/shared";
import { useBoardStore } from "../../state/useBoardStore";
import { TierItemCard } from "./TierItemCard";

interface TierRowProps {
  tier: Tier;
  onRemoveItem: (itemId: number) => void;
}

export function TierRow({ tier, onRemoveItem }: TierRowProps) {
  const itemsById = useBoardStore((state) => state.itemsById);
  const imagesById = useBoardStore((state) => state.imagesById);
  const items = useMemo(
    () =>
      Object.values(itemsById)
        .filter((item) => item.tierId === tier.id)
        .sort((a, b) => a.position - b.position),
    [itemsById, tier.id],
  );
  const droppable = useDroppable({ id: `tier-${tier.id}`, data: { kind: "tier", tierId: tier.id } });

  return (
    <div className="flex border-b border-neon-line">
      <div
        className="flex w-14 shrink-0 items-center justify-center bg-neon-glass font-mono text-lg"
        style={{ color: tier.color, textShadow: `0 0 12px ${tier.color}99` }}
      >
        {tier.label}
      </div>
      <div
        ref={droppable.setNodeRef}
        className={`flex min-h-24 flex-1 flex-wrap items-center gap-2 p-2 transition-colors ${
          droppable.isOver ? "bg-neon-cyan/[0.06] shadow-[0_0_20px_rgba(76,243,255,0.08)_inset]" : ""
        }`}
      >
        {items.map((item) => (
          <TierItemCard key={item.id} item={item} image={imagesById[item.imageId]} onRemove={onRemoveItem} />
        ))}
      </div>
    </div>
  );
}
