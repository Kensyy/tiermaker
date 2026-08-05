import { eq, isNull } from "drizzle-orm";
import type { ImageAsset } from "@tiermaker/shared";
import { db } from "../db/client.js";
import { images } from "../db/schema.js";

type ImageRow = typeof images.$inferSelect;

export function toImageAsset(row: ImageRow): ImageAsset {
  return {
    id: row.id,
    folderId: row.folderId,
    filename: row.filename,
    originalName: row.originalName,
    mimeType: row.mimeType,
    sizeBytes: row.sizeBytes,
    uploadedBy: row.uploadedBy,
    createdAt: row.createdAt,
    url: `/uploads/${row.filename}`,
  };
}

export async function listImages(folderId: number | null): Promise<ImageAsset[]> {
  const rows =
    folderId === null
      ? await db.select().from(images).where(isNull(images.folderId))
      : await db.select().from(images).where(eq(images.folderId, folderId));
  return rows.map(toImageAsset);
}

export async function createImage(input: {
  folderId: number | null;
  filename: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  uploadedBy: number;
}): Promise<ImageAsset> {
  const [row] = await db
    .insert(images)
    .values({ ...input, createdAt: Date.now() })
    .returning();
  return toImageAsset(row);
}
