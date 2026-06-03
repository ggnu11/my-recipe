"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";

const SLIDE_INTERVAL = 2000;
const EASE = "cubic-bezier(.76,0,.24,1)";
const EASE_CINEMATIC = [0.22, 1, 0.36, 1] as const;

const SKIP_CURSOR = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Ccircle cx='32' cy='32' r='30' fill='%232c2c2c' fill-opacity='0.75'/%3E%3Ctext x='32' y='36' text-anchor='middle' font-family='system-ui,sans-serif' font-size='12' font-weight='600' letter-spacing='1.5' fill='white'%3ESKIP%3C/text%3E%3C/svg%3E") 32 32, pointer`;

export const INTRO_IMAGES = [
  "/korea-intro.webp",
  "/chinese-intro.webp",
  "/japan-intro.webp",
  "/western-intro.webp",
];

const SLIDES = [
  { tag: "Korean Cuisine", title: "한식", desc: "정성이 담긴 한국의 전통 요리", image: INTRO_IMAGES[0] },
  { tag: "Chinese Cuisine", title: "중식", desc: "불의 예술, 중국의 미식 세계", image: INTRO_IMAGES[1] },
  { tag: "Japanese Cuisine", title: "일식", desc: "섬세함이 빚어낸 일본의 맛", image: INTRO_IMAGES[2] },
  { tag: "Western Cuisine", title: "양식", desc: "깊고 풍부한 서양의 풍미", image: INTRO_IMAGES[3] },
];

const CLIP_HIDDEN: Record<number, string> = {
  1: "inset(0 0 0 100%)",
  2: "inset(100% 0 0 0)",
  3: "inset(0 0 0 100%)",
};

interface IntroSplashProps {
  onComplete: () => void;
}

export function IntroSplash({ onComplete }: IntroSplashProps) {
  const [mounted, setMounted] = useState(false);
  const [revealedUpTo, setRevealedUpTo] = useState(0);
  const [activeSlide, setActiveSlide] = useState(0);
  const [exiting, setExiting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [cursorVisible, setCursorVisible] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cursorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef(0);
  const startTimeRef = useRef(0);
  const exitingRef = useRef(false);
  const totalDuration = SLIDES.length * SLIDE_INTERVAL;

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    startTimeRef.current = Date.now();
    return () => cancelAnimationFrame(id);
  }, []);

  // Progress bar
  useEffect(() => {
    if (exiting) return;
    const update = () => {
      const p = Math.min((Date.now() - startTimeRef.current) / totalDuration, 1);
      setProgress(p);
      if (p < 1) rafRef.current = requestAnimationFrame(update);
    };
    rafRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(rafRef.current);
  }, [exiting, totalDuration]);

  // Auto-advance slides
  useEffect(() => {
    if (exiting) return;
    timerRef.current = setTimeout(() => {
      const next = activeSlide + 1;
      if (next >= SLIDES.length) {
        startExit();
      } else {
        setRevealedUpTo(next);
        setActiveSlide(next);
      }
    }, SLIDE_INTERVAL);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [activeSlide, exiting]);

  const startExit = useCallback(() => {
    if (exitingRef.current) return;
    exitingRef.current = true;
    if (timerRef.current) clearTimeout(timerRef.current);
    cancelAnimationFrame(rafRef.current);
    setProgress(1);
    setExiting(true);
    setTimeout(onComplete, 700);
  }, [onComplete]);

  const handleClick = useCallback(() => {
    startExit();
  }, [startExit]);

  const handleMouseMove = useCallback(() => {
    if (exitingRef.current) return;
    setCursorVisible(true);
    if (cursorTimerRef.current) clearTimeout(cursorTimerRef.current);
    cursorTimerRef.current = setTimeout(() => setCursorVisible(false), 2000);
  }, []);

  return (
    <div
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "#000",
        transform: exiting ? "scale(0.92)" : "scale(1)",
        opacity: exiting ? 0 : 1,
        transition: `transform 0.7s ${EASE}, opacity 0.7s ${EASE}`,
        cursor: !exiting && cursorVisible ? SKIP_CURSOR : "none",
      }}
    >
      {/* Stacked slide layers */}
      {SLIDES.map((slide, i) => {
        const isRevealed = i === 0 ? mounted : revealedUpTo >= i;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              inset: 0,
              zIndex: i,
              clipPath: i === 0 || isRevealed ? "inset(0)" : CLIP_HIDDEN[i],
              transition: i > 0 ? `clip-path 0.7s ${EASE}` : "none",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: "-5%",
                backgroundImage: `url(${slide.image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                transform: isRevealed ? "scale(1)" : "scale(1.1)",
                transition: "transform 2.5s ease-out",
                willChange: "transform",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.25) 100%)",
              }}
            />
            {activeSlide === i && <SlideText slide={slide} isFirst={i === 0} />}
          </div>
        );
      })}

      {/* Header: Logo */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          padding: "32px 40px",
          zIndex: 20,
        }}
      >
        <span
          style={{
            color: "#fff",
            fontSize: "14px",
            fontWeight: 700,
            letterSpacing: "0.15em",
            fontFamily: "var(--font-serif)",
          }}
        >
          MY RECIPE
        </span>
      </div>

      {/* Progress bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "2px",
          background: "rgba(255,255,255,0.15)",
          zIndex: 20,
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progress * 100}%`,
            background: "rgba(255,255,255,0.7)",
            transition: "width 0.1s linear",
          }}
        />
      </div>
    </div>
  );
}

/* ─── Slide Text ─── */

function SlideText({
  slide,
  isFirst,
}: {
  slide: (typeof SLIDES)[number];
  isFirst: boolean;
}) {
  const baseDelay = isFirst ? 0.3 : 0.4;

  const fadeUp = (delay: number) => ({
    initial: { opacity: 0, y: 24 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, delay: baseDelay + delay, ease: EASE_CINEMATIC },
    },
  });

  return (
    <div
      style={{
        position: "absolute",
        bottom: "72px",
        left: "clamp(24px, 5vw, 48px)",
        zIndex: 10,
      }}
    >
      <motion.span
        {...fadeUp(0)}
        style={{
          display: "inline-block",
          color: "rgba(255,255,255,0.55)",
          fontSize: "11px",
          letterSpacing: "0.2em",
          textTransform: "uppercase" as const,
          fontWeight: 500,
          marginBottom: "14px",
        }}
      >
        {slide.tag}
      </motion.span>
      <motion.h1
        {...fadeUp(0.15)}
        style={{
          color: "#fff",
          fontSize: "clamp(42px, 8vw, 72px)",
          fontWeight: 200,
          fontFamily: "var(--font-pretendard)",
          lineHeight: 1.05,
          marginBottom: "20px",
          letterSpacing: "-0.02em",
        }}
      >
        {slide.title}
      </motion.h1>
      <motion.div
        {...fadeUp(0.28)}
        style={{
          width: "36px",
          height: "1px",
          background: "rgba(255,255,255,0.4)",
          marginBottom: "18px",
        }}
      />
      <motion.p
        {...fadeUp(0.38)}
        style={{
          color: "rgba(255,255,255,0.65)",
          fontSize: "14px",
          fontWeight: 300,
          letterSpacing: "0.04em",
        }}
      >
        {slide.desc}
      </motion.p>
    </div>
  );
}
