"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { ImageUpload } from "@/components/admin/ImageUpload";
import type { Category, Recipe, Ingredient, Step } from "@/lib/types";

interface RecipeFormProps {
  recipeId?: string; // undefined = create mode
}

type RecipeFields = {
  category_id: string;
  name: string;
  name_ja: string;
  subtitle: string;
  subtitle_ja: string;
  description: string;
  description_ja: string;
  thumbnail_url: string;
  youtube_video_id: string;
  youtube_start_sec: number;
  difficulty: string;
  difficulty_ja: string;
  cook_time_min: number;
  emoji: string;
  tags: string;
  sort_order: number;
  published: boolean;
};

type IngredientRow = {
  _key: string;
  id?: string;
  name: string;
  name_ja: string;
  amount: string;
  amount_ja: string;
  emoji: string;
  image_url: string;
  sort_order: number;
};

type StepRow = {
  _key: string;
  id?: string;
  step_number: number;
  title: string;
  title_ja: string;
  description: string;
  description_ja: string;
  tip: string;
  tip_ja: string;
};

const emptyRecipe: RecipeFields = {
  category_id: "",
  name: "",
  name_ja: "",
  subtitle: "",
  subtitle_ja: "",
  description: "",
  description_ja: "",
  thumbnail_url: "",
  youtube_video_id: "",
  youtube_start_sec: 0,
  difficulty: "",
  difficulty_ja: "",
  cook_time_min: 0,
  emoji: "",
  tags: "",
  sort_order: 0,
  published: false,
};

let keyCounter = 0;
function nextKey() {
  return `new-${++keyCounter}`;
}

