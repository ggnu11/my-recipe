import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import type { Category, Recipe, Ingredient, Step } from "@/lib/types";

interface DataState {
  categories: Category[];
  recipes: Recipe[];
  ingredients: Ingredient[];
  steps: Step[];
  loaded: boolean;
  fetchAll: () => Promise<void>;
}

export const useDataStore = create<DataState>((set) => ({
  categories: [],
  recipes: [],
  ingredients: [],
  steps: [],
  loaded: false,

  fetchAll: async () => {
    const [catRes, recRes, ingRes, stepRes] = await Promise.all([
      supabase.from("categories").select("*").order("sort_order"),
      supabase.from("recipes").select("*").order("sort_order"),
      supabase.from("ingredients").select("*").order("sort_order"),
      supabase.from("steps").select("*").order("step_number"),
    ]);

    set({
      categories: catRes.data ?? [],
      recipes: recRes.data ?? [],
      ingredients: ingRes.data ?? [],
      steps: stepRes.data ?? [],
      loaded: true,
    });
  },
}));
