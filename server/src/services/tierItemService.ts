import { and, eq, ne } from "drizzle-orm";
import { db } from "../db/client.js";
import { tierItems } from "../db/schema.js";
import { appendPosition, betweenPosition, reindex } from "./position.js";

type TierItemRow = typeof tierItems.$inferSelect;

/**
 * Resolves the DB `position` value for dropping an item at `index` within
 * `tierId`'s ordered list (excluding `excludeItemId`, the item being moved,
 * so it doesn't collide with itself). Reindexes the tier first if neighbor
 * positions have collapsed too close together to interpolate between.
 */
async function resolvePosition(tierId: number, index: number, excludeItemId?: number): Promise<number> {
  const siblings = await db
    .select()
    .from(tierItems)
    .where(
      excludeItemId
        ? and(eq(tierItems.tierId, tierId), ne(tierItems.id, excludeItemId))
        : eq(tierItems.tierId, tierId),
    )
    .orderBy(tierItems.position);

  const before = siblings[index - 1]?.position;
  const after = siblings[index]?.position;

  const position = index === siblings.length ? appendPosition(siblings.at(-1)?.position) : betweenPosition(before, after);

  if (position !== null) return position;

  const reindexed = reindex(siblings.map((s) => s.id));
  await db.transaction(async (tx) => {
    for (const row of reindexed) {
      await tx.update(tierItems).set({ position: row.position }).where(eq(tierItems.id, row.id));
    }
  });

  const newBefore = reindexed[index - 1]?.position;
  const newAfter = reindexed[index]?.position;
  return index === reindexed.length ? appendPosition(reindexed.at(-1)?.position) : betweenPosition(newBefore, newAfter)!;
}

export async function placeItem(input: {
  boardId: number;
  tierId: number;
  imageId: number;
  index: number;
  placedBy: number;
}): Promise<TierItemRow> {
  const position = await resolvePosition(input.tierId, input.index);
  const [row] = await db
    .insert(tierItems)
    .values({
      boardId: input.boardId,
      tierId: input.tierId,
      imageId: input.imageId,
      position,
      placedBy: input.placedBy,
      updatedAt: Date.now(),
    })
    .returning();
  return row;
}

export async function moveItem(input: {
  itemId: number;
  toTierId: number;
  index: number;
  placedBy: number;
}): Promise<TierItemRow | null> {
  const position = await resolvePosition(input.toTierId, input.index, input.itemId);
  const [row] = await db
    .update(tierItems)
    .set({ tierId: input.toTierId, position, placedBy: input.placedBy, updatedAt: Date.now() })
    .where(eq(tierItems.id, input.itemId))
    .returning();
  return row ?? null;
}

export async function removeItem(itemId: number): Promise<void> {
  await db.delete(tierItems).where(eq(tierItems.id, itemId));
}
