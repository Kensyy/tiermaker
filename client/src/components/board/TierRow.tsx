import { useMemo, useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import type { Tier } from "@tiermaker/shared";
import { useBoardStore } from "../../state/useBoardStore";
import { api } from "../../lib/api";
import { TIER_COLOR_PRESETS } from "../../lib/tierColors";
import { TierItemCard } from "./TierItemCard";

interface TierRowProps {
  tier: Tier;
  onRemoveItem: (itemId: number) => void;
}

export function TierRow({ tier, onRemoveItem }: TierRowProps) {
  const itemsById = useBoardStore((state) => state.itemsById);
  const imagesById = useBoardStore((state) => state.imagesById);
  const upsertTier = useBoardStore((state) => state.upsertTier);
  const removeTier = useBoardStore((state) => state.removeTier);
  const items = useMemo(
    () =>
      Object.values(itemsById)
        .filter((item) => item.tierId === tier.id)
        .sort((a, b) => a.position - b.position),
    [itemsById, tier.id],
  );
  const droppable = useDroppable({ id: `tier-${tier.id}`, data: { kind: "tier", tierId: tier.id } });

  const [editing, setEditing] = useState(false);
  const [labelDraft, setLabelDraft] = useState(tier.label);

  async function commitLabel() {
    const trimmed = labelDraft.trim();
    if (trimmed && trimmed !== tier.label) {
      const updated = await api.patch<Tier>(`/tiers/${tier.id}`, { label: trimmed });
      upsertTier(updated);
    } else {
      setLabelDraft(tier.label);
    }
    setEditing(false);
  }

  async function setColor(color: string) {
    const updated = await api.patch<Tier>(`/tiers/${tier.id}`, { color });
    upsertTier(updated);
  }

  async function handleDeleteTier() {
    if (!window.confirm(`Delete tier "${tier.label}"? Any items placed in it will be removed too.`)) return;
    await api.del(`/tiers/${tier.id}`);
    removeTier(tier.id);
  }

  return (
    <div className="flex border-b border-neon-line">
      <div
        className={`flex shrink-0 flex-col items-center justify-center gap-1.5 bg-neon-glass p-1.5 ${
          editing ? "w-28" : "w-14"
        }`}
      >
        {editing ? (
          <input
            autoFocus
            value={labelDraft}
            onChange={(e) => setLabelDraft(e.target.value)}
            onBlur={commitLabel}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitLabel();
              if (e.key === "Escape") {
                setLabelDraft(tier.label);
                setEditing(false);
              }
            }}
            maxLength={12}
            className="w-full rounded border border-neon-line bg-neon-bg px-1 py-0.5 text-center font-mono text-xs text-neon-text focus:border-neon-cyan focus:outline-none"
          />
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="font-mono text-lg"
            style={{ color: tier.color, textShadow: `0 0 12px ${tier.color}99` }}
            title="Click to rename"
          >
            {tier.label}
          </button>
        )}
        {editing && (
          <>
            <div className="flex flex-wrap justify-center gap-1">
              {TIER_COLOR_PRESETS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setColor(color)}
                  className={`h-3.5 w-3.5 rounded-full ${color === tier.color ? "ring-1 ring-neon-text" : ""}`}
                  style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}80` }}
                  aria-label={`Set tier color to ${color}`}
                />
              ))}
            </div>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleDeleteTier}
              className="font-mono text-[10px] text-tier-s hover:text-tier-s/80"
            >
              delete tier
            </button>
          </>
        )}
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
