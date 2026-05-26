"use client";

import { use, useCallback, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  EASE_CINEMATIC,
  EASE_STANDARD,
  detailEnter,
} from "@/lib/animation";
import {
  getCategoryBySlug,
  getRecipesByCategory,
  getIngredientsByRecipe,
  getStepsByRecipe,
  recipeEmoji,
  categoryDarkBg,
} from "@/lib/mock-data";
import { useShowcaseStore } from "@/store/showcaseStore";
import { useThemeStore } from "@/store/themeStore";
import { ThemeToggle } from "@/components/ThemeToggle";

const SEMI_DIAMETER = 760;
const SEMI_RADIUS = SEMI_DIAMETER / 2;
const HERO_CIRCLE_SIZE = 300;
const MENU_DOT_SIZE = 108;
const MENU_DOT_BASE = 108;
/** Menu dots on the outer arc (outside the semi-circle edge) */
const ORBIT_GAP = 24;
const ORBIT_ON_SEMI = SEMI_RADIUS + MENU_DOT_SIZE / 2 + ORBIT_GAP;
/** Pull hero hub inward so the center circle stays on screen */
const HUB_INSET = HERO_CIRCLE_SIZE * 0.42;
/** Visible left semicircle arc: top → left → bottom */
const SEMI_ARC_SPAN = Math.PI * 0.88;

type OrbitItemLayout = {
  index: number;
  x: number;
  y: number;
  opacity: number;
  scale: number;
  isActive: boolean;
};

function getOrbitLayout(
  index: number,
  activeIndex: number,
  total: number
): OrbitItemLayout {
  const offset = index - activeIndex;
  const distance = Math.abs(offset);
  const isActive = offset === 0;
  const angleStep = SEMI_ARC_SPAN / Math.max(total - 1, 1);
  /** π = leftmost point on semi-circle; scroll rotates along the arc */
  const angle = Math.PI + offset * angleStep;
  const x = Math.cos(angle) * ORBIT_ON_SEMI;
  const y = Math.sin(angle) * ORBIT_ON_SEMI;

  return {
    index,
    x,
    y,
    opacity: isActive ? 1 : distance === 1 ? 0.88 : distance === 2 ? 0.65 : 0.45,
    scale: isActive ? 1.12 : distance === 1 ? 1 : distance === 2 ? 0.92 : 0.85,
    isActive,
  };
}

