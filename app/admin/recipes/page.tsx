"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import type { Category, Recipe } from "@/lib/types";

export default function AdminRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filter, setFilter] = useState("all");

  const supabase = createClient();

  useEffect(() => {
    Promise.all([
      supabase.from("recipes").select("*").order("sort_order"),
      supabase.from("categories").select("*").order("slug"),
    ]).then(([recRes, catRes]) => {
      setRecipes(recRes.data ?? []);
      setCategories(catRes.data ?? []);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" 레시피를 삭제하시겠습니까?`)) return;
    await supabase.from("steps").delete().eq("recipe_id", id);
    await supabase.from("ingredients").delete().eq("recipe_id", id);
    await supabase.from("recipes").delete().eq("id", id);
    setRecipes((prev) => prev.filter((r) => r.id !== id));
  };

  const togglePublish = async (id: string, published: boolean) => {
    await supabase.from("recipes").update({ published: !published }).eq("id", id);
    setRecipes((prev) =>
      prev.map((r) => (r.id === id ? { ...r, published: !published } : r))
    );
  };

  const filtered = filter === "all" ? recipes : recipes.filter((r) => r.category_id === filter);
  const catName = (id: string) => categories.find((c) => c.id === id)?.name ?? "";

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1
          className="text-2xl font-bold"
          style={{ color: "#333", fontFamily: "var(--font-serif), serif" }}
        >
          레시피
        </h1>
        <a
          href="/admin/recipes/new"
          className="rounded-lg px-4 py-2 text-sm font-semibold text-white"
          style={{ backgroundColor: "#c8a96e" }}
        >
          + 새 레시피
        </a>
      </div>

      {/* Filter */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`rounded-full px-3 py-1 text-xs font-medium ${filter === "all" ? "bg-[#c8a96e] text-white" : "bg-white text-gray-500"}`}
        >
          전체 ({recipes.length})
        </button>
        {categories.map((cat) => {
          const count = recipes.filter((r) => r.category_id === cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              className={`rounded-full px-3 py-1 text-xs font-medium ${filter === cat.id ? "text-white" : "bg-white text-gray-500"}`}
              style={filter === cat.id ? { backgroundColor: cat.color } : undefined}
            >
              {cat.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-xs text-gray-400">
              <th className="px-5 py-3 font-medium">이모지</th>
              <th className="px-5 py-3 font-medium">이름</th>
              <th className="px-5 py-3 font-medium">카테고리</th>
              <th className="px-5 py-3 font-medium">난이도</th>
              <th className="px-5 py-3 font-medium">상태</th>
              <th className="px-5 py-3 font-medium text-right">관리</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((recipe) => (
              <tr key={recipe.id} className="border-b border-gray-50">
                <td className="px-5 py-3 text-lg">{recipe.emoji ?? "🍽️"}</td>
                <td className="px-5 py-3">
                  <div className="font-medium text-gray-900">{recipe.name}</div>
                  {recipe.subtitle && (
                    <div className="text-xs text-gray-400">{recipe.subtitle}</div>
                  )}
                </td>
                <td className="px-5 py-3 text-gray-500">{catName(recipe.category_id)}</td>
                <td className="px-5 py-3 text-gray-500">{recipe.difficulty ?? "-"}</td>
                <td className="px-5 py-3">
                  <button
                    onClick={() => togglePublish(recipe.id, recipe.published)}
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${recipe.published ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400"}`}
                  >
                    {recipe.published ? "공개" : "비공개"}
                  </button>
                </td>
                <td className="px-5 py-3 text-right">
                  <a
                    href={`/admin/recipes/${recipe.id}/edit`}
                    className="mr-2 rounded border border-gray-200 px-3 py-1 text-xs text-gray-600 transition-colors hover:bg-gray-50"
                  >
                    수정
                  </a>
                  <button
                    onClick={() => handleDelete(recipe.id, recipe.name)}
                    className="rounded border border-red-200 px-3 py-1 text-xs text-red-500 transition-colors hover:bg-red-50"
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-gray-400">
                  레시피가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
