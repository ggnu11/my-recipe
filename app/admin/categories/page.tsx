"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { translateToJa } from "@/lib/translate";
import type { Category, Recipe } from "@/lib/types";

type CategoryForm = {
  name: string;
  name_ja: string;
  slug: string;
  description: string;
  description_ja: string;
  image_url: string;
  color: string;
  bg_color: string;
};

const emptyForm: CategoryForm = {
  name: "", name_ja: "", slug: "", description: "", description_ja: "",
  image_url: "", color: "#333333", bg_color: "#f5f5f5",
};

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<CategoryForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ cat: Category; recipes: Recipe[] } | null>(null);

  const supabase = createClient();

  const fetchData = async () => {
    const [catRes, recRes] = await Promise.all([
      supabase.from("categories").select("*").order("sort_order"),
      supabase.from("recipes").select("*").order("sort_order"),
    ]);
    setCategories(catRes.data ?? []);
    setRecipes(recRes.data ?? []);
  };

  useEffect(() => {
    fetchData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const startEdit = (cat: Category) => {
    setCreating(false);
    setEditing(cat.id);
    setForm({
      name: cat.name,
      name_ja: cat.name_ja ?? "",
      slug: cat.slug,
      description: cat.description ?? "",
      description_ja: cat.description_ja ?? "",
      image_url: cat.image_url ?? "",
      color: cat.color,
      bg_color: cat.bg_color,
    });
  };

  const startCreate = () => {
    setEditing(null);
    setCreating(true);
    setForm({ ...emptyForm });
  };

  const cancelEdit = () => {
    setEditing(null);
    setCreating(false);
  };

  const saveEdit = async (id: string) => {
    setSaving(true);
    await supabase.from("categories").update({
      name: form.name,
      name_ja: form.name_ja || null,
      slug: form.slug,
      description: form.description || null,
      description_ja: form.description_ja || null,
      image_url: form.image_url || null,
      color: form.color,
      bg_color: form.bg_color,
    }).eq("id", id);
    setSaving(false);
    setEditing(null);
    fetchData();
  };

  const saveCreate = async () => {
    if (!form.name || !form.slug) {
      alert("이름과 슬러그는 필수입니다.");
      return;
    }
    setSaving(true);
    const maxOrder = categories.length > 0
      ? Math.max(...categories.map((c) => c.sort_order))
      : -1;
    await supabase.from("categories").insert({
      name: form.name,
      name_ja: form.name_ja || null,
      slug: form.slug,
      description: form.description || null,
      description_ja: form.description_ja || null,
      image_url: form.image_url || null,
      color: form.color,
      bg_color: form.bg_color,
      sort_order: maxOrder + 1,
    });
    setSaving(false);
    setCreating(false);
    fetchData();
  };

  const handleDeleteClick = (cat: Category) => {
    const linkedRecipes = recipes.filter((r) => r.category_id === cat.id);
    if (linkedRecipes.length > 0) {
      setDeleteModal({ cat, recipes: linkedRecipes });
    } else {
      if (confirm(`"${cat.name}" 카테고리를 삭제하시겠습니까?`)) {
        deleteCategory(cat.id);
      }
    }
  };

  const deleteCategory = async (id: string) => {
    await supabase.from("categories").delete().eq("id", id);
    setDeleteModal(null);
    fetchData();
  };

  const deleteRecipeAndRefresh = async (recipeId: string) => {
    await supabase.from("steps").delete().eq("recipe_id", recipeId);
    await supabase.from("ingredients").delete().eq("recipe_id", recipeId);
    await supabase.from("recipes").delete().eq("id", recipeId);
    const updated = await supabase.from("recipes").select("*").order("sort_order");
    setRecipes(updated.data ?? []);
    if (deleteModal) {
      const remaining = (updated.data ?? []).filter((r) => r.category_id === deleteModal.cat.id);
      if (remaining.length === 0) {
        setDeleteModal(null);
      } else {
        setDeleteModal({ ...deleteModal, recipes: remaining });
      }
    }
  };

  const moveCategory = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= categories.length) return;
    const a = categories[index];
    const b = categories[target];
    await Promise.all([
      supabase.from("categories").update({ sort_order: b.sort_order }).eq("id", a.id),
      supabase.from("categories").update({ sort_order: a.sort_order }).eq("id", b.id),
    ]);
    fetchData();
  };

  const handleTranslate = async () => {
    setTranslating(true);
    try {
      const results = await translateToJa([form.name, form.description]);
      setForm((prev) => ({
        ...prev,
        name_ja: results[0] || prev.name_ja,
        description_ja: results[1] || prev.description_ja,
      }));
    } catch {
      alert("번역에 실패했습니다.");
    }
    setTranslating(false);
  };

  const recipesInCategory = (catId: string) =>
    recipes.filter((r) => r.category_id === catId).length;

  const formFields = (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">
            이름 (한국어) <span className="text-red-400">*</span>
          </label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#333]"
            placeholder="예: 한식"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">
            이름 (일본어)
          </label>
          <input
            value={form.name_ja}
            onChange={(e) => setForm({ ...form, name_ja: e.target.value })}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#333]"
            placeholder="예: 韓国料理"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">
            슬러그 (URL 경로) <span className="text-red-400">*</span>
          </label>
          <input
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#333]"
            placeholder="예: korean (영문 소문자)"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">
            대표 이미지
          </label>
          <ImageUpload
            value={form.image_url || null}
            onChange={(url) => setForm({ ...form, image_url: url ?? "" })}
            folder="categories"
            size={64}
            hint="260x260px (정사각형)"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">
            설명 (한국어)
          </label>
          <input
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#333]"
            placeholder="예: 대대로 전해 내려오는 전통의 맛"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">
            설명 (일본어)
          </label>
          <input
            value={form.description_ja}
            onChange={(e) => setForm({ ...form, description_ja: e.target.value })}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#333]"
            placeholder="예: 代々受け継がれてきた伝統の味"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">
            강조색 (HEX)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={form.color}
              onChange={(e) => setForm({ ...form, color: e.target.value })}
              className="h-9 w-9 cursor-pointer rounded border-0"
            />
            <input
              value={form.color}
              onChange={(e) => setForm({ ...form, color: e.target.value })}
              className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#333]"
              placeholder="예: #e07070"
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">
            배경색 (HEX)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={form.bg_color}
              onChange={(e) => setForm({ ...form, bg_color: e.target.value })}
              className="h-9 w-9 cursor-pointer rounded border-0"
            />
            <input
              value={form.bg_color}
              onChange={(e) => setForm({ ...form, bg_color: e.target.value })}
              className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#333]"
              placeholder="예: #fde8e8"
            />
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <button
          onClick={handleTranslate}
          disabled={translating || saving}
          className="rounded-lg border border-[#333] px-4 py-2 text-xs font-medium text-[#333] transition-colors hover:bg-[#333]/10 disabled:opacity-50"
        >
          {translating ? "번역 중..." : "자동 번역 (JA)"}
        </button>
        <button
          onClick={cancelEdit}
          className="rounded-lg border border-gray-200 px-4 py-2 text-xs text-gray-500"
        >
          취소
        </button>
        <button
          onClick={() => creating ? saveCreate() : editing ? saveEdit(editing) : null}
          disabled={saving}
          className="rounded-lg px-4 py-2 text-xs font-medium text-white"
          style={{ backgroundColor: "#333" }}
        >
          {saving ? "..." : creating ? "추가" : "저장"}
        </button>
      </div>
    </div>
  );

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1
          className="text-2xl font-bold"
          style={{ color: "#333", fontFamily: "var(--font-serif), serif" }}
        >
          카테고리
        </h1>
        <div className="flex gap-2">
          <a
            href="/"
            target="_blank"
            className="rounded-lg border border-gray-200 px-4 py-2 text-xs text-gray-600 transition-colors hover:bg-gray-50"
          >
            미리보기
          </a>
          <button
            onClick={startCreate}
            className="rounded-lg px-4 py-2 text-xs font-medium text-white"
            style={{ backgroundColor: "#333" }}
          >
            + 새 카테고리
          </button>
        </div>
      </div>

      {/* Create form */}
      {creating && (
        <div className="mb-4 rounded-xl bg-white p-5 shadow-sm ring-2 ring-[#333]/20">
          <div className="mb-3 text-sm font-medium text-gray-700">새 카테고리 추가</div>
          {formFields}
        </div>
      )}

      <div className="space-y-4 overflow-y-auto" style={{ maxHeight: "calc(100vh - 220px)" }}>
        {categories.map((cat, idx) => (
          <div key={cat.id} className="rounded-xl bg-white p-5 shadow-sm">
            {editing === cat.id ? (
              formFields
            ) : (
              <div className="flex items-center gap-4">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full"
                  style={{ backgroundColor: cat.bg_color }}
                >
                  {cat.image_url ? (
                    <img src={cat.image_url} alt={cat.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-6 w-6 rounded-full" style={{ backgroundColor: cat.color }} />
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {cat.name}
                    <span className="ml-2 text-xs font-normal text-gray-400">
                      {recipesInCategory(cat.id)}개 레시피
                    </span>
                  </div>
                  <div className="text-xs text-gray-400">
                    /{cat.slug} · {cat.description || "(설명 없음)"}
                  </div>
                </div>
                <code className="rounded bg-gray-50 px-2 py-0.5 text-xs text-gray-500">
                  {cat.color}
                </code>
                <div className="flex gap-1">
                  <button
                    onClick={() => moveCategory(idx, -1)}
                    disabled={idx === 0}
                    className="rounded border border-gray-200 px-2 py-1 text-xs text-gray-500 transition-colors hover:bg-gray-50 disabled:opacity-30"
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => moveCategory(idx, 1)}
                    disabled={idx === categories.length - 1}
                    className="rounded border border-gray-200 px-2 py-1 text-xs text-gray-500 transition-colors hover:bg-gray-50 disabled:opacity-30"
                  >
                    ▼
                  </button>
                </div>
                <button
                  onClick={() => startEdit(cat)}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 transition-colors hover:bg-gray-50"
                >
                  수정
                </button>
                <button
                  onClick={() => handleDeleteClick(cat)}
                  className="rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-500 transition-colors hover:bg-red-50"
                >
                  삭제
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Delete modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="mb-1 text-lg font-bold text-gray-900">카테고리 삭제 불가</h3>
            <p className="mb-4 text-sm text-gray-500">
              &quot;{deleteModal.cat.name}&quot; 카테고리에 {deleteModal.recipes.length}개의 레시피가 등록되어 있습니다.
              레시피를 모두 삭제한 후 카테고리를 삭제할 수 있습니다.
            </p>
            <div className="mb-4 max-h-60 space-y-2 overflow-y-auto rounded-lg bg-gray-50 p-3">
              {deleteModal.recipes.map((r) => (
                <div key={r.id} className="flex items-center justify-between rounded-lg bg-white px-3 py-2 shadow-sm">
                  <div className="flex items-center gap-2">
                    {r.thumbnail_url ? (
                      <img src={r.thumbnail_url} alt={r.name} className="h-8 w-8 rounded object-cover" />
                    ) : (
                      <span className="flex h-8 w-8 items-center justify-center rounded bg-gray-100 text-sm">
                        {r.emoji ?? "🍽️"}
                      </span>
                    )}
                    <span className="text-sm text-gray-900">{r.name}</span>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm(`"${r.name}" 레시피를 삭제하시겠습니까?`)) {
                        deleteRecipeAndRefresh(r.id);
                      }
                    }}
                    className="rounded border border-red-200 px-2.5 py-1 text-xs text-red-500 hover:bg-red-50"
                  >
                    삭제
                  </button>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteModal(null)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-xs text-gray-500"
              >
                취소
              </button>
              {deleteModal.recipes.length === 0 && (
                <button
                  onClick={() => deleteCategory(deleteModal.cat.id)}
                  className="rounded-lg bg-red-500 px-4 py-2 text-xs font-medium text-white"
                >
                  카테고리 삭제
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
