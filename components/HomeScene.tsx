"use client";

import { motion } from "framer-motion";
import { EASE_STANDARD, EASE_CINEMATIC } from "@/lib/animation";
import { categories, recipes, categoryDarkBg } from "@/lib/mock-data";
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

const categoryImage: Record<string, string> = {
  korean: "/category-korea.png",
  chinese: "/category-chinese.png",
  western: "/category-japanese.png",
};

const TRAIN_DURATION = 1.4;
const TRAIN_STAGGER = 0.12;

interface HomeSceneProps {
  visible: boolean;
  onCategoryClick: (slug: string) => void;
}

export function HomeScene({ visible, onCategoryClick }: HomeSceneProps) {
  const theme = useThemeStore((s) => s.theme);
  const isDark = theme === "dark";

  const handleCategoryClick = (e: React.MouseEvent, slug: string) => {
    e.preventDefault();
    onCategoryClick(slug);
  };

  return (
    <div className="vignette flex h-full flex-col">
      {/* Center content */}
      <main className="flex flex-1 flex-col items-center justify-center px-10 pb-20">
        {/* Title & description */}
        <motion.div
          className="flex flex-col items-center"
          initial={{ opacity: 0, y: 16 }}
          animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
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
          animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: 0.5, delay: visible ? 0.15 : 0, ease: EASE_CINEMATIC }}
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
        <div className="mt-20 flex w-full max-w-4xl gap-8">
          {categories.map((cat, i) => {
            const count = recipes.filter(
              (r) => r.category_id === cat.id && r.published
            ).length;

            return (
              <motion.div
                key={cat.slug}
                className="group relative flex-1"
                style={{ paddingTop: 60 }}
                initial={{ x: "100vw" }}
                animate={
                  visible
                    ? {
                        x: 0,
                        transition: {
                          duration: TRAIN_DURATION,
                          delay: 0.35 + i * TRAIN_STAGGER,
                          ease: EASE_CINEMATIC,
                        },
                      }
                    : {
                        x: "100vw",
                        transition: {
                          duration: TRAIN_DURATION,
                          delay: (categories.length - 1 - i) * TRAIN_STAGGER,
                          ease: EASE_CINEMATIC,
                        },
                      }
                }
                whileTap={{ scale: 0.97 }}
              >
                <a
                  href={`/${cat.slug}`}
                  onClick={(e) => handleCategoryClick(e, cat.slug)}
                  className="relative z-10 flex flex-col items-center rounded-[22px] px-6 pb-6 pt-[72px] transition-shadow duration-300 group-hover:shadow-xl"
                  style={{
                    backgroundColor: isDark ? "#1c1c1e" : "#fff",
                    boxShadow: isDark
                      ? "0 4px 24px rgba(0,0,0,0.3)"
                      : "0 4px 24px rgba(0,0,0,0.07)",
                  }}
                >
                  {/* Circular food image — overlapping card top */}
                  <div className="absolute -top-[50px] left-1/2 z-20 -translate-x-1/2">
                    <div className="relative">
                      <motion.div
                        className="overflow-hidden rounded-full"
                        style={{
                          width: 130,
                          height: 130,
                          boxShadow: isDark
                            ? "0 8px 28px rgba(0,0,0,0.5)"
                            : "0 8px 28px rgba(0,0,0,0.12)",
                        }}
                        whileHover={{
                          scale: 1.08,
                          transition: { duration: 0.3, ease: EASE_STANDARD },
                        }}
                      >
                        <img
                          src={categoryImage[cat.slug]}
                          alt={categoryLabel[cat.slug]}
                          className="h-full w-full object-cover"
                          draggable={false}
                        />
                      </motion.div>
                      {/* Recipe count badge */}
                      <span
                        className="absolute -right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold"
                        style={{
                          backgroundColor: isDark ? "#2a2a2a" : "#fff",
                          color: cat.color,
                          boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                        }}
                      >
                        {count}
                      </span>
                    </div>
                  </div>

                  <h3
                    className="text-lg font-bold tracking-wide"
                    style={{
                      color: "var(--text-primary)",
                      fontFamily: "var(--font-serif), serif",
                    }}
                  >
                    {categoryLabel[cat.slug]}
                  </h3>
                  <p
                    className="mt-2.5 text-center text-xs leading-relaxed"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {categoryDesc[cat.slug]}
                  </p>

                  <div className="mt-5 flex w-full items-center justify-between">
                    <span
                      className="text-sm font-semibold"
                      style={{ color: cat.color }}
                    >
                      {count} Recipes
                    </span>
                    <span
                      className="rounded-full px-4 py-1.5 text-[11px] font-semibold tracking-wide transition-colors duration-200"
                      style={{
                        backgroundColor: `${cat.color}15`,
                        color: cat.color,
                      }}
                    >
                      Explore
                    </span>
                  </div>
                </a>
              </motion.div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
