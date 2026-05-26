import { create } from "zustand";

interface ShowcaseState {
  selectedMenuIndex: number;
  viewState: 1 | 2;
  isAnimating: boolean;
  selectedRecipeId: string | null;
  setSelectedMenuIndex: (index: number) => void;
  setViewState: (state: 1 | 2) => void;
  setIsAnimating: (animating: boolean) => void;
  setSelectedRecipeId: (id: string | null) => void;
}

export const useShowcaseStore = create<ShowcaseState>((set) => ({
  selectedMenuIndex: 0,
  viewState: 1,
  isAnimating: false,
  selectedRecipeId: null,
  setSelectedMenuIndex: (index) => set({ selectedMenuIndex: index }),
  setViewState: (viewState) => set({ viewState }),
  setIsAnimating: (isAnimating) => set({ isAnimating }),
  setSelectedRecipeId: (selectedRecipeId) => set({ selectedRecipeId }),
}));
