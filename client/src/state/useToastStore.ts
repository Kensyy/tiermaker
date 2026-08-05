import { create } from "zustand";

export interface Toast {
  id: number;
  message: string;
  color: string;
}

interface ToastState {
  toasts: Toast[];
  addToast: (message: string, color?: string) => void;
  removeToast: (id: number) => void;
}

let nextId = 1;
const TOAST_DURATION_MS = 4000;

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],

  addToast: (message, color = "#4cf3ff") => {
    const id = nextId++;
    set((state) => ({ toasts: [...state.toasts, { id, message, color }] }));
    setTimeout(() => get().removeToast(id), TOAST_DURATION_MS);
  },

  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
