"use client";

import { usePathname } from "next/navigation";
import {
  useRef,
  useState,
  useCallback,
  useLayoutEffect,
  useEffect,
  type ReactNode,
} from "react";
import { useTransitionStore } from "@/store/transitionStore";

const DURATION = "1.6s";
const EASING = "cubic-bezier(0.16, 1, 0.3, 1)";

export function FilmTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const direction = useTransitionStore((s) => s.direction);
  const clearTransition = useTransitionStore((s) => s.clearTransition);

  const [, forceRender] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const oldSlotRef = useRef<HTMLDivElement>(null);
  const snapshotRef = useRef("");

  const state = useRef({
    prevPathname: pathname,
    animating: false,
    dir: null as "down" | "up" | null,
    needsStart: false,
  });

  const routeChanged = pathname !== state.current.prevPathname;

  if (routeChanged && direction && !state.current.animating) {
    state.current.animating = true;
    state.current.dir = direction;
    state.current.needsStart = true;
    state.current.prevPathname = pathname;
  } else if (!state.current.animating) {
    state.current.prevPathname = pathname;
  }

  // Capture DOM snapshot of current page while idle (after every paint)
  useEffect(() => {
    if (!state.current.animating && contentRef.current) {
      snapshotRef.current = contentRef.current.innerHTML;
    }
  });

  // Start animation: inject snapshot into old slot, then CSS transition
  useLayoutEffect(() => {
    if (state.current.needsStart && stripRef.current && oldSlotRef.current) {
      state.current.needsStart = false;

      // Inject the captured snapshot of the old page
      oldSlotRef.current.innerHTML = snapshotRef.current;

      // For "up" (back): animate left/right content out within the snapshot
      if (state.current.dir === "up") {
        const EXIT_DURATION = "2s";
        const SLIDE_CSS = `transform ${EXIT_DURATION} ${EASING}, opacity ${EXIT_DURATION} ${EASING}`;
        const left = oldSlotRef.current.querySelector<HTMLElement>('[data-anim="left"]');
        const right = oldSlotRef.current.querySelector<HTMLElement>('[data-anim="right"]');
        if (left) {
          left.style.transition = "none";
          left.style.transform = "translateX(0)";
          left.getBoundingClientRect();
          left.style.transition = SLIDE_CSS;
          left.style.transform = "translateX(-50vw)";
          left.style.opacity = "0";
        }
        if (right) {
          right.style.transition = "none";
          right.style.transform = "translateX(0)";
          right.getBoundingClientRect();
          right.style.transition = SLIDE_CSS;
          right.style.transform = "translateX(50vw)";
          right.style.opacity = "0";
        }
      }

      const el = stripRef.current;
      const isDown = state.current.dir === "down";

      // 1. Jump to start position (no transition)
      el.style.transition = "none";
      el.style.transform = isDown ? "translateY(-100vh)" : "translateY(0)";

      // 2. Force browser to register the start position
      el.getBoundingClientRect();

      // 3. Apply transition and slide to target
      el.style.transition = `transform ${DURATION} ${EASING}`;
      el.style.transform = isDown ? "translateY(0)" : "translateY(-100vh)";
    }
  });

  const handleTransitionEnd = useCallback(
    (e: React.TransitionEvent) => {
      // Only respond to the strip's own transition, not bubbled child events
      if (e.target !== stripRef.current) return;
      if (e.propertyName !== "transform") return;

      // 1. Collapse old slot FIRST so it takes no space
      if (oldSlotRef.current) {
        oldSlotRef.current.style.display = "none";
        oldSlotRef.current.innerHTML = "";
      }
      // 2. Now safe to clear strip transform — home page stays at top
      if (stripRef.current) stripRef.current.style.cssText = "";
      if (contentRef.current) contentRef.current.style.cssText = "";
      if (wrapperRef.current) {
        wrapperRef.current.style.cssText = "";
        wrapperRef.current.getBoundingClientRect();
      }

      state.current.animating = false;
      state.current.dir = null;
      clearTransition();
      forceRender((n) => n + 1);
    },
    [clearTransition]
  );

  const { animating, dir } = state.current;
  const isDown = animating && dir === "down";
  const isUp = animating && dir === "up";

  return (
    <div
      ref={wrapperRef}
      style={
        animating
          ? {
              position: "fixed",
              inset: "0",
              overflow: "hidden",
              background: "var(--bg)",
            }
          : undefined
      }
    >
      <div
        ref={stripRef}
        style={animating ? { willChange: "transform" } : undefined}
        onTransitionEnd={animating ? handleTransitionEnd : undefined}
      >
        {/* Old page snapshot ABOVE — during "up" (back) */}
        {isUp && (
          <div
            key="old"
            ref={oldSlotRef}
            className="h-screen overflow-hidden"
            style={{ transform: "translateZ(0)" }}
          />
        )}

        {/* Current page — always rendered, stable key prevents remount */}
        <div
          key="current"
          ref={contentRef}
          style={
            animating
              ? {
                  height: "100vh",
                  overflow: "hidden",
                  transform: "translateZ(0)",
                }
              : undefined
          }
        >
          {children}
        </div>

        {/* Old page snapshot BELOW — during "down" (forward) */}
        {isDown && (
          <div
            key="old"
            ref={oldSlotRef}
            className="h-screen overflow-hidden"
            style={{ transform: "translateZ(0)" }}
          />
        )}
      </div>
    </div>
  );
}
