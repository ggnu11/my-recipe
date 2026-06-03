"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EASE_STANDARD, EASE_CINEMATIC } from "@/lib/animation";
import { INTRO_IMAGES } from "./IntroSplash";
import { useDataStore } from "@/store/dataStore";
import { useLocaleStore } from "@/store/localeStore";
import { t } from "@/lib/i18n";

const UP_CURSOR_SVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 28 28'%3E%3Ccircle cx='14' cy='14' r='13' fill='%232c2c2c' fill-opacity='0.85'/%3E%3Cpath d='M9 16l5-5 5 5' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' fill='none'/%3E%3C/svg%3E") 14 14, pointer`;

const TRAIN_DURATION = 1.4;
const TRAIN_STAGGER = 0.12;

interface HomeSceneProps {
  visible: boolean;
  hasIntro?: boolean;
  onCategoryClick: (slug: string) => void;
  onRecipeClick: (slug: string, recipeIndex: number) => void;
}

export function HomeScene({ visible, hasIntro = false, onCategoryClick, onRecipeClick }: HomeSceneProps) {
  const categories = useDataStore((s) => s.categories);
  const recipes = useDataStore((s) => s.recipes);
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);
  const i18n = t(locale);

  // ─── Intro state ───
  const [introActive, setIntroActive] = useState(hasIntro);

  useEffect(() => {
    if (hasIntro && visible && introActive) {
      const raf = requestAnimationFrame(() => setIntroActive(false));
      return () => cancelAnimationFrame(raf);
    }
  }, [hasIntro, visible, introActive]);

  const isDark = introActive;
  const showContent = !isDark && visible;

  // ─── Search ───
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleCategoryClick = (e: React.MouseEvent, slug: string) => {
    e.preventDefault();
    onCategoryClick(slug);
  };

  const catName = (cat: (typeof categories)[0]) =>
    (locale === "ja" ? cat.name_ja : null) ?? cat.name;

  const catDesc = (cat: (typeof categories)[0]) =>
    (locale === "ja" ? cat.description_ja : null) ?? cat.description ?? "";

  const searchResults = query.trim().length > 0
    ? recipes.filter((r) => {
        if (!r.published) return false;
        const q = query.toLowerCase();
        const name = r.name.toLowerCase();
        const nameJa = (r.name_ja ?? "").toLowerCase();
        const subtitle = (r.subtitle ?? "").toLowerCase();
        return name.includes(q) || nameJa.includes(q) || subtitle.includes(q);
      })
    : [];

  const groupedResults = categories
    .map((cat) => {
      const catRecipes = recipes.filter((r) => r.category_id === cat.id && r.published);
      const matched = searchResults.filter((r) => r.category_id === cat.id);
      return { cat, catRecipes, matched };
    })
    .filter((g) => g.matched.length > 0);

  const showDropdown = focused && query.trim().length > 0;

  const handleResultClick = (recipeId: string) => {
    const recipe = recipes.find((r) => r.id === recipeId);
    if (!recipe) return;
    const cat = categories.find((c) => c.id === recipe.category_id);
    if (!cat) return;
    const catRecipes = recipes.filter((r) => r.category_id === cat.id && r.published);
    const index = catRecipes.findIndex((r) => r.id === recipeId);
    setQuery("");
    setFocused(false);
    onRecipeClick(cat.slug, index >= 0 ? index : 0);
  };

  const cardBaseDelay = hasIntro && !showContent ? 0.5 : (hasIntro ? 0.5 : 0.35);

  return (
    <div className="vignette flex h-full flex-col" style={{ position: "relative" }}>
      {/* ─── 2x2 grid background (always visible, overlay transitions) ─── */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gridTemplateRows: "1fr 1fr",
          }}
        >
          {INTRO_IMAGES.map((img, i) => (
            <div
              key={i}
              style={{
                backgroundImage: `url(${img})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
          ))}
        </div>
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: isDark
              ? "rgba(0,0,0,0.55)"
              : "rgba(241,246,245,0.88)",
            backdropFilter: isDark ? "blur(6px)" : "blur(3px)",
            transition: "all 1.2s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        />
      </div>

      {/* ─── Locale switcher ─── */}
      <div
        className="flex justify-end px-8 pt-5"
        style={{
          position: "relative",
          zIndex: 2,
          opacity: showContent ? 1 : 0,
          transition: "opacity 0.5s ease 0.3s",
          pointerEvents: showContent ? "auto" : "none",
        }}
      >
        <button
          onClick={() => setLocale(locale === "ko" ? "ja" : "ko")}
          className="relative flex h-7 w-14 items-center rounded-full transition-colors"
          style={{ backgroundColor: "#CBFB83" }}
        >
          <motion.div
            className="absolute flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-bold text-gray-800 shadow"
            animate={{ x: locale === "ko" ? 4 : 32 }}
            transition={{ duration: 0.25, ease: EASE_STANDARD }}
          >
            {locale === "ko" ? "KR" : "JP"}
          </motion.div>
        </button>
      </div>

      {/* ─── Center content ─── */}
      <main
        className="flex flex-1 flex-col items-center justify-center px-10 pb-20"
        style={{ position: "relative", zIndex: 1 }}
      >
        {/* Title — same element, color transitions */}
        <motion.h1
          className="text-5xl font-bold tracking-[0.04em]"
          initial={{ opacity: hasIntro ? 1 : 0, y: hasIntro ? 0 : 16 }}
          animate={
            isDark || visible
              ? { opacity: 1, y: 0 }
              : { opacity: 0, y: 16 }
          }
          transition={{ duration: 0.6, ease: EASE_CINEMATIC }}
          style={{
            color: isDark ? "#fff" : "#1a1a1a",
            fontFamily: "var(--font-serif), serif",
            transition: "color 1s ease",
          }}
        >
          {i18n.siteTitle}
        </motion.h1>

        {/* Subtitle — appears during morph */}
        <motion.p
          className="mt-4 text-center text-[13px] leading-relaxed tracking-wide"
          initial={{ opacity: 0 }}
          animate={showContent ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5, delay: showContent ? 0.2 : 0, ease: EASE_CINEMATIC }}
          style={{ color: "var(--text-secondary)" }}
        >
          {i18n.siteDesc}
        </motion.p>

        {/* Search bar — appears during morph */}
        <motion.div
          className="mt-10 w-full max-w-sm"
          initial={{ opacity: 0, y: 12 }}
          animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: 0.5, delay: showContent ? 0.4 : 0, ease: EASE_CINEMATIC }}
        >
          <div ref={wrapperRef} className="relative">
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
                style={{ opacity: 0.3, flexShrink: 0 }}
              >
                <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setFocused(true)}
                placeholder={i18n.searchPlaceholder}
                className="w-full bg-transparent text-sm outline-none placeholder:opacity-35"
                style={{ color: "var(--text-primary)" }}
              />
              {query && (
                <button
                  onClick={() => { setQuery(""); setFocused(false); }}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Search dropdown */}
            <AnimatePresence>
              {showDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 right-0 top-full z-50 mt-2 max-h-72 overflow-y-auto rounded-2xl shadow-lg"
                  style={{ backgroundColor: "#FEFEFE", border: "1px solid var(--border)" }}
                >
                  {groupedResults.length > 0 ? (
                    groupedResults.map((group) => (
                      <div key={group.cat.id}>
                        <div
                          className="sticky top-0 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider"
                          style={{ backgroundColor: "#F1F6F5", color: "var(--text-muted)" }}
                        >
                          {catName(group.cat)}
                        </div>
                        {group.matched.map((recipe) => (
                          <button
                            key={recipe.id}
                            onClick={() => handleResultClick(recipe.id)}
                            className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-[#F1F6F5]"
                          >
                            {recipe.thumbnail_url ? (
                              <img
                                src={recipe.thumbnail_url}
                                alt={recipe.name}
                                className="h-8 w-8 rounded-full object-cover"
                              />
                            ) : (
                              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm">
                                {recipe.emoji ?? "🍽️"}
                              </span>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="truncate text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                                {(locale === "ja" ? recipe.name_ja : null) ?? recipe.name}
                              </div>
                              {recipe.subtitle && (
                                <div className="truncate text-xs" style={{ color: "var(--text-muted)" }}>
                                  {(locale === "ja" ? recipe.subtitle_ja : null) ?? recipe.subtitle}
                                </div>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-6 text-center text-sm" style={{ color: "var(--text-muted)" }}>
                      {locale === "ja" ? "結果がありません" : "검색 결과가 없습니다"}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Category cards */}
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
                          delay: cardBaseDelay + i * TRAIN_STAGGER,
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
                whileHover={{ scale: 1.03, transition: { duration: 0.35, ease: EASE_STANDARD } }}
                whileTap={{ scale: 0.98 }}
              >
                <a
                  href={`/${cat.slug}`}
                  onClick={(e) => handleCategoryClick(e, cat.slug)}
                  className="relative z-10 flex h-[220px] flex-col items-center rounded-[20px] px-6 pb-6 pt-[82px] transition-shadow duration-300 group-hover:shadow-lg"
                  style={{
                    backgroundColor: "#FEFEFE",
                    boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
                    cursor: UP_CURSOR_SVG,
                  }}
                >
                  {/* Circular food image */}
                  <div className="absolute -top-[50px] left-1/2 z-20 -translate-x-1/2">
                    <div className="relative">
                      <motion.div
                        className="overflow-hidden rounded-full"
                        style={{
                          width: 130,
                          height: 130,
                          boxShadow: "0 6px 24px rgba(0,0,0,0.08)",
                          backgroundColor: "#F1F6F5",
                        }}
                        whileHover={{
                          scale: 1.06,
                          transition: { duration: 0.3, ease: EASE_STANDARD },
                        }}
                      >
                        {cat.image_url && (
                          <img
                            src={cat.image_url}
                            alt={catName(cat)}
                            className="h-full w-full object-cover"
                            draggable={false}
                          />
                        )}
                      </motion.div>
                      {/* Recipe count badge */}
                      <span
                        className="absolute -right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold"
                        style={{
                          backgroundColor: "#FEFEFE",
                          color: cat.color,
                          boxShadow: "0 1px 6px rgba(0,0,0,0.1)",
                        }}
                      >
                        {count}
                      </span>
                    </div>
                  </div>

                  <h3
                    className="text-[17px] font-bold tracking-wide"
                    style={{
                      color: "var(--text-primary)",
                      fontFamily: "var(--font-serif), serif",
                    }}
                  >
                    {catName(cat)}
                  </h3>
                  <p
                    className="mt-2 text-center text-xs leading-relaxed"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {catDesc(cat)}
                  </p>

                  <div className="mt-auto flex w-full items-center justify-between pt-4">
                    <span
                      className="text-[13px] font-medium"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {count}{i18n.recipes}
                    </span>
                    <span
                      className="rounded-full px-3.5 py-1.5 text-[11px] font-medium tracking-wide"
                      style={{
                        backgroundColor: "#E8F2AF",
                        color: "#333",
                      }}
                    >
                      {i18n.explore}
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
