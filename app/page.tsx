"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { cardStagger, EASE_STANDARD, EASE_CINEMATIC } from "@/lib/animation";
import { categories, recipes, categoryEmoji, categoryDarkBg } from "@/lib/mock-data";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useThemeStore } from "@/store/themeStore";

const categoryLabel: Record<string, string> = {
  korean: "Korean Food",
  chinese: "Chinese Food",
  western: "Western Food",
};

const categoryDesc: Record<string, string> = {
  korean: "Traditional flavors passed down through generations",
  chinese: "Bold and aromatic dishes from the East",
  western: "Classic European culinary artistry",
};

export default function Home() {
  const theme = useThemeStore((s) => s.theme);
  const isDark = theme === "dark";

  return (
    <div className="vignette flex min-h-screen flex-col">
      {/* Header */}
      <motion.header
        className="flex items-center justify-between px-10 py-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE_CINEMATIC }}
      >
        <h1
          className="text-2xl font-bold tracking-[0.08em]"
          style={{ color: "#c8a96e", fontFamily: "var(--font-serif), serif" }}
        >
          MY RECIPE
        </h1>
        <ThemeToggle />
      </motion.header>

      {/* Main content */}
      <main className="flex flex-1 items-center justify-center px-10 pb-16">
        <div className="grid w-full max-w-5xl grid-cols-1 gap-5 sm:grid-cols-3">
          {categories.map((cat, i) => {
            const count = recipes.filter(
              (r) => r.category_id === cat.id && r.published
            ).length;
            const cardBg = isDark
              ? categoryDarkBg[cat.slug] ?? cat.bg_color
              : cat.bg_color;

            return (
              <motion.div
                key={cat.slug}
                custom={i}
                variants={cardStagger}
                initial="initial"
                animate="animate"
                whileHover={{
                  y: -6,
                  borderColor: "rgba(200,169,110,0.5)",
                  transition: { duration: 0.3, ease: EASE_STANDARD },
                }}
                whileTap={{ scale: 0.98 }}
                className="group relative overflow-hidden rounded-[20px]"
                style={{
                  backgroundColor: cardBg,
                  border: `1px solid var(--border)`,
                  willChange: "transform, opacity",
                }}
              >
                {/* Glow on hover */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{
                    background: `radial-gradient(circle at 50% 40%, ${cat.color}${isDark ? "25" : "20"} 0%, transparent 60%)`,
                  }}
                />

                <Link
                  href={`/${cat.slug}`}
                  className="relative z-10 flex flex-col items-center gap-5 p-10"
                >
                  <motion.div
                    layoutId={`category-circle-${cat.slug}`}
                    className="flex h-[72px] w-[72px] items-center justify-center rounded-full text-3xl"
                    style={{
                      backgroundColor: `${cat.color}20`,
                      boxShadow: `0 0 40px ${cat.color}${isDark ? "15" : "10"}`,
                    }}
                  >
                    {categoryEmoji[cat.slug]}
                  </motion.div>

                  <div className="flex flex-col items-center gap-2">
                    <span
                      className="text-xl font-bold tracking-wide"
                      style={{
                        color: "var(--text-primary)",
                        fontFamily: "var(--font-serif), serif",
                      }}
                    >
                      {categoryLabel[cat.slug]}
                    </span>
                    <span
                      className="text-center text-sm leading-relaxed"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {categoryDesc[cat.slug]}
                    </span>
                  </div>

                  <span
                    className="mt-1 text-xs tracking-[0.15em] uppercase"
                    style={{ color: cat.color }}
                  >
                    {count} Recipes
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
