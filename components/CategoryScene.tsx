"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  EASE_CINEMATIC,
  EASE_STANDARD,
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

const SEMI_DIAMETER = 940;
const SEMI_RADIUS = SEMI_DIAMETER / 2;
const HERO_CIRCLE_SIZE = 420;
const MENU_DOT_SIZE = 100;
const MENU_DOT_BASE = 100;
const ORBIT_GAP = 24;
const ORBIT_RADIUS = SEMI_RADIUS + MENU_DOT_SIZE / 2 + ORBIT_GAP;
const ORBIT_ANGLE_STEP = Math.PI * 0.11;
const VISIBLE_SIDE = 2;
const STAGE_INSET = 48;
const HUB_INSET = HERO_CIRCLE_SIZE * 0.55;

// Cinematic transition
const CINEMA_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const CT = `1.2s ${CINEMA_EASE}`;

// Detail layout
const DETAIL_EMOJI_SIZE = 280;

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
  rotationStep: number,
  _total: number
): OrbitItemLayout {
  const angle = Math.PI + (index - rotationStep) * ORBIT_ANGLE_STEP;
  const x = Math.cos(angle) * ORBIT_RADIUS;
  const y = Math.sin(angle) * ORBIT_RADIUS;
  let angleDist = angle - Math.PI;
  angleDist = angleDist - Math.round(angleDist / (2 * Math.PI)) * 2 * Math.PI;
  const stepDist = Math.round(Math.abs(angleDist / ORBIT_ANGLE_STEP));
  const isActive = stepDist === 0;
  const visible = stepDist <= VISIBLE_SIDE;

  return {
    index,
    x,
    y,
    opacity: !visible ? 0 : isActive ? 1 : stepDist === 1 ? 0.85 : 0.6,
    scale: isActive ? 1.12 : stepDist === 1 ? 1 : 0.9,
    isActive,
  };
}

interface CategorySceneProps {
  category: string;
  visible: boolean;
  visitKey: number;
}

