"use client";

import { use } from "react";
import { RecipeForm } from "@/components/admin/RecipeForm";

export default function EditRecipe({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <RecipeForm recipeId={id} />;
}
