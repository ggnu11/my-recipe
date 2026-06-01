"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";

interface Stats {
  categories: number;
  recipes: number;
  ingredients: number;
  steps: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      supabase.from("categories").select("id", { count: "exact", head: true }),
      supabase.from("recipes").select("id", { count: "exact", head: true }),
      supabase.from("ingredients").select("id", { count: "exact", head: true }),
      supabase.from("steps").select("id", { count: "exact", head: true }),
    ]).then(([cat, rec, ing, step]) => {
      setStats({
        categories: cat.count ?? 0,
        recipes: rec.count ?? 0,
        ingredients: ing.count ?? 0,
        steps: step.count ?? 0,
      });
    });
  }, []);

  return (
    <div>
      <h1
        className="mb-6 text-2xl font-bold"
        style={{ color: "#333", fontFamily: "var(--font-serif), serif" }}
      >
        대시보드
      </h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="카테고리" value={stats?.categories} />
        <StatCard label="레시피" value={stats?.recipes} />
        <StatCard label="재료" value={stats?.ingredients} />
        <StatCard label="조리단계" value={stats?.steps} />
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value?: number }) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <div className="text-xs text-gray-400">{label}</div>
      <div
        className="mt-1 text-2xl font-bold"
        style={{ color: "#333" }}
      >
        {value ?? "-"}
      </div>
    </div>
  );
}