export function CategoryScene({ category, visible, visitKey }: CategorySceneProps) {
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

  const isDetail = viewState === 2;

  const [rotationStep, setRotationStep] = useState(0);
  const rotationStepRef = useRef(0);
  const scrollLockRef = useRef(false);
  const isAnimatingRef = useRef(isAnimating);
  const selectedMenuIndexRef = useRef(selectedMenuIndex);
  const recipeListLenRef = useRef(recipeList.length);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => { isAnimatingRef.current = isAnimating; }, [isAnimating]);
  useEffect(() => { selectedMenuIndexRef.current = selectedMenuIndex; }, [selectedMenuIndex]);
  useEffect(() => { recipeListLenRef.current = recipeList.length; }, [recipeList.length]);
  useEffect(() => { rotationStepRef.current = rotationStep; }, [rotationStep]);

  // Reset on every visit
  useEffect(() => {
    setSelectedMenuIndex(0);
    setViewState(1);
    setIsAnimating(false);
    setSelectedRecipeId(null);
    setRotationStep(0);
    rotationStepRef.current = 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visitKey]);

  const currentRecipe = recipeList[selectedMenuIndex];
  const ingredients = currentRecipe ? getIngredientsByRecipe(currentRecipe.id) : [];
  const steps = currentRecipe ? getStepsByRecipe(currentRecipe.id) : [];

  const heroRadius = HERO_CIRCLE_SIZE / 2;
  const orbitLayouts = useMemo(
    () => recipeList.map((_, i) => getOrbitLayout(i, rotationStep, recipeList.length)),
    [recipeList, rotationStep]
  );

  const navigateMenu = useCallback(
    (direction: 1 | -1) => {
      if (isAnimatingRef.current || recipeListLenRef.current === 0) return;
      const next = selectedMenuIndexRef.current + direction;
      if (next < 0 || next >= recipeListLenRef.current) return;
      setIsAnimating(true);
      setRotationStep(next);
      rotationStepRef.current = next;
      setSelectedMenuIndex(next);
      setTimeout(() => setIsAnimating(false), 900);
    },
    [setIsAnimating, setSelectedMenuIndex]
  );

  useEffect(() => {
    if (viewState !== 1 || !visible) return;
    const el = mainRef.current;
    if (!el) return;
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (scrollLockRef.current || isAnimatingRef.current) return;
      if (Math.abs(e.deltaY) < 15) return;
      scrollLockRef.current = true;
      navigateMenu(e.deltaY > 0 ? 1 : -1);
      setTimeout(() => { scrollLockRef.current = false; }, 900);
    };
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [viewState, navigateMenu, visible]);

  useEffect(() => {
    if (!visible) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && viewState === 2) {
        setViewState(1);
        setSelectedRecipeId(null);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [viewState, setViewState, setSelectedRecipeId, visible]);

  const selectRecipe = useCallback(
    (index: number) => {
      if (isAnimatingRef.current || index === selectedMenuIndexRef.current) return;
      setIsAnimating(true);
      setRotationStep(index);
      rotationStepRef.current = index;
      setSelectedMenuIndex(index);
      if (viewState === 2) {
        setViewState(1);
        setSelectedRecipeId(null);
      }
      setTimeout(() => setIsAnimating(false), 900);
    },
    [setIsAnimating, setSelectedMenuIndex, setViewState, setSelectedRecipeId, viewState]
  );

  if (!cat) {
    return (
      <div className="flex h-full items-center justify-center" style={{ background: "var(--bg)" }}>
        <p style={{ color: "var(--text-muted)" }}>Category not found</p>
      </div>
    );
  }

  const circleBg = isDark ? (categoryDarkBg[category] ?? cat.bg_color) : cat.bg_color;

  const circleGradientCarousel = isDark
    ? `radial-gradient(circle at 50% 50%, ${cat.color}35 0%, ${circleBg} 55%, ${circleBg} 100%)`
    : `radial-gradient(circle at 50% 50%, ${cat.color}55 0%, ${circleBg} 50%, ${cat.color}25 100%)`;
  const circleGradientDetail = isDark
    ? `linear-gradient(160deg, #1e1e1e 0%, #2a2a2a 100%)`
    : `linear-gradient(160deg, #3a3a3a 0%, #4a4a4a 100%)`;

  // Three-state position helpers
  const circlePos = !visible
    ? {
        left: "calc(100% + 200px)",
        top: `calc(50% - ${SEMI_RADIUS}px)`,
        width: SEMI_DIAMETER,
        height: SEMI_DIAMETER,
        borderRadius: "50%",
      }
    : isDetail
      ? { left: 0, top: 0, width: "50%", height: "100%", borderRadius: 0 }
      : {
          left: `calc(100% - ${STAGE_INSET + SEMI_RADIUS}px)`,
          top: `calc(50% - ${SEMI_RADIUS}px)`,
          width: SEMI_DIAMETER,
          height: SEMI_DIAMETER,
          borderRadius: "50%",
        };

  const emojiPos = !visible
    ? {
        left: "calc(100% + 200px)",
        top: `calc(50% - ${heroRadius}px)`,
        width: HERO_CIRCLE_SIZE,
        height: HERO_CIRCLE_SIZE,
        transform: "rotate(0deg)",
      }
    : isDetail
      ? {
          left: "calc(25% - 140px)",
          top: 20,
          width: DETAIL_EMOJI_SIZE,
          height: DETAIL_EMOJI_SIZE,
          transform: "rotate(360deg)",
        }
      : {
          left: `calc(100% - ${STAGE_INSET + HUB_INSET + heroRadius}px)`,
          top: `calc(50% - ${heroRadius}px)`,
          width: HERO_CIRCLE_SIZE,
          height: HERO_CIRCLE_SIZE,
          transform: "rotate(0deg)",
        };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Animated background */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-0"
        animate={{
          background: isDetail
            ? isDark
              ? `radial-gradient(ellipse at 50% 50%, #1a1a1a 0%, #0a0a0a 60%, #000 100%)`
              : `radial-gradient(ellipse at 50% 50%, #f5f3ef 0%, #eae7e1 60%, #e0ddd6 100%)`
            : isDark
              ? `radial-gradient(ellipse at 80% 50%, ${cat.color}12 0%, transparent 50%), #0d0d0d`
              : `radial-gradient(ellipse at 80% 50%, ${cat.color}08 0%, transparent 50%), #faf9f7`,
        }}
        transition={{ duration: 1, ease: EASE_CINEMATIC }}
      />

      <main ref={mainRef} className="relative z-10 flex flex-1 overflow-x-hidden overflow-y-hidden">

        {/* ═══ BIG CIRCLE → DETAIL LEFT BG ═══ */}
        <div
          style={{
            position: "absolute",
            zIndex: 1,
            overflow: "hidden",
            willChange: "left, top, width, height, border-radius",
            transition: [
              `left ${CT}`, `top ${CT}`, `width ${CT}`, `height ${CT}`,
              `border-radius ${CT}`, `box-shadow ${CT}`,
            ].join(", "),
            boxShadow: isDetail
              ? "none"
              : `0 0 60px ${cat.color}${isDark ? "20" : "15"}`,
            ...circlePos,
          }}
        >
          {/* Carousel gradient layer */}
          <div
            style={{
              position: "absolute", inset: 0,
              background: circleGradientCarousel,
              opacity: isDetail ? 0 : 1,
              transition: `opacity ${CT}`,
            }}
          />
          {/* Detail gradient layer */}
          <div
            style={{
              position: "absolute", inset: 0,
              background: circleGradientDetail,
              opacity: isDetail ? 1 : 0,
              transition: `opacity ${CT}`,
            }}
          />
          {/* Inner lighter ring */}
          <div
            style={{
              position: "absolute",
              borderRadius: "50%",
              backgroundColor: circleBg,
              transition: `opacity ${CT}, inset ${CT}`,
              ...(isDetail ? { inset: 0, opacity: 0 } : { inset: "16%", opacity: 0.95 }),
            }}
          />
        </div>

        {/* ═══ ORBIT DOTS ═══ */}
        <motion.div
          className="absolute z-20"
          style={{
            right: STAGE_INSET,
            top: "50%",
            width: 0,
            height: 0,
            pointerEvents: isDetail ? "none" : "auto",
          }}
          initial={{ x: "100vw" }}
          animate={
            visible
              ? { x: 0, opacity: isDetail ? 0 : 1 }
              : { x: "100vw", opacity: 0 }
          }
          transition={{ duration: 1.2, ease: EASE_CINEMATIC }}
        >
          {recipeList.map((recipe, i) => {
            const layout = orbitLayouts[i];
            if (!layout) return null;
            return (
              <motion.button
                type="button"
                key={`orbit-${recipe.id}`}
                className="absolute flex cursor-pointer items-center justify-center rounded-full text-3xl"
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
                transition={{ duration: 1.1, ease: EASE_CINEMATIC }}
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
        </motion.div>

        {/* ═══ HERO EMOJI ═══ */}
        <div
          style={{
            position: "absolute",
            zIndex: 30,
            overflow: "hidden",
            borderRadius: "50%",
            willChange: "left, top, width, height, transform",
            transition: [
              `left ${CT}`, `top ${CT}`, `width ${CT}`, `height ${CT}`,
              `transform ${CT}`, `box-shadow ${CT}`,
            ].join(", "),
            backgroundColor: circleBg,
            border: `3px solid ${cat.color}${isDark ? "65" : "55"}`,
            boxShadow: isDetail
              ? `0 0 60px rgba(0,0,0,0.4), 0 0 30px ${cat.color}15`
              : `0 0 80px ${cat.color}${isDark ? "28" : "18"}, 0 0 30px ${cat.color}12, inset 0 0 50px ${cat.color}10`,
            ...emojiPos,
          }}
        >
          {currentRecipe && (
            <AnimatePresence initial={false}>
              <motion.button
                type="button"
                key={currentRecipe.id}
                className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full"
                style={{
                  willChange: "transform",
                  pointerEvents: isDetail ? "none" : "auto",
                  cursor: isDetail ? "default" : "pointer",
                }}
                initial={{ x: HERO_CIRCLE_SIZE }}
                animate={{ x: 0 }}
                exit={{ x: HERO_CIRCLE_SIZE }}
                transition={{ duration: 1.1, ease: EASE_CINEMATIC }}
                whileHover={isDetail ? {} : { scale: 1.04 }}
                onClick={() => {
                  if (!isDetail && currentRecipe) {
                    setViewState(2);
                    setSelectedRecipeId(currentRecipe.id);
                  }
                }}
                aria-label={currentRecipe ? `${currentRecipe.name} 상세 보기` : ""}
              >
                <span
                  style={{
                    fontSize: isDetail ? "7rem" : "4.5rem",
                    transition: `font-size ${CT}`,
                    lineHeight: 1,
                  }}
                >
                  {recipeEmoji[currentRecipe.id] ?? "🍽️"}
                </span>
              </motion.button>
            </AnimatePresence>
          )}
        </div>

        {/* ═══ CAROUSEL LEFT TEXT ═══ */}
        <motion.div
          className="absolute left-0 top-0 z-10 flex h-full flex-col justify-center"
          style={{
            width: "42%",
            pointerEvents: visible && !isDetail ? "auto" : "none",
          }}
          initial={{ x: "-100vw" }}
          animate={
            !visible
              ? { x: "-100vw", opacity: 0 }
              : isDetail
                ? { x: -60, opacity: 0 }
                : { x: 0, opacity: 1 }
          }
          transition={{ duration: 1.2, ease: EASE_CINEMATIC }}
        >
          <div className="px-10 pl-14 lg:px-16 lg:pl-20">
            {currentRecipe && (
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
                    <p className="mb-5 text-lg" style={{ color: "var(--text-muted)" }}>
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
            )}
          </div>
        </motion.div>

        {/* ═══ DETAIL CONTENT OVERLAY ═══ */}
        <motion.div
          className="absolute inset-0"
          style={{
            zIndex: isDetail ? 25 : -1,
            pointerEvents: isDetail ? "auto" : "none",
          }}
          initial={false}
          animate={{ opacity: isDetail ? 1 : 0 }}
          transition={{
            duration: 0.5,
            delay: isDetail ? 0.5 : 0,
            ease: EASE_CINEMATIC,
          }}
        >
          {currentRecipe && (
            <div className="flex h-full">
              {/* Left 50% — dark bg from circle morph */}
              <div className="flex w-1/2 flex-col overflow-hidden">
                {/* Top: large food plate area (emoji lives here via absolute pos) */}
                <div style={{ height: "45%", minHeight: 240 }} />

                {/* Bottom: Ingredients | Steps */}
                <div className="flex flex-1 gap-0 overflow-hidden">
                  {/* Ingredients column */}
                  <div className="flex w-[160px] shrink-0 flex-col gap-5 overflow-y-auto py-4 pl-6 pr-3">
                    {ingredients.map((ing, i) => (
                      <motion.div
                        key={ing.id}
                        className="flex flex-col items-center gap-2"
                        initial={{ opacity: 0, y: 12 }}
                        animate={
                          isDetail
                            ? {
                                opacity: 1,
                                y: 0,
                                transition: {
                                  delay: 0.6 + i * 0.08,
                                  duration: 0.4,
                                  ease: EASE_CINEMATIC,
                                },
                              }
                            : { opacity: 0, y: 12 }
                        }
                      >
                        <span
                          className="flex h-[52px] w-[52px] items-center justify-center rounded-full text-xl"
                          style={{
                            backgroundColor: `${cat.color}18`,
                            border: `1px solid ${cat.color}30`,
                          }}
                        >
                          {ing.emoji}
                        </span>
                        <span
                          className="text-center text-xs leading-tight"
                          style={{ color: "rgba(255,255,255,0.85)" }}
                        >
                          {ing.name}
                        </span>
                      </motion.div>
                    ))}
                    {ingredients.length === 0 && (
                      <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                        No ingredients
                      </p>
                    )}
                  </div>

                  {/* Steps column */}
                  <div className="flex-1 overflow-y-auto py-4 pr-6 pl-4">
                    {steps.length > 0 ? (
                      <div className="flex flex-col gap-6">
                        {steps.map((step, i) => (
                          <motion.div
                            key={step.id}
                            initial={{ opacity: 0, y: 16 }}
                            animate={
                              isDetail
                                ? {
                                    opacity: 1,
                                    y: 0,
                                    transition: {
                                      delay: 0.7 + i * 0.1,
                                      duration: 0.4,
                                      ease: EASE_CINEMATIC,
                                    },
                                  }
                                : { opacity: 0, y: 16 }
                            }
                          >
                            <h5
                              className="mb-2 text-sm font-bold"
                              style={{
                                color: "rgba(255,255,255,0.95)",
                                fontFamily: "var(--font-serif), serif",
                              }}
                            >
                              Step {step.step_number}
                            </h5>
                            <p
                              className="text-[13px] leading-[1.9]"
                              style={{ color: "rgba(255,255,255,0.6)" }}
                            >
                              {step.description}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
                        No cooking steps available.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Right 50% — Video */}
              <motion.div
                className="flex w-1/2 flex-col"
                style={{ backgroundColor: "#000" }}
                initial={false}
                animate={
                  isDetail
                    ? { x: 0, opacity: 1 }
                    : { x: 100, opacity: 0 }
                }
                transition={{
                  duration: 0.8,
                  delay: isDetail ? 0.6 : 0,
                  ease: EASE_CINEMATIC,
                }}
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
                    <p className="text-sm tracking-wide" style={{ color: "rgba(255,255,255,0.35)" }}>
                      Video coming soon
                    </p>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </motion.div>

        {/* Background glow */}
        <div
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background: `radial-gradient(circle at calc(100% - ${STAGE_INSET}px) 50%, ${cat.color}${isDark ? "10" : "06"} 0%, transparent 38%)`,
            opacity: visible && !isDetail ? 1 : 0,
            transition: "opacity 0.6s ease",
          }}
        />

        {/* Scroll hint */}
        {recipeList.length > 1 && (
          <p
            className="absolute bottom-6 left-14 z-10 text-[10px] tracking-[0.18em] uppercase"
            style={{
              color: "var(--text-faint)",
              opacity: visible && !isDetail ? 1 : 0,
              transition: "opacity 0.5s ease",
              pointerEvents: "none",
            }}
          >
            Scroll to change menu
          </p>
        )}
      </main>
    </div>
  );
}
