import type { FolderNode } from "@tiermaker/shared";
import { db } from "../db/client.js";
import { folders } from "../db/schema.js";

export async function createFolder(name: string, parentId: number | null) {
  const [folder] = await db
    .insert(folders)
    .values({ name, parentId, createdAt: Date.now() })
    .returning();
  return folder;
}

export async function getFolderTree(): Promise<FolderNode[]> {
  const rows = await db.select().from(folders);

  const byId = new Map<number, FolderNode>(
    rows.map((row) => [row.id, { ...row, children: [] as FolderNode[] }]),
  );

  const roots: FolderNode[] = [];
  for (const row of rows) {
    const node = byId.get(row.id)!;
    if (row.parentId !== null && byId.has(row.parentId)) {
      byId.get(row.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}
