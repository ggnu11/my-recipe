import { create } from "zustand";

interface TransitionStore {
  direction: "down" | "up" | null;
  setDirection: (d: "down" | "up") => void;
  clearTransition: () => void;
}

export const useTransitionStore = create<TransitionStore>((set) => ({
  direction: null,
  setDirection: (direction) => set({ direction }),
  clearTransition: () => set({ direction: null }),
}));
