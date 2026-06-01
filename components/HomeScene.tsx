"use client";

import { motion } from "framer-motion";
import { EASE_STANDARD, EASE_CINEMATIC } from "@/lib/animation";
import { useDataStore } from "@/store/dataStore";
import { useLocaleStore } from "@/store/localeStore";
import { t } from "@/lib/i18n";

const UP_CURSOR_SVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 28 28'%3E%3Ccircle cx='14' cy='14' r='13' fill='%232c2c2c' fill-opacity='0.85'/%3E%3Cpath d='M9 16l5-5 5 5' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' fill='none'/%3E%3C/svg%3E") 14 14, pointer`;

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
            className="text-5xl font-bold tracking-[0.04em]"
            style={{ color: "#1a1a1a", fontFamily: "var(--font-serif), serif" }}
          >
            {i18n.siteTitle}
          </h1>
          <p
            className="mt-4 text-center text-[13px] leading-relaxed tracking-wide"
            style={{ color: "var(--text-secondary)" }}
          >
            {i18n.siteDesc}
          </p>
        </motion.div>

        {/* Search bar */}
        <motion.div
          className="mt-10 w-full max-w-sm"
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
              style={{ opacity: 0.3, flexShrink: 0 }}
            >
              <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder={i18n.searchPlaceholder}
              className="w-full bg-transparent text-sm outline-none placeholder:opacity-35"
              style={{ color: "var(--text-primary)" }}
            />
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
