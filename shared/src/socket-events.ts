import type { CursorPosition, PresenceUser, Tier, TierItem } from "./types.js";

export interface ItemPlacePayload {
  boardId: number;
  tierId: number;
  imageId: number;
  /** 0-based index within the target tier's ordered items where this is dropped. */
  index: number;
}

export interface ItemMovePayload {
  boardId: number;
  itemId: number;
  toTierId: number;
  /** 0-based index within the target tier's ordered items where this is dropped. */
  index: number;
}

export interface ItemRemovePayload {
  boardId: number;
  itemId: number;
}

export interface CursorMovePayload {
  boardId: number;
  x: number;
  y: number;
}

export interface ServerToClientEvents {
  "presence:update": (users: PresenceUser[]) => void;
  "user:joined": (user: PresenceUser) => void;
  "user:left": (user: PresenceUser) => void;
  "item:placed": (item: TierItem) => void;
  "item:moved": (item: TierItem) => void;
  "item:removed": (payload: { itemId: number }) => void;
  "tier:updated": (tier: Tier) => void;
  "cursor:moved": (cursor: CursorPosition) => void;
  "cursor:left": (payload: { userId: number }) => void;
  "error": (payload: { message: string }) => void;
}

export interface ClientToServerEvents {
  "board:join": (payload: { boardId: number }) => void;
  "board:leave": (payload: { boardId: number }) => void;
  "item:place": (payload: ItemPlacePayload) => void;
  "item:move": (payload: ItemMovePayload) => void;
  "item:remove": (payload: ItemRemovePayload) => void;
  "cursor:move": (payload: CursorMovePayload) => void;
}
