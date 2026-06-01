"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import type { Category } from "@/lib/types";

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", slug: "", color: "", bg_color: "" });
  const [saving, setSaving] = useState(false);

  const supabase = createClient();

  const fetchCategories = async () => {
    const { data } = await supabase.from("categories").select("*").order("slug");
    setCategories(data ?? []);
  };

  useEffect(() => {
    fetchCategories();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const startEdit = (cat: Category) => {
    setEditing(cat.id);
    setForm({ name: cat.name, slug: cat.slug, color: cat.color, bg_color: cat.bg_color });
  };

  const cancelEdit = () => {
    setEditing(null);
  };

  const saveEdit = async (id: string) => {
    setSaving(true);
    await supabase.from("categories").update(form).eq("id", id);
    setSaving(false);
    setEditing(null);
    fetchCategories();
  };

  return (
    <div>
      <h1
        className="mb-6 text-2xl font-bold"
        style={{ color: "#333", fontFamily: "var(--font-serif), serif" }}
      >
        카테고리
      </h1>

      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-xs text-gray-400">
              <th className="px-5 py-3 font-medium">색상</th>
              <th className="px-5 py-3 font-medium">이름</th>
              <th className="px-5 py-3 font-medium">슬러그</th>
              <th className="px-5 py-3 font-medium">강조색</th>
              <th className="px-5 py-3 font-medium">배경색</th>
              <th className="px-5 py-3 font-medium text-right">관리</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id} className="border-b border-gray-50">
                {editing === cat.id ? (
                  <>
                    <td className="px-5 py-3">
                      <input
                        type="color"
                        value={form.color}
                        onChange={(e) => setForm({ ...form, color: e.target.value })}
                        className="h-8 w-8 cursor-pointer rounded border-0"
                      />
                    </td>
                    <td className="px-5 py-3">
                      <input
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full rounded border border-gray-200 px-2 py-1 text-sm text-gray-900"
                      />
                    </td>
                    <td className="px-5 py-3">
                      <input
                        value={form.slug}
                        onChange={(e) => setForm({ ...form, slug: e.target.value })}
                        className="w-full rounded border border-gray-200 px-2 py-1 text-sm text-gray-900"
                      />
                    </td>
                    <td className="px-5 py-3">
                      <input
                        value={form.color}
                        onChange={(e) => setForm({ ...form, color: e.target.value })}
                        className="w-full rounded border border-gray-200 px-2 py-1 text-sm text-gray-900"
                      />
                    </td>
                    <td className="px-5 py-3">
                      <input
                        value={form.bg_color}
                        onChange={(e) => setForm({ ...form, bg_color: e.target.value })}
                        className="w-full rounded border border-gray-200 px-2 py-1 text-sm text-gray-900"
                      />
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => saveEdit(cat.id)}
                        disabled={saving}
                        className="mr-2 rounded bg-[#c8a96e] px-3 py-1 text-xs font-medium text-white"
                      >
                        {saving ? "..." : "저장"}
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="rounded border border-gray-200 px-3 py-1 text-xs text-gray-500"
                      >
                        취소
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-5 py-3">
                      <div
                        className="h-6 w-6 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                    </td>
                    <td className="px-5 py-3 font-medium text-gray-900">{cat.name}</td>
                    <td className="px-5 py-3 text-gray-500">{cat.slug}</td>
                    <td className="px-5 py-3">
                      <code className="rounded bg-gray-50 px-2 py-0.5 text-xs text-gray-600">
                        {cat.color}
                      </code>
                    </td>
                    <td className="px-5 py-3">
                      <code className="rounded bg-gray-50 px-2 py-0.5 text-xs text-gray-600">
                        {cat.bg_color}
                      </code>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => startEdit(cat)}
                        className="rounded border border-gray-200 px-3 py-1 text-xs text-gray-600 transition-colors hover:bg-gray-50"
                      >
                        수정
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
