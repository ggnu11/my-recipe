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
} from "@/lib/mock-data";
import { useShowcaseStore } from "@/store/showcaseStore";

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
  const wasDetailRef = useRef(false);

  const [rotationStep, setRotationStep] = useState(0);
  const rotationStepRef = useRef(0);
  const scrollLockRef = useRef(false);
  const isAnimatingRef = useRef(isAnimating);
  const selectedMenuIndexRef = useRef(selectedMenuIndex);
  const recipeListLenRef = useRef(recipeList.length);
  const mainRef = useRef<HTMLElement>(null);

  // Container size for transform calculations
  const [cSize, setCSize] = useState({ w: 1440, h: 900 });
  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    const update = () => setCSize({ w: el.clientWidth, h: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => { wasDetailRef.current = isDetail; }, [isDetail]);
  useEffect(() => { isAnimatingRef.current = isAnimating; }, [isAnimating]);
  useEffect(() => { selectedMenuIndexRef.current = selectedMenuIndex; }, [selectedMenuIndex]);
  useEffect(() => { recipeListLenRef.current = recipeList.length; }, [recipeList.length]);
  useEffect(() => { rotationStepRef.current = rotationStep; }, [rotationStep]);

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

  const circleBg = "#383941";
  const smallCircleBg = "#fff";

  const cinematic = { duration: 1.2, ease: EASE_CINEMATIC };

  // === MORPH CALCULATIONS (transform-based, GPU only) ===
  // Phase 1: semi-circle → full viewport
  const fullDx = -cSize.w / 2 + STAGE_INSET;
  const fullScaleX = cSize.w / SEMI_DIAMETER;
  const fullScaleY = cSize.h / SEMI_DIAMETER;
  // Phase 2: full viewport → left 50%
  const halfDx = cSize.w * 0.25 - (cSize.w - STAGE_INSET);
  const halfScaleX = (cSize.w * 0.5) / SEMI_DIAMETER;

  // Detail hero: moves to top-left, bottom half visible (center at viewport top)
  const heroDetailDx = cSize.w * 0.25 - (cSize.w - STAGE_INSET - HUB_INSET);
  const heroDetailDy = -cSize.h / 2;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Animated background */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-0"
        animate={{
          background: isDetail
            ? `radial-gradient(ellipse at 50% 50%, #f5f3ef 0%, #eae7e1 60%, #e0ddd6 100%)`
            : `radial-gradient(ellipse at 80% 50%, ${cat.color}08 0%, transparent 50%), #ffffff`,
        }}
        transition={{ duration: 1, ease: EASE_CINEMATIC }}
      />

      <main ref={mainRef} className="relative z-10 flex flex-1 overflow-x-hidden overflow-y-hidden">

        {/* ═══ BIG CIRCLE — morphs via transform (GPU composited) ═══ */}
        <motion.div
          className="pointer-events-none absolute z-[2] overflow-hidden"
          style={{
            left: `calc(100% - ${STAGE_INSET + SEMI_RADIUS}px)`,
            top: `calc(50% - ${SEMI_RADIUS}px)`,
            width: SEMI_DIAMETER,
            height: SEMI_DIAMETER,
            backgroundColor: circleBg,
            willChange: "transform, opacity",
          }}
          initial={{ x: "100vw", opacity: 0 }}
          animate={
            !visible
              ? { x: "100vw", opacity: 0, scaleX: 1, scaleY: 1, borderRadius: "50%" }
              : isDetail
                ? {
                    x: [0, fullDx, halfDx],
                    scaleX: [1, fullScaleX, halfScaleX],
                    scaleY: [1, fullScaleY, fullScaleY],
                    borderRadius: ["50%", "0%", "0%"],
                    opacity: 1,
                  }
                : { x: 0, scaleX: 1, scaleY: 1, borderRadius: "50%", opacity: 1 }
          }
          transition={
            isDetail
              ? { duration: 1.8, ease: EASE_CINEMATIC, times: [0, 0.5, 1] }
              : cinematic
          }
        />

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
          initial={{ x: "100vw", rotate: 120 }}
          animate={
            visible
              ? { x: 0, rotate: 0, opacity: isDetail ? 0 : 1 }
              : { x: "100vw", rotate: 120, opacity: 0 }
          }
          transition={cinematic}
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
                  backgroundColor: smallCircleBg,
                  boxShadow: layout.isActive
                    ? `0 0 28px ${cat.color}25`
                    : `0 0 16px ${cat.color}12`,
                  border: `2px solid ${cat.color}${layout.isActive ? "60" : "35"}`,
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

        {/* ═══ HERO CIRCLE CLIP — slides hero in/out on menu change (carousel only) ═══ */}
        <motion.div
          className="absolute z-30 overflow-hidden rounded-full"
          style={{
            left: `calc(100% - ${STAGE_INSET + SEMI_RADIUS}px)`,
            top: `calc(50% - ${SEMI_RADIUS}px)`,
            width: SEMI_DIAMETER,
            height: SEMI_DIAMETER,
            pointerEvents: "none",
            willChange: "transform, opacity",
          }}
          initial={{ x: "100vw", opacity: 0 }}
          animate={
            !visible
              ? { x: "100vw", opacity: 0 }
              : { x: 0, opacity: isDetail ? 0 : 1 }
          }
          transition={{
            ...cinematic,
            opacity: isDetail
              ? { duration: 0 }
              : wasDetailRef.current
                ? { duration: 0, delay: cinematic.duration }
                : { duration: 0 },
          }}
        >
          {currentRecipe && (
            <AnimatePresence>
              <motion.button
                type="button"
                key={currentRecipe.id}
                className="absolute flex cursor-pointer items-center justify-center rounded-full text-7xl"
                style={{
                  width: HERO_CIRCLE_SIZE,
                  height: HERO_CIRCLE_SIZE,
                  left: SEMI_RADIUS - HUB_INSET - heroRadius,
                  top: SEMI_RADIUS - heroRadius,
                  backgroundColor: smallCircleBg,
                  border: `3px solid ${cat.color}55`,
                  boxShadow: `0 0 80px ${cat.color}18, 0 0 30px ${cat.color}12, inset 0 0 50px ${cat.color}10`,
                  willChange: "transform",
                  pointerEvents: "auto",
                }}
                initial={{ x: SEMI_DIAMETER, zIndex: 1 }}
                animate={{ x: 0, zIndex: 2 }}
                exit={{ x: SEMI_DIAMETER, zIndex: 3 }}
                transition={{ duration: 1.1, ease: EASE_CINEMATIC }}
                whileHover={{ scale: 1.04 }}
                onClick={() => {
                  if (!isDetail && currentRecipe) {
                    setViewState(2);
                    setSelectedRecipeId(currentRecipe.id);
                  }
                }}
                aria-label={`${currentRecipe.name} 상세 보기`}
              >
                {recipeEmoji[currentRecipe.id] ?? "🍽️"}
              </motion.button>
            </AnimatePresence>
          )}
        </motion.div>

        {/* ═══ DETAIL HERO — morphs from carousel position (standalone) ═══ */}
        <motion.div
          className="absolute z-30 overflow-hidden rounded-full"
          style={{
            left: `calc(100% - ${STAGE_INSET + HUB_INSET + heroRadius}px)`,
            top: `calc(50% - ${heroRadius}px)`,
            width: HERO_CIRCLE_SIZE,
            height: HERO_CIRCLE_SIZE,
            backgroundColor: smallCircleBg,
            border: `3px solid ${cat.color}55`,
            boxShadow: `0 0 80px ${cat.color}18, 0 0 30px ${cat.color}12, inset 0 0 50px ${cat.color}10`,
            willChange: "transform, opacity",
            pointerEvents: isDetail ? "none" : "none",
          }}
          initial={false}
          animate={
            isDetail
              ? { x: heroDetailDx, y: heroDetailDy, scale: 1, rotate: 360, opacity: 1 }
              : { x: 0, y: 0, scale: 1, rotate: 0, opacity: 0 }
          }
          transition={
            isDetail
              ? { duration: 1.8, delay: 0, ease: EASE_CINEMATIC, opacity: { duration: 0 } }
              : { ...cinematic, opacity: { duration: 0, delay: cinematic.duration } }
          }
        >
          {currentRecipe && (
            <span className="flex h-full w-full items-center justify-center text-7xl">
              {recipeEmoji[currentRecipe.id] ?? "🍽️"}
            </span>
          )}
        </motion.div>

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
          transition={cinematic}
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
                        color: "#fff",
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
            delay: isDetail ? 1.4 : 0,
            ease: EASE_CINEMATIC,
          }}
        >
          {currentRecipe && (
            <div className="flex h-full">
              {/* Left 50% — over morphed circle background */}
              <div className="flex w-1/2 flex-col overflow-hidden">
                {/* Spacer for traveling emoji plate */}
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
                                  delay: 1.5 + i * 0.08,
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
                          style={{ color: "#fff" }}
                        >
                          {ing.name}
                        </span>
                      </motion.div>
                    ))}
                    {ingredients.length === 0 && (
                      <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
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
                                      delay: 1.6 + i * 0.1,
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
                                color: "#fff",
                                fontFamily: "var(--font-serif), serif",
                              }}
                            >
                              Step {step.step_number}
                            </h5>
                            <p
                              className="text-[13px] leading-[1.9]"
                              style={{ color: "rgba(255,255,255,0.75)" }}
                            >
                              {step.description}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
                        No cooking steps available.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Right 50% — Video */}
              <motion.div
                className="flex w-1/2 flex-col"
                style={{
                  backgroundColor: "var(--overlay-bg)",
                }}
                initial={false}
                animate={
                  isDetail
                    ? { x: 0, opacity: 1 }
                    : { x: 100, opacity: 0 }
                }
                transition={{
                  duration: 0.8,
                  delay: isDetail ? 1.2 : 0,
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
                    <p className="text-sm tracking-wide" style={{ color: "var(--text-faint)" }}>
                      Video coming soon
                    </p>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </motion.div>

        {/* Background glow */}
        <motion.div
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background: `radial-gradient(circle at calc(100% - ${STAGE_INSET}px) 50%, ${cat.color}06 0%, transparent 38%)`,
          }}
          animate={{ opacity: visible && !isDetail ? 1 : 0 }}
          transition={{ duration: 0.6 }}
        />

        {/* Scroll hint */}
        {recipeList.length > 1 && (
          <motion.p
            className="absolute bottom-6 left-14 z-10 text-[10px] tracking-[0.18em] uppercase"
            style={{ color: "var(--text-faint)", pointerEvents: "none" }}
            animate={{ opacity: visible && !isDetail ? 1 : 0 }}
            transition={{ duration: 0.5 }}
          >
            Scroll to change menu
          </motion.p>
        )}
      </main>
    </div>
  );
}
