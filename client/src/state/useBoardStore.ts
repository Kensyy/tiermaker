import { create } from "zustand";
import type { BoardHydration, ImageAsset, Tier, TierItem } from "@tiermaker/shared";

interface BoardState {
  boardId: number | null;
  board: BoardHydration["board"] | null;
  tiers: Tier[];
  itemsById: Record<number, TierItem>;
  imagesById: Record<number, ImageAsset>;
  hydrate: (data: BoardHydration) => void;
  reset: () => void;
  upsertItem: (item: TierItem) => void;
  removeItem: (itemId: number) => void;
  addImage: (image: ImageAsset) => void;
  itemsForTier: (tierId: number) => TierItem[];
}

export const useBoardStore = create<BoardState>((set, get) => ({
  boardId: null,
  board: null,
  tiers: [],
  itemsById: {},
  imagesById: {},

  hydrate: (data) =>
    set({
      boardId: data.board.id,
      board: data.board,
      tiers: [...data.tiers].sort((a, b) => a.position - b.position),
      itemsById: Object.fromEntries(data.tierItems.map((item) => [item.id, item])),
      imagesById: Object.fromEntries(data.images.map((image) => [image.id, image])),
    }),

  reset: () => set({ boardId: null, board: null, tiers: [], itemsById: {}, imagesById: {} }),

  upsertItem: (item) => set((state) => ({ itemsById: { ...state.itemsById, [item.id]: item } })),

  removeItem: (itemId) =>
    set((state) => {
      const { [itemId]: _removed, ...rest } = state.itemsById;
      return { itemsById: rest };
    }),

  addImage: (image) => set((state) => ({ imagesById: { ...state.imagesById, [image.id]: image } })),

  itemsForTier: (tierId) =>
    Object.values(get().itemsById)
      .filter((item) => item.tierId === tierId)
      .sort((a, b) => a.position - b.position),
}));
