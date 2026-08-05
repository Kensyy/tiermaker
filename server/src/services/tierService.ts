import { eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { tiers } from "../db/schema.js";
import { appendPosition } from "./position.js";

export async function createTier(boardId: number, label: string, color: string) {
  const boardTiers = await db.select().from(tiers).where(eq(tiers.boardId, boardId)).orderBy(tiers.position);
  const position = appendPosition(boardTiers.at(-1)?.position);

  const [tier] = await db.insert(tiers).values({ boardId, label, color, position }).returning();
  return tier;
}

export async function updateTier(id: number, input: { label?: string; color?: string }) {
  const [tier] = await db.update(tiers).set(input).where(eq(tiers.id, id)).returning();
  return tier ?? null;
}

export async function deleteTier(id: number) {
  const [tier] = await db.delete(tiers).where(eq(tiers.id, id)).returning();
  return tier ?? null;
}
