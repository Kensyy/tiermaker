import { useDraggable, useDroppable } from "@dnd-kit/core";
import type { ImageAsset, TierItem } from "@tiermaker/shared";

interface TierItemCardProps {
  item: TierItem;
  image: ImageAsset | undefined;
  onRemove: (itemId: number) => void;
}

export function TierItemCard({ item, image, onRemove }: TierItemCardProps) {
  const draggable = useDraggable({ id: `item-${item.id}`, data: { kind: "item", item } });
  const droppable = useDroppable({ id: `item-${item.id}`, data: { kind: "item", item } });

  return (
    <div
      ref={(node) => {
        draggable.setNodeRef(node);
        droppable.setNodeRef(node);
      }}
      className={`group relative h-20 w-20 shrink-0 touch-none rounded-md border ${
        droppable.isOver ? "border-indigo-400" : "border-slate-700"
      } bg-slate-900 ${draggable.isDragging ? "opacity-30" : ""}`}
      {...draggable.listeners}
      {...draggable.attributes}
    >
      {image && (
        <img
          src={image.url}
          alt={image.originalName}
          className="h-full w-full rounded-md object-cover"
          draggable={false}
        />
      )}
      <button
        type="button"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          onRemove(item.id);
        }}
        className="absolute -right-2 -top-2 hidden h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs text-white group-hover:flex"
        aria-label="Remove from tier"
      >
        ×
      </button>
    </div>
  );
}