export default function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = use(params);
  const cat = getCategoryBySlug(category);
  const recipeList = getRecipesByCategory(category);
  const theme = useThemeStore((s) => s.theme);
  const isDark = theme === "dark";

  const {
    selectedMenuIndex,
    setSelectedMenuIndex,
    viewState,
    setViewState,
    isAnimating,
    setIsAnimating,
    setSelectedRecipeId,
  } = useShowcaseStore();

  // Use refs for scroll handler to avoid stale closures
  const scrollLockRef = useRef(false);
  const isAnimatingRef = useRef(isAnimating);
  const selectedMenuIndexRef = useRef(selectedMenuIndex);
  const recipeListLenRef = useRef(recipeList.length);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => { isAnimatingRef.current = isAnimating; }, [isAnimating]);
  useEffect(() => { selectedMenuIndexRef.current = selectedMenuIndex; }, [selectedMenuIndex]);
  useEffect(() => { recipeListLenRef.current = recipeList.length; }, [recipeList.length]);

  useEffect(() => {
    setSelectedMenuIndex(0);
    setViewState(1);
    setIsAnimating(false);
    setSelectedRecipeId(null);
  }, [category, setSelectedMenuIndex, setViewState, setIsAnimating, setSelectedRecipeId]);

  const currentRecipe = recipeList[selectedMenuIndex];
  const ingredients = currentRecipe ? getIngredientsByRecipe(currentRecipe.id) : [];
  const steps = currentRecipe ? getStepsByRecipe(currentRecipe.id) : [];

  const heroRadius = HERO_CIRCLE_SIZE / 2;
  const orbitLayouts = useMemo(
    () => recipeList.map((_, i) => getOrbitLayout(i, selectedMenuIndex, recipeList.length)),
    [recipeList, selectedMenuIndex]
  );

  const navigateMenu = useCallback(
    (direction: 1 | -1) => {
      if (isAnimatingRef.current || recipeListLenRef.current === 0) return;
      const next = selectedMenuIndexRef.current + direction;
      if (next < 0 || next >= recipeListLenRef.current) return;
      setIsAnimating(true);
      setSelectedMenuIndex(next);
      setTimeout(() => setIsAnimating(false), 580);
    },
    [setIsAnimating, setSelectedMenuIndex]
  );

  // Scroll-based menu navigation — attached to main area only
  useEffect(() => {
    if (viewState !== 1) return;
    const el = mainRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (scrollLockRef.current || isAnimatingRef.current) return;
      if (Math.abs(e.deltaY) < 30) return;
      scrollLockRef.current = true;
      navigateMenu(e.deltaY > 0 ? 1 : -1);
      setTimeout(() => {
        scrollLockRef.current = false;
      }, 580);
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [viewState, navigateMenu]);

  // ESC to return
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && viewState === 2) {
        setViewState(1);
        setSelectedRecipeId(null);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [viewState, setViewState, setSelectedRecipeId]);

  const selectRecipe = useCallback(
    (index: number) => {
      if (isAnimatingRef.current || index === selectedMenuIndexRef.current) return;
      setIsAnimating(true);
      setSelectedMenuIndex(index);
      if (viewState === 2) {
        setViewState(1);
        setSelectedRecipeId(null);
      }
      setTimeout(() => setIsAnimating(false), 580);
    },
    [setIsAnimating, setSelectedMenuIndex, setViewState, setSelectedRecipeId, viewState]
  );

  if (!cat) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: "var(--bg)" }}>
        <p style={{ color: "var(--text-muted)" }}>Category not found</p>
      </div>
    );
  }

  const circleBg = isDark ? (categoryDarkBg[category] ?? cat.bg_color) : cat.bg_color;

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Animated background */}
      <motion.div
        className="pointer-events-none fixed inset-0 z-0"
        animate={{
          background:
            viewState === 1
              ? isDark
                ? `radial-gradient(ellipse at 80% 50%, ${cat.color}12 0%, transparent 50%), #0d0d0d`
                : `radial-gradient(ellipse at 80% 50%, ${cat.color}08 0%, transparent 50%), #faf9f7`
              : isDark
                ? `radial-gradient(ellipse at 50% 50%, #1a1a1a 0%, #0a0a0a 60%, #000 100%)`
                : `radial-gradient(ellipse at 50% 50%, #f5f3ef 0%, #eae7e1 60%, #e0ddd6 100%)`,
        }}
        transition={{ duration: 1, ease: EASE_CINEMATIC }}
      />

      {viewState === 2 && (
        <header
          className="relative z-20 flex shrink-0 items-center justify-between border-b px-8 py-5"
          style={{ borderColor: "var(--border)" }}
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm transition-colors"
            style={{ color: "var(--text-muted)" }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="opacity-60">
              <path
                d="M10 12L6 8L10 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Back
          </Link>
          <h2
            className="absolute left-1/2 -translate-x-1/2 text-sm font-bold tracking-[0.2em] uppercase"
            style={{ color: "#c8a96e", fontFamily: "var(--font-serif), serif" }}
          >
            {cat.name}
          </h2>
          <ThemeToggle />
        </header>
      )}

      <main ref={mainRef} className="relative z-10 flex flex-1 overflow-x-visible overflow-y-hidden">
        <AnimatePresence mode="wait">
          {viewState === 1 && currentRecipe ? (
            /* ===== State 1: Semi-circle Carousel ===== */
            <motion.div
              key="carousel"
              className="relative flex flex-1 items-center overflow-visible"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{ willChange: "opacity" }}
            >
              {/* Floating controls — no header bar (avoids clipping semi-circle) */}
              <div className="pointer-events-none absolute inset-x-0 top-0 z-40 flex items-center justify-between px-8 py-5">
                <Link
                  href="/"
                  className="pointer-events-auto inline-flex items-center gap-2 text-sm transition-colors"
                  style={{ color: "var(--text-muted)" }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="opacity-60">
                    <path
                      d="M10 12L6 8L10 4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Back
                </Link>
                <h2
                  className="pointer-events-none absolute left-1/2 -translate-x-1/2 text-sm font-bold tracking-[0.2em] uppercase"
                  style={{ color: "#c8a96e", fontFamily: "var(--font-serif), serif" }}
                >
                  {cat.name}
                </h2>
                <div className="pointer-events-auto">
                  <ThemeToggle />
                </div>
              </div>

              {/* Left — recipe copy */}
              <div className="flex w-[42%] min-w-0 flex-col justify-center px-10 pl-14 lg:px-16 lg:pl-20">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentRecipe.id}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.4, delay: 0.1, ease: EASE_CINEMATIC },
                    }}
                    exit={{
                      opacity: 0,
                      y: -10,
                      transition: { duration: 0.2, ease: EASE_STANDARD },
                    }}
                  >
                    <p
                      className="mb-3 text-xs tracking-[0.2em] uppercase"
                      style={{ color: "var(--text-faint)" }}
                    >
                      {currentRecipe.difficulty} &middot; {currentRecipe.cook_time_min}min
                    </p>
                    <h2
                      className="mb-3 text-5xl font-bold"
                      style={{
                        color: "var(--text-primary)",
                        fontFamily: "var(--font-serif), serif",
                      }}
                    >
                      {currentRecipe.name}
                    </h2>
                    {currentRecipe.subtitle && (
                      <p
                        className="mb-5 text-lg"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {currentRecipe.subtitle}
                      </p>
                    )}
                    <p
                      className="mb-10 max-w-md leading-[1.8]"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {currentRecipe.description}
                    </p>
                    <div className="flex gap-4">
                      <motion.button
                        onClick={() => {
                          setViewState(2);
                          setSelectedRecipeId(currentRecipe.id);
                        }}
                        className="rounded-full px-7 py-3 text-sm font-medium transition-opacity hover:opacity-90"
                        style={{
                          backgroundColor: "#c8a96e",
                          color: isDark ? "#0d0d0d" : "#fff",
                        }}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        상세 보기
                      </motion.button>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Right — 왼쪽 반원(하현달형): viewport 기준 배치 */}
              <div className="relative min-h-0 flex-1 overflow-visible">
                {/* z-1: clip 왼쪽 절반만 — 곡선이 왼쪽으로 휨 */}
                <div
                  className="pointer-events-none fixed top-1/2 right-0 z-[1] -translate-y-1/2 overflow-hidden"
                  style={{
                    width: SEMI_RADIUS,
                    height: SEMI_DIAMETER,
                  }}
                >
                  <div
                    className="absolute top-1/2 left-full -translate-x-1/2 -translate-y-1/2 rounded-full"
                    style={{
                      width: SEMI_DIAMETER,
                      height: SEMI_DIAMETER,
                      background: isDark
                        ? `radial-gradient(circle at 50% 50%, ${cat.color}35 0%, ${circleBg} 55%, ${circleBg} 100%)`
                        : `radial-gradient(circle at 50% 50%, ${cat.color}55 0%, ${circleBg} 50%, ${cat.color}25 100%)`,
                      boxShadow: `0 0 60px ${cat.color}${isDark ? "20" : "15"}`,
                    }}
                  >
                    <div
                      className="absolute rounded-full"
                      style={{
                        inset: "16%",
                        backgroundColor: isDark
                          ? categoryDarkBg[category] ?? cat.bg_color
                          : cat.bg_color,
                        opacity: 0.95,
                      }}
                    />
                  </div>
                </div>

                {/* Orbit anchor = semi-circle center (screen right edge) */}
                <div
                  className="fixed top-1/2 right-0 z-20 -translate-y-1/2"
                  style={{ width: 0, height: 0 }}
                >
                  {/* Menu dots on outer semi-circle arc */}
                  {recipeList.map((recipe, i) => {
                    const layout = orbitLayouts[i];
                    if (!layout) return null;

                    return (
                      <motion.button
                        type="button"
                        key={`orbit-${recipe.id}`}
                        className="absolute flex cursor-pointer items-center justify-center rounded-full text-4xl"
                        style={{
                          width: MENU_DOT_BASE,
                          height: MENU_DOT_BASE,
                          zIndex: layout.isActive ? 14 : 10,
                          backgroundColor: circleBg,
                          boxShadow: layout.isActive
                            ? `0 0 28px ${cat.color}${isDark ? "35" : "25"}`
                            : `0 0 16px ${cat.color}${isDark ? "18" : "12"}`,
                          border: `2px solid ${cat.color}${layout.isActive ? (isDark ? "70" : "60") : isDark ? "40" : "35"}`,
                          willChange: "transform, opacity",
                        }}
                        animate={{
                          x: layout.x - MENU_DOT_SIZE / 2,
                          y: layout.y - MENU_DOT_SIZE / 2,
                          scale: layout.scale,
                          opacity: layout.opacity,
                        }}
                        transition={{ duration: 0.55, ease: EASE_CINEMATIC }}
                        whileHover={{ scale: layout.scale * 1.1, opacity: 1 }}
                        onClick={() => selectRecipe(i)}
                        aria-label={recipe.name}
                        aria-current={layout.isActive ? "true" : undefined}
                        title={recipe.name}
                      >
                        {recipeEmoji[recipe.id] ?? "🍽️"}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Hero circle — in front of semi, slightly inset */}
                <div
                  className="fixed top-1/2 z-30 -translate-y-1/2"
                  style={{ right: HUB_INSET, width: 0, height: 0 }}
                >
                  <AnimatePresence mode="wait">
                    <motion.button
                      type="button"
                      key={currentRecipe.id}
                      layoutId={`food-image-${currentRecipe.id}`}
                      className="absolute flex cursor-pointer items-center justify-center rounded-full text-7xl"
                      style={{
                        width: HERO_CIRCLE_SIZE,
                        height: HERO_CIRCLE_SIZE,
                        left: -heroRadius,
                        top: -heroRadius,
                        backgroundColor: circleBg,
                        boxShadow: `0 0 80px ${cat.color}${isDark ? "28" : "18"}, 0 0 30px ${cat.color}12, inset 0 0 50px ${cat.color}10`,
                        border: `3px solid ${cat.color}${isDark ? "65" : "55"}`,
                        willChange: "transform, opacity",
                      }}
                      initial={{ scale: 0.9, opacity: 0.6 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      transition={{ duration: 0.45, ease: EASE_STANDARD }}
                      whileHover={{ scale: 1.04 }}
                      onClick={() => {
                        setViewState(2);
                        setSelectedRecipeId(currentRecipe.id);
                      }}
                      aria-label={`${currentRecipe.name} 상세 보기`}
                    >
                      {recipeEmoji[currentRecipe.id] ?? "🍽️"}
                    </motion.button>
                  </AnimatePresence>
                </div>

                <div
                  className="pointer-events-none fixed inset-0 z-0"
                  style={{
                    background: `radial-gradient(circle at 100% 50%, ${cat.color}${isDark ? "10" : "06"} 0%, transparent 38%)`,
                  }}
                />
              </div>

              {/* Scroll hint */}
              {recipeList.length > 1 && (
                <p
                  className="absolute bottom-6 left-14 text-[10px] tracking-[0.18em] uppercase"
                  style={{ color: "var(--text-faint)" }}
                >
                  Scroll to change menu
                </p>
              )}
            </motion.div>
          ) : viewState === 2 && currentRecipe ? (
            /* ===== State 2: Detail View ===== */
            <motion.div
              key={`detail-${currentRecipe.id}`}
              className="flex flex-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* Left — Ingredients */}
              <motion.div
                className="flex w-[240px] shrink-0 flex-col p-6"
                style={{ borderRight: "1px solid var(--border)" }}
                {...detailEnter(0.1)}
              >
                <motion.div
                  layoutId={`food-image-${currentRecipe.id}`}
                  className="mb-5 flex h-[130px] w-[130px] items-center justify-center self-center rounded-full text-5xl"
                  style={{
                    backgroundColor: circleBg,
                    boxShadow: `0 0 60px ${cat.color}20`,
                    willChange: "transform, opacity",
                  }}
                >
                  {recipeEmoji[currentRecipe.id] ?? "🍽️"}
                </motion.div>
                <h3
                  className="mb-1 text-center text-xl font-bold"
                  style={{
                    color: "var(--text-primary)",
                    fontFamily: "var(--font-serif), serif",
                  }}
                >
                  {currentRecipe.name}
                </h3>
                <p
                  className="mb-6 text-center text-xs"
                  style={{ color: "var(--text-faint)" }}
                >
                  {currentRecipe.subtitle}
                </p>

                <h4
                  className="mb-3 text-[10px] uppercase tracking-[0.2em]"
                  style={{ color: "#c8a96e" }}
                >
                  Ingredients
                </h4>
                <ul className="flex flex-col gap-2.5">
                  {ingredients.map((ing, i) => (
                    <motion.li
                      key={ing.id}
                      className="flex items-center gap-3 text-sm"
                      initial={{ opacity: 0, x: -12 }}
                      animate={{
                        opacity: 1,
                        x: 0,
                        transition: {
                          delay: 0.25 + i * 0.06,
                          duration: 0.35,
                          ease: EASE_CINEMATIC,
                        },
                      }}
                    >
                      <span
                        className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-full text-base"
                        style={{ backgroundColor: `${cat.color}15` }}
                      >
                        {ing.emoji}
                      </span>
                      <span className="flex flex-col">
                        <span style={{ color: "var(--text-primary)" }}>{ing.name}</span>
                        {ing.amount && (
                          <span
                            className="text-[11px]"
                            style={{ color: "var(--text-faint)" }}
                          >
                            {ing.amount}
                          </span>
                        )}
                      </span>
                    </motion.li>
                  ))}
                  {ingredients.length === 0 && (
                    <li className="text-xs" style={{ color: "var(--text-faint)" }}>
                      No ingredients listed
                    </li>
                  )}
                </ul>
              </motion.div>

              {/* Center — Steps */}
              <motion.div
                className="flex flex-1 flex-col overflow-y-auto p-8"
                {...detailEnter(0.2)}
              >
                <h4
                  className="mb-8 text-[10px] uppercase tracking-[0.2em]"
                  style={{ color: "#c8a96e" }}
                >
                  Cooking Steps
                </h4>
                {steps.length > 0 ? (
                  <div className="flex flex-col gap-10">
                    {steps.map((step) => (
                      <div key={step.id}>
                        <p
                          className="mb-2 text-[10px] uppercase tracking-[0.2em]"
                          style={{ color: `${cat.color}` }}
                        >
                          Step {step.step_number}
                        </p>
                        <h5
                          className="mb-2 text-lg font-semibold"
                          style={{
                            color: "var(--text-primary)",
                            fontFamily: "var(--font-serif), serif",
                          }}
                        >
                          {step.title}
                        </h5>
                        <p
                          className="text-sm leading-[1.9]"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {step.description}
                        </p>
                        {step.tip && (
                          <div
                            className="mt-4 rounded-r-lg py-3 pl-4 pr-3"
                            style={{
                              borderLeft: "3px solid rgba(200,169,110,0.6)",
                              backgroundColor: "rgba(200,169,110,0.06)",
                            }}
                          >
                            <p className="mb-1 text-[10px] font-semibold tracking-[0.15em] text-[#c8a96e]">
                              TIP
                            </p>
                            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                              {step.tip}
                            </p>
                            {step.tip_items.length > 0 && (
                              <ul className="mt-2 space-y-1 pl-3 text-sm">
                                {step.tip_items.map((item, i) => (
                                  <li
                                    key={i}
                                    className="flex items-start gap-2"
                                    style={{ color: "var(--text-muted)" }}
                                  >
                                    <span className="mt-1.5 block h-1 w-1 shrink-0 rounded-full bg-[#c8a96e]/40" />
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm" style={{ color: "var(--text-faint)" }}>
                    No cooking steps available.
                  </p>
                )}
              </motion.div>

              {/* Right — YouTube */}
              <motion.div
                className="flex w-[360px] shrink-0 flex-col"
                style={{
                  borderLeft: "1px solid var(--border)",
                  backgroundColor: "var(--overlay-bg)",
                }}
                {...detailEnter(0.3)}
              >
                {currentRecipe.youtube_video_id ? (
                  <div className="relative flex-1">
                    <iframe
                      className="absolute inset-0 h-full w-full"
                      src={`https://www.youtube.com/embed/${currentRecipe.youtube_video_id}?rel=0&mute=1&autoplay=1`}
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                      title={`${currentRecipe.name} cooking video`}
                    />
                  </div>
                ) : (
                  <div className="flex flex-1 flex-col items-center justify-center gap-4">
                    <span className="text-6xl" style={{ opacity: 0.3 }}>🎬</span>
                    <p className="text-sm tracking-wide" style={{ color: "var(--text-faint)" }}>
                      Video coming soon
                    </p>
                  </div>
                )}
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Close button */}
        {viewState === 2 && (
          <motion.button
            onClick={() => {
              setViewState(1);
              setSelectedRecipeId(null);
            }}
            className="absolute right-5 top-5 z-20 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-sm transition-colors"
            style={{
              backgroundColor: "var(--surface)",
              color: "var(--text-muted)",
            }}
            aria-label="Close"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.4 } }}
          >
            ✕
          </motion.button>
        )}
      </main>
    </div>
  );
}
