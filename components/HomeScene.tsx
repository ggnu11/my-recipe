"use client";

import { motion } from "framer-motion";
import { EASE_STANDARD, EASE_CINEMATIC } from "@/lib/animation";
import { useDataStore } from "@/store/dataStore";
import { useLocaleStore } from "@/store/localeStore";
import { t } from "@/lib/i18n";

const UP_CURSOR_SVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 28 28'%3E%3Ccircle cx='14' cy='14' r='13' fill='%23c8a96e' fill-opacity='0.9'/%3E%3Cpath d='M9 16l5-5 5 5' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' fill='none'/%3E%3C/svg%3E") 14 14, pointer`;

const TRAIN_DURATION = 1.4;
const TRAIN_STAGGER = 0.12;

interface HomeSceneProps {
  visible: boolean;
  onCategoryClick: (slug: string) => void;
}

export function HomeScene({ visible, onCategoryClick }: HomeSceneProps) {
  const categories = useDataStore((s) => s.categories);
  const recipes = useDataStore((s) => s.recipes);
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);
  const i18n = t(locale);

  const handleCategoryClick = (e: React.MouseEvent, slug: string) => {
    e.preventDefault();
    onCategoryClick(slug);
  };

  const catName = (cat: (typeof categories)[0]) =>
    (locale === "ja" ? cat.name_ja : null) ?? cat.name;

  const catDesc = (cat: (typeof categories)[0]) =>
    (locale === "ja" ? cat.description_ja : null) ?? cat.description ?? "";

  return (
    <div className="vignette flex h-full flex-col">
      {/* Locale switcher */}
      <div className="flex justify-end px-8 pt-5">
        <button
          onClick={() => setLocale(locale === "ko" ? "ja" : "ko")}
          className="relative flex h-7 w-14 items-center rounded-full transition-colors"
          style={{ backgroundColor: locale === "ko" ? "#c8a96e" : "#e07070" }}
        >
          <motion.div
            className="absolute flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-bold shadow"
            animate={{ x: locale === "ko" ? 4 : 32 }}
            transition={{ duration: 0.25, ease: EASE_STANDARD }}
          >
            {locale === "ko" ? "KR" : "JP"}
          </motion.div>
        </button>
      </div>
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
            {i18n.siteTitle}
          </h1>
          <p
            className="mt-3 text-center text-sm leading-relaxed tracking-wide"
            style={{ color: "var(--text-muted)" }}
          >
            {i18n.siteDesc}
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
              placeholder={i18n.searchPlaceholder}
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
                whileHover={{ scale: 1.04, transition: { duration: 0.3, ease: EASE_STANDARD } }}
                whileTap={{ scale: 0.97 }}
              >
                <a
                  href={`/${cat.slug}`}
                  onClick={(e) => handleCategoryClick(e, cat.slug)}
                  className="relative z-10 flex h-[220px] flex-col items-center rounded-[22px] px-6 pb-6 pt-[82px] transition-shadow duration-300 group-hover:shadow-xl"
                  style={{
                    backgroundColor: "#fff",
                    boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
                    cursor: UP_CURSOR_SVG,
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
                          boxShadow: "0 8px 28px rgba(0,0,0,0.12)",
                          backgroundColor: "#f5f5f0",
                        }}
                        whileHover={{
                          scale: 1.08,
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
                        className="absolute -right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold"
                        style={{
                          backgroundColor: "#fff",
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
                    {catName(cat)}
                  </h3>
                  <p
                    className="mt-2.5 text-center text-xs leading-relaxed"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {catDesc(cat)}
                  </p>

                  <div className="mt-5 flex w-full items-center justify-between">
                    <span
                      className="text-sm font-semibold"
                      style={{ color: cat.color }}
                    >
                      {count}{i18n.recipes}
                    </span>
                    <span
                      className="rounded-full px-4 py-1.5 text-[11px] font-semibold tracking-wide transition-colors duration-200"
                      style={{
                        backgroundColor: `${cat.color}15`,
                        color: cat.color,
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
