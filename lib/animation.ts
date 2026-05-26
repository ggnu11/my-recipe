export const EASE_CINEMATIC = [0.22, 1, 0.36, 1] as const;
export const EASE_STANDARD = [0.4, 0, 0.2, 1] as const;

export const circleEnter = {
  initial: { x: "120%", opacity: 0, scale: 0.8 },
  animate: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: { duration: 0.45, ease: EASE_STANDARD },
  },
  exit: {
    x: "120%",
    opacity: 0,
    scale: 0.8,
    transition: { duration: 0.45, ease: EASE_STANDARD },
  },
};

export const detailEnter = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay, ease: EASE_CINEMATIC },
  },
});

export const cardStagger = {
  initial: { opacity: 0, y: 20 },
  animate: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay: i * 0.08,
      ease: EASE_CINEMATIC,
    },
  }),
};

export const pageSlideIn = {
  initial: { x: "100%" },
  animate: {
    x: 0,
    transition: { duration: 0.7, ease: EASE_CINEMATIC },
  },
  exit: {
    x: "100%",
    transition: { duration: 0.7, ease: EASE_CINEMATIC },
  },
};

export const fadeOverlay = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.4, ease: EASE_STANDARD },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.3, ease: EASE_STANDARD },
  },
};
