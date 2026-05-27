"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HomeScene } from "./HomeScene";
import { CategoryScene } from "./CategoryScene";
import { ThemeToggle } from "./ThemeToggle";
import { getCategoryBySlug } from "@/lib/mock-data";
import { useShowcaseStore } from "@/store/showcaseStore";

const DURATION = "1.6s";
const EASING = "cubic-bezier(0.16, 1, 0.3, 1)";

function getInitialScene(): { scene: "home" | "category"; category: string } {
  if (typeof window === "undefined") return { scene: "home", category: "korean" };
  const path = window.location.pathname;
  if (path === "/") return { scene: "home", category: "korean" };
  return { scene: "category", category: path.slice(1).split("/")[0] || "korean" };
}

export function SceneManager() {
  const initial = useRef(getInitialScene());
  const stripRef = useRef<HTMLDivElement>(null);
  const transitioningRef = useRef(false);

  const [homeVisible, setHomeVisible] = useState(initial.current.scene === "home");
  const [categoryVisible, setCategoryVisible] = useState(initial.current.scene === "category");
  const [category, setCategory] = useState(initial.current.category);
  const [visitKey, setVisitKey] = useState(0);

  // Browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      if (transitioningRef.current) return;
      const path = window.location.pathname;

      if (path === "/") {
        transitioningRef.current = true;
        setCategoryVisible(false);
        setHomeVisible(true);
        if (stripRef.current) {
          stripRef.current.style.transition = `transform ${DURATION} ${EASING}`;
          stripRef.current.style.transform = "translateY(-100vh)";
        }
      } else {
        const slug = path.slice(1).split("/")[0];
        transitioningRef.current = true;
        setCategory(slug);
        setVisitKey((k) => k + 1);
        setHomeVisible(false);
        setCategoryVisible(true);
        if (stripRef.current) {
          stripRef.current.style.transition = `transform ${DURATION} ${EASING}`;
          stripRef.current.style.transform = "translateY(0)";
        }
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleCategoryClick = useCallback((slug: string) => {
    if (transitioningRef.current) return;
    transitioningRef.current = true;
    window.history.pushState(null, "", `/${slug}`);
    setCategory(slug);
    setVisitKey((k) => k + 1);
    setHomeVisible(false);
    setCategoryVisible(true);
    if (stripRef.current) {
      stripRef.current.style.transition = `transform ${DURATION} ${EASING}`;
      stripRef.current.style.transform = "translateY(0)";
    }
  }, []);

  const viewState = useShowcaseStore((s) => s.viewState);
  const setViewState = useShowcaseStore((s) => s.setViewState);
  const setSelectedRecipeId = useShowcaseStore((s) => s.setSelectedRecipeId);

  const handleGoHome = useCallback(() => {
    if (transitioningRef.current) return;
    transitioningRef.current = true;
    window.history.pushState(null, "", "/");
    setCategoryVisible(false);
    setHomeVisible(true);
    if (stripRef.current) {
      stripRef.current.style.transition = `transform ${DURATION} ${EASING}`;
      stripRef.current.style.transform = "translateY(-100vh)";
    }
  }, []);

  const handleBack = useCallback(() => {
    if (viewState === 2) {
      setViewState(1);
      setSelectedRecipeId(null);
      return;
    }
    handleGoHome();
  }, [viewState, setViewState, setSelectedRecipeId, handleGoHome]);

  const handleTransitionEnd = useCallback((e: React.TransitionEvent) => {
    if (e.target !== stripRef.current) return;
    if (e.propertyName !== "transform") return;
    transitioningRef.current = false;
    if (stripRef.current) {
      stripRef.current.style.transition = "none";
    }
  }, []);

  const cat = getCategoryBySlug(category);

  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden", background: "var(--bg)" }}>
      {/* Shared header — stays in place during transitions */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-50 flex items-center px-8 py-5"
      >
        <div className="pointer-events-auto">
          <AnimatePresence>
            {categoryVisible && (
              <motion.a
                key="back"
                href="/"
                onClick={(e: React.MouseEvent) => {
                  e.preventDefault();
                  handleBack();
                }}
                className="inline-flex items-center gap-2 text-sm transition-colors"
                style={{ color: "var(--text-muted)" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="opacity-60"
                >
                  <path
                    d="M10 12L6 8L10 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Back
              </motion.a>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {categoryVisible && cat && (
            <motion.h2
              key="title"
              className="pointer-events-none absolute left-1/2 -translate-x-1/2 text-sm font-bold tracking-[0.2em] uppercase"
              style={{
                color: "#c8a96e",
                fontFamily: "var(--font-serif), serif",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {cat.name}
            </motion.h2>
          )}
        </AnimatePresence>

        <div className="pointer-events-auto ml-auto">
          <ThemeToggle />
        </div>
      </div>

      <div
        ref={stripRef}
        onTransitionEnd={handleTransitionEnd}
        style={{
          willChange: "transform",
          transform:
            initial.current.scene === "home"
              ? "translateY(-100vh)"
              : "translateY(0)",
        }}
      >
        {/* Slot 1: Category (at offset 0) — visible when strip at translateY(0) */}
        <div style={{ height: "100vh", overflow: "hidden", transform: "translateZ(0)" }}>
          <CategoryScene
            category={category}
            visible={categoryVisible}
            visitKey={visitKey}
          />
        </div>

        {/* Slot 2: Home (at offset 100vh) — visible when strip at translateY(-100vh) */}
        <div style={{ height: "100vh", overflow: "hidden", transform: "translateZ(0)" }}>
          <HomeScene visible={homeVisible} onCategoryClick={handleCategoryClick} />
        </div>
      </div>
    </div>
  );
}
