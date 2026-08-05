export interface User {
  id: number;
  displayName: string;
  createdAt: number;
}

export interface Board {
  id: number;
  name: string;
  createdBy: number | null;
  createdAt: number;
  updatedAt: number;
}

export interface Tier {
  id: number;
  boardId: number;
  label: string;
  color: string;
  position: number;
}

export interface Folder {
  id: number;
  name: string;
  parentId: number | null;
  createdAt: number;
}

/** Folder shape as returned by GET /api/folders — a nested tree, not a flat list. */
export interface FolderNode extends Folder {
  children: FolderNode[];
}

export interface ImageAsset {
  id: number;
  folderId: number | null;
  filename: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  uploadedBy: number | null;
  createdAt: number;
  /** Public URL path the client can use directly, e.g. /uploads/<filename> */
  url: string;
}

export interface TierItem {
  id: number;
  boardId: number;
  tierId: number;
  imageId: number;
  position: number;
  placedBy: number | null;
  updatedAt: number;
}

/** Full payload returned by GET /api/boards/:id to hydrate the board view. */
export interface BoardHydration {
  board: Board;
  tiers: Tier[];
  tierItems: TierItem[];
  images: ImageAsset[];
}

export interface CursorPosition {
  userId: number;
  displayName: string;
  color: string;
  x: number;
  y: number;
}

export interface PresenceUser {
  userId: number;
  displayName: string;
  color: string;
}