export function RecipeForm({ recipeId }: RecipeFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<RecipeFields>(emptyRecipe);
  const [ingredients, setIngredients] = useState<IngredientRow[]>([]);
  const [steps, setSteps] = useState<StepRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(!!recipeId);

  const supabase = createClient();
  const isEdit = !!recipeId;

  useEffect(() => {
    supabase
      .from("categories")
      .select("*")
      .order("slug")
      .then(({ data }) => setCategories(data ?? []));

    if (recipeId) {
      Promise.all([
        supabase.from("recipes").select("*").eq("id", recipeId).single(),
        supabase.from("ingredients").select("*").eq("recipe_id", recipeId).order("sort_order"),
        supabase.from("steps").select("*").eq("recipe_id", recipeId).order("step_number"),
      ]).then(([recRes, ingRes, stepRes]) => {
        if (recRes.data) {
          const r = recRes.data as Recipe;
          setForm({
            category_id: r.category_id,
            name: r.name,
            name_ja: r.name_ja ?? "",
            subtitle: r.subtitle ?? "",
            subtitle_ja: r.subtitle_ja ?? "",
            description: r.description ?? "",
            description_ja: r.description_ja ?? "",
            thumbnail_url: r.thumbnail_url ?? "",
            youtube_video_id: r.youtube_video_id ?? "",
            youtube_start_sec: r.youtube_start_sec,
            difficulty: r.difficulty ?? "",
            difficulty_ja: r.difficulty_ja ?? "",
            cook_time_min: r.cook_time_min ?? 0,
            emoji: r.emoji ?? "",
            tags: (r.tags ?? []).join(", "),
            sort_order: r.sort_order,
            published: r.published,
          });
        }
        setIngredients(
          (ingRes.data ?? []).map((i: Ingredient) => ({
            _key: i.id,
            id: i.id,
            name: i.name,
            name_ja: i.name_ja ?? "",
            amount: i.amount ?? "",
            amount_ja: i.amount_ja ?? "",
            emoji: i.emoji ?? "",
            image_url: i.image_url ?? "",
            sort_order: i.sort_order,
          }))
        );
        setSteps(
          (stepRes.data ?? []).map((s: Step) => ({
            _key: s.id,
            id: s.id,
            step_number: s.step_number,
            title: s.title,
            title_ja: s.title_ja ?? "",
            description: s.description,
            description_ja: s.description_ja ?? "",
            tip: s.tip ?? "",
            tip_ja: s.tip_ja ?? "",
          }))
        );
        setLoading(false);
      });
    }
  }, [recipeId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async () => {
    if (!form.name || !form.category_id) {
      setMessage("이름과 카테고리는 필수입니다.");
      return;
    }

    setSaving(true);
    setMessage("");

    const recipeData = {
      category_id: form.category_id,
      name: form.name,
      name_ja: form.name_ja || null,
      subtitle: form.subtitle || null,
      subtitle_ja: form.subtitle_ja || null,
      description: form.description || null,
      description_ja: form.description_ja || null,
      thumbnail_url: form.thumbnail_url || null,
      youtube_video_id: form.youtube_video_id || null,
      youtube_start_sec: form.youtube_start_sec,
      difficulty: form.difficulty || null,
      difficulty_ja: form.difficulty_ja || null,
      cook_time_min: form.cook_time_min || null,
      emoji: form.emoji || null,
      tags: form.tags
        ? form.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [],
      sort_order: form.sort_order,
      published: form.published,
    };

    let finalRecipeId = recipeId;

    if (isEdit) {
      await supabase.from("recipes").update(recipeData).eq("id", recipeId);
    } else {
      const { data } = await supabase.from("recipes").insert(recipeData).select("id").single();
      finalRecipeId = data?.id;
    }

    if (!finalRecipeId) {
      setMessage("레시피 저장에 실패했습니다.");
      setSaving(false);
      return;
    }

    // Save ingredients
    if (isEdit) {
      await supabase.from("ingredients").delete().eq("recipe_id", finalRecipeId);
    }
    if (ingredients.length > 0) {
      await supabase.from("ingredients").insert(
        ingredients.map((ing, i) => ({
          recipe_id: finalRecipeId,
          name: ing.name,
          name_ja: ing.name_ja || null,
          amount: ing.amount || null,
          amount_ja: ing.amount_ja || null,
          emoji: ing.emoji || null,
          image_url: ing.image_url || null,
          sort_order: i,
        }))
      );
    }

    // Save steps
    if (isEdit) {
      await supabase.from("steps").delete().eq("recipe_id", finalRecipeId);
    }
    if (steps.length > 0) {
      await supabase.from("steps").insert(
        steps.map((s, i) => ({
          recipe_id: finalRecipeId,
          step_number: i + 1,
          title: s.title,
          title_ja: s.title_ja || null,
          description: s.description,
          description_ja: s.description_ja || null,
          tip: s.tip || null,
          tip_ja: s.tip_ja || null,
        }))
      );
    }

    setSaving(false);

    if (!isEdit) {
      window.location.href = `/admin/recipes/${finalRecipeId}/edit`;
    } else {
      setMessage("저장 완료!");
      setTimeout(() => setMessage(""), 2000);
    }
  };

  // Ingredient helpers
  const addIngredient = () => {
    setIngredients([
      ...ingredients,
      { _key: nextKey(), name: "", name_ja: "", amount: "", amount_ja: "", emoji: "", image_url: "", sort_order: ingredients.length },
    ]);
  };
  const removeIngredient = (key: string) => {
    setIngredients(ingredients.filter((i) => i._key !== key));
  };
  const updateIngredient = (key: string, field: string, value: string) => {
    setIngredients(ingredients.map((i) => (i._key === key ? { ...i, [field]: value } : i)));
  };

  // Step helpers
  const addStep = () => {
    setSteps([
      ...steps,
      { _key: nextKey(), step_number: steps.length + 1, title: "", title_ja: "", description: "", description_ja: "", tip: "", tip_ja: "" },
    ]);
  };
  const removeStep = (key: string) => {
    setSteps(steps.filter((s) => s._key !== key));
  };
  const updateStep = (key: string, field: string, value: string) => {
    setSteps(steps.map((s) => (s._key === key ? { ...s, [field]: value } : s)));
  };

  if (loading) {
    return <div className="py-20 text-center text-gray-400">로딩 중...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1
          className="text-2xl font-bold"
          style={{ color: "#333", fontFamily: "var(--font-serif), serif" }}
        >
          {isEdit ? "레시피 수정" : "새 레시피"}
        </h1>
        <div className="flex items-center gap-3">
          {message && (
            <span className="text-sm text-green-600">{message}</span>
          )}
          <a
            href="/admin/recipes"
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600"
          >
            뒤로
          </a>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            style={{ backgroundColor: "#c8a96e" }}
          >
            {saving ? "저장 중..." : "저장"}
          </button>
        </div>
      </div>

      {/* Basic Info */}
      <Section title="기본 정보">
        <div className="grid grid-cols-2 gap-4">
          <Field label="카테고리" required>
            <select
              value={form.category_id}
              onChange={(e) => setForm({ ...form, category_id: e.target.value })}
              className="input"
            >
              <option value="">선택...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </Field>
          <Field label="이모지">
            <input
              value={form.emoji}
              onChange={(e) => setForm({ ...form, emoji: e.target.value })}
              className="input"
              placeholder="🍲"
            />
          </Field>
          <Field label="썸네일 이미지" full>
            <ImageUpload
              value={form.thumbnail_url || null}
              onChange={(url) => setForm({ ...form, thumbnail_url: url ?? "" })}
              folder="recipes"
              hint="800x800px (정사각형)"
            />
          </Field>
          <Field label="이름 (한국어)" required>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input"
            />
          </Field>
          <Field label="이름 (일본어)">
            <input
              value={form.name_ja}
              onChange={(e) => setForm({ ...form, name_ja: e.target.value })}
              className="input"
            />
          </Field>
          <Field label="부제목 (한국어)">
            <input
              value={form.subtitle}
              onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              className="input"
            />
          </Field>
          <Field label="부제목 (일본어)">
            <input
              value={form.subtitle_ja}
              onChange={(e) => setForm({ ...form, subtitle_ja: e.target.value })}
              className="input"
            />
          </Field>
          <Field label="설명 (한국어)" full>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="input min-h-[80px]"
            />
          </Field>
          <Field label="설명 (일본어)" full>
            <textarea
              value={form.description_ja}
              onChange={(e) => setForm({ ...form, description_ja: e.target.value })}
              className="input min-h-[80px]"
            />
          </Field>
        </div>
      </Section>

      {/* Details */}
      <Section title="상세 정보">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Field label="난이도 (한국어)">
            <input
              value={form.difficulty}
              onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
              className="input"
              placeholder="쉬움"
            />
          </Field>
          <Field label="난이도 (일본어)">
            <input
              value={form.difficulty_ja}
              onChange={(e) => setForm({ ...form, difficulty_ja: e.target.value })}
              className="input"
              placeholder="簡単"
            />
          </Field>
          <Field label="조리시간 (분)">
            <input
              type="number"
              value={form.cook_time_min}
              onChange={(e) => setForm({ ...form, cook_time_min: Number(e.target.value) })}
              className="input"
            />
          </Field>
          <Field label="정렬순서">
            <input
              type="number"
              value={form.sort_order}
              onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
              className="input"
            />
          </Field>
          <Field label="YouTube 영상 ID">
            <input
              value={form.youtube_video_id}
              onChange={(e) => setForm({ ...form, youtube_video_id: e.target.value })}
              className="input"
              placeholder="dQw4w9WgXcQ"
            />
          </Field>
          <Field label="YouTube 시작 (초)">
            <input
              type="number"
              value={form.youtube_start_sec}
              onChange={(e) => setForm({ ...form, youtube_start_sec: Number(e.target.value) })}
              className="input"
            />
          </Field>
          <Field label="태그 (쉼표 구분)">
            <input
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              className="input"
              placeholder="매운, 국물"
            />
          </Field>
          <Field label="공개 여부">
            <label className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => setForm({ ...form, published: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 accent-[#c8a96e]"
              />
              <span className="text-sm text-gray-600">공개</span>
            </label>
          </Field>
        </div>
      </Section>

      {/* Ingredients */}
      <Section
        title="재료"
        action={
          <button onClick={addIngredient} className="text-xs font-medium text-[#c8a96e]">
            + 추가
          </button>
        }
      >
        {ingredients.length === 0 && (
          <p className="py-4 text-center text-sm text-gray-400">재료가 없습니다.</p>
        )}
        {ingredients.map((ing, i) => (
          <div key={ing._key} className="mb-3 flex items-start gap-3 rounded-lg border border-gray-100 p-3">
            <span className="mt-2 text-xs text-gray-400 w-5 shrink-0">{i + 1}</span>
            <div className="shrink-0">
              <ImageUpload
                value={ing.image_url || null}
                onChange={(url) => updateIngredient(ing._key, "image_url", url ?? "")}
                folder="ingredients"
                size={52}
                hint="104x104px"
              />
            </div>
            <div className="flex-1 grid grid-cols-2 gap-2">
              <input
                value={ing.name}
                onChange={(e) => updateIngredient(ing._key, "name", e.target.value)}
                className="input text-xs"
                placeholder="이름 (한국어)"
              />
              <input
                value={ing.name_ja}
                onChange={(e) => updateIngredient(ing._key, "name_ja", e.target.value)}
                className="input text-xs"
                placeholder="이름 (일본어)"
              />
              <input
                value={ing.amount}
                onChange={(e) => updateIngredient(ing._key, "amount", e.target.value)}
                className="input text-xs"
                placeholder="용량 (한국어)"
              />
              <input
                value={ing.amount_ja}
                onChange={(e) => updateIngredient(ing._key, "amount_ja", e.target.value)}
                className="input text-xs"
                placeholder="용량 (일본어)"
              />
            </div>
            <button
              onClick={() => removeIngredient(ing._key)}
              className="mt-2 text-red-400 hover:text-red-600 shrink-0"
            >
              ✕
            </button>
          </div>
        ))}
      </Section>

      {/* Steps */}
      <Section
        title="조리단계"
        action={
          <button onClick={addStep} className="text-xs font-medium text-[#c8a96e]">
            + 추가
          </button>
        }
      >
        {steps.length === 0 && (
          <p className="py-4 text-center text-sm text-gray-400">조리단계가 없습니다.</p>
        )}
        {steps.map((step, i) => (
          <div key={step._key} className="mb-4 rounded-lg border border-gray-100 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-600">단계 {i + 1}</span>
              <button
                onClick={() => removeStep(step._key)}
                className="text-xs text-red-400 hover:text-red-600"
              >
                삭제
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                value={step.title}
                onChange={(e) => updateStep(step._key, "title", e.target.value)}
                className="input text-xs"
                placeholder="제목 (한국어)"
              />
              <input
                value={step.title_ja}
                onChange={(e) => updateStep(step._key, "title_ja", e.target.value)}
                className="input text-xs"
                placeholder="제목 (일본어)"
              />
              <textarea
                value={step.description}
                onChange={(e) => updateStep(step._key, "description", e.target.value)}
                className="input min-h-[60px] text-xs"
                placeholder="설명 (한국어)"
              />
              <textarea
                value={step.description_ja}
                onChange={(e) => updateStep(step._key, "description_ja", e.target.value)}
                className="input min-h-[60px] text-xs"
                placeholder="설명 (일본어)"
              />
              <input
                value={step.tip}
                onChange={(e) => updateStep(step._key, "tip", e.target.value)}
                className="input text-xs"
                placeholder="팁 (한국어)"
              />
              <input
                value={step.tip_ja}
                onChange={(e) => updateStep(step._key, "tip_ja", e.target.value)}
                className="input text-xs"
                placeholder="팁 (일본어)"
              />
            </div>
          </div>
        ))}
      </Section>

      <style jsx global>{`
        .input {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid #e5e7eb;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          color: #111827;
          outline: none;
        }
        .input:focus {
          border-color: #c8a96e;
          box-shadow: 0 0 0 1px #c8a96e;
        }
      `}</style>
    </div>
  );
}

function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );
}

function Field({
  label,
  required,
  full,
  children,
}: {
  label: string;
  required?: boolean;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={full ? "col-span-2" : ""}>
      <label className="mb-1 block text-xs font-medium text-gray-500">
        {label}
        {required && <span className="text-red-400"> *</span>}
      </label>
      {children}
    </div>
  );
}
