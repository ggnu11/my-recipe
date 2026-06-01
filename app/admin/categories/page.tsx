"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { translateToJa } from "@/lib/translate";
import type { Category } from "@/lib/types";

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

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<CategoryForm>({
    name: "", name_ja: "", slug: "", description: "", description_ja: "",
    image_url: "", color: "", bg_color: "",
  });
  const [saving, setSaving] = useState(false);
  const [translating, setTranslating] = useState(false);

  const supabase = createClient();

  const fetchCategories = async () => {
    const { data } = await supabase.from("categories").select("*").order("sort_order");
    setCategories(data ?? []);
  };

  useEffect(() => {
    fetchCategories();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const startEdit = (cat: Category) => {
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

  const cancelEdit = () => setEditing(null);

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
    fetchCategories();
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
    fetchCategories();
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

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1
          className="text-2xl font-bold"
          style={{ color: "#333", fontFamily: "var(--font-serif), serif" }}
        >
          카테고리
        </h1>
        <a
          href="/"
          target="_blank"
          className="rounded-lg border border-gray-200 px-4 py-2 text-xs text-gray-600 transition-colors hover:bg-gray-50"
        >
          미리보기 ↗
        </a>
      </div>

      <div className="space-y-4 overflow-y-auto" style={{ maxHeight: "calc(100vh - 220px)" }}>
        {categories.map((cat) => (
          <div key={cat.id} className="rounded-xl bg-white p-5 shadow-sm">
            {editing === cat.id ? (
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
                      슬러그 (URL 경로)
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
                    onClick={() => saveEdit(cat.id)}
                    disabled={saving}
                    className="rounded-lg px-4 py-2 text-xs font-medium text-white"
                    style={{ backgroundColor: "#333" }}
                  >
                    {saving ? "..." : "저장"}
                  </button>
                </div>
              </div>
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
                  <div className="font-medium text-gray-900">{cat.name}</div>
                  <div className="text-xs text-gray-400">
                    /{cat.slug} · {cat.description || "(설명 없음)"}
                  </div>
                </div>
                <code className="rounded bg-gray-50 px-2 py-0.5 text-xs text-gray-500">
                  {cat.color}
                </code>
                <div className="flex gap-1">
                  <button
                    onClick={() => moveCategory(categories.indexOf(cat), -1)}
                    disabled={categories.indexOf(cat) === 0}
                    className="rounded border border-gray-200 px-2 py-1 text-xs text-gray-500 transition-colors hover:bg-gray-50 disabled:opacity-30"
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => moveCategory(categories.indexOf(cat), 1)}
                    disabled={categories.indexOf(cat) === categories.length - 1}
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
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
