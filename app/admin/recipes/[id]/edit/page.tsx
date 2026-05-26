"use client";

import { use } from "react";

export default function EditRecipe({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1
        className="mb-4 text-2xl font-bold"
        style={{ color: "#c8a96e", fontFamily: "var(--font-serif), serif" }}
      >
        Edit Recipe
      </h1>
      <p className="text-white/50">Editing recipe {id}.</p>
    </div>
  );
}
