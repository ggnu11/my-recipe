"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EASE_STANDARD, EASE_CINEMATIC } from "@/lib/animation";
import { categories, recipes, categoryEmoji, categoryDarkBg } from "@/lib/mock-data";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useThemeStore } from "@/store/themeStore";
import { useTransitionStore } from "@/store/transitionStore";

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

const TRAIN_DURATION = 1.4;
const TRAIN_STAGGER = 0.12;

export default function Home() {
  const theme = useThemeStore((s) => s.theme);
  const isDark = theme === "dark";
  const router = useRouter();
  const setDirection = useTransitionStore((s) => s.setDirection);
  const direction = useTransitionStore((s) => s.direction);
  const [exiting, setExiting] = useState(false);

  const handleCategoryClick = (e: React.MouseEvent, slug: string) => {
    e.preventDefault();
    if (direction || exiting) return;
    setExiting(true);
    setDirection("down");
    router.push(`/${slug}`);
  };

  return (
    <div className="vignette flex min-h-screen flex-col">
      {/* Header */}
      <header className="flex items-center justify-end px-10 py-6">
        <ThemeToggle />
      </header>

      {/* Center content */}
      <main className="flex flex-1 flex-col items-center justify-center px-10 pb-20">
        {/* Title & description */}
        <motion.div
          className="flex flex-col items-center"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE_CINEMATIC }}
        >
          <h1
            className="text-5xl font-bold tracking-[0.06em]"
            style={{ color: "#c8a96e", fontFamily: "var(--font-serif), serif" }}
          >
            MY RECIPE
          </h1>
          <p
            className="mt-3 text-center text-sm leading-relaxed tracking-wide"
            style={{ color: "var(--text-muted)" }}
          >
            Discover culinary artistry from around the world
          </p>
        </motion.div>

        {/* Search bar */}
        <motion.div
          className="mt-8 w-full max-w-sm"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: EASE_CINEMATIC }}
        >
          <div
            className="flex items-center gap-3 rounded-full px-5 py-3"
            style={{
              backgroundColor: "var(--surface)",
              border: "1px solid var(--border)",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              style={{ opacity: 0.35, flexShrink: 0 }}
            >
              <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder="Search recipes..."
              className="w-full bg-transparent text-sm outline-none placeholder:opacity-40"
              style={{ color: "var(--text-primary)" }}
            />
          </div>
        </motion.div>

        {/* Category cards — train animation */}
        <div className="mt-14 flex w-full max-w-4xl gap-5">
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
                initial={{ x: "100vw" }}
                animate={
                  exiting
                    ? {
                        x: "100vw",
                        transition: {
                          duration: TRAIN_DURATION,
                          delay: (categories.length - 1 - i) * TRAIN_STAGGER,
                          ease: EASE_CINEMATIC,
                        },
                      }
                    : {
                        x: 0,
                        transition: {
                          duration: TRAIN_DURATION,
                          delay: 0.35 + i * TRAIN_STAGGER,
                          ease: EASE_CINEMATIC,
                        },
                      }
                }
                whileHover={{
                  y: -6,
                  borderColor: "rgba(200,169,110,0.5)",
                  transition: { duration: 0.3, ease: EASE_STANDARD },
                }}
                whileTap={{ scale: 0.97 }}
                className="group relative flex-1 overflow-hidden rounded-[20px]"
                style={{
                  backgroundColor: cardBg,
                  border: "1px solid var(--border)",
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
                  onClick={(e) => handleCategoryClick(e, cat.slug)}
                  className="relative z-10 flex flex-col items-center gap-5 p-10"
                >
                  <div
                    className="flex h-[72px] w-[72px] items-center justify-center rounded-full text-3xl"
                    style={{
                      backgroundColor: `${cat.color}20`,
                      boxShadow: `0 0 40px ${cat.color}${isDark ? "15" : "10"}`,
                    }}
                  >
                    {categoryEmoji[cat.slug]}
                  </div>

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
