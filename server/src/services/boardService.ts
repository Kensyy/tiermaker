import { eq, inArray } from "drizzle-orm";
import { db } from "../db/client.js";
import { boards, images, tierItems, tiers } from "../db/schema.js";
import type { BoardHydration } from "@tiermaker/shared";
import { toImageAsset } from "./imageService.js";

const DEFAULT_TIERS: { label: string; color: string }[] = [
  { label: "S", color: "#f87171" },
  { label: "A", color: "#fb923c" },
  { label: "B", color: "#facc15" },
  { label: "C", color: "#4ade80" },
  { label: "D", color: "#60a5fa" },
  { label: "F", color: "#a78bfa" },
];

export async function listBoards() {
  return db.select().from(boards).orderBy(boards.updatedAt);
}

export async function createBoard(name: string, createdBy: number) {
  const now = Date.now();
  const [board] = await db
    .insert(boards)
    .values({ name, createdBy, createdAt: now, updatedAt: now })
    .returning();

  await db.insert(tiers).values(
    DEFAULT_TIERS.map((tier, index) => ({
      boardId: board.id,
      label: tier.label,
      color: tier.color,
      position: (index + 1) * 1000,
    })),
  );

  return board;
}

export async function getBoardHydration(boardId: number): Promise<BoardHydration | null> {
  const [board] = await db.select().from(boards).where(eq(boards.id, boardId));
  if (!board) return null;

  const boardTiers = await db
    .select()
    .from(tiers)
    .where(eq(tiers.boardId, boardId))
    .orderBy(tiers.position);

  const items = await db.select().from(tierItems).where(eq(tierItems.boardId, boardId));

  const imageIds = [...new Set(items.map((item) => item.imageId))];
  const boardImages = imageIds.length
    ? await db.select().from(images).where(inArray(images.id, imageIds))
    : [];

  return {
    board,
    tiers: boardTiers,
    tierItems: items,
    images: boardImages.map(toImageAsset),
  };
}
