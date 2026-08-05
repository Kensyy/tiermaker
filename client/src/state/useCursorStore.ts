import { create } from "zustand";
import type { CursorPosition } from "@tiermaker/shared";

interface CursorState {
  cursorsByUserId: Record<number, CursorPosition>;
  setCursor: (cursor: CursorPosition) => void;
  removeCursor: (userId: number) => void;
  reset: () => void;
}

export const useCursorStore = create<CursorState>((set) => ({
  cursorsByUserId: {},

  setCursor: (cursor) =>
    set((state) => ({ cursorsByUserId: { ...state.cursorsByUserId, [cursor.userId]: cursor } })),

  removeCursor: (userId) =>
    set((state) => {
      const { [userId]: _removed, ...rest } = state.cursorsByUserId;
      return { cursorsByUserId: rest };
    }),

  reset: () => set({ cursorsByUserId: {} }),
}));
