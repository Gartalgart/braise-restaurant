"use client";

import { motion, useScroll, useSpring } from "motion/react";

/** Filet incandescent en haut de page : la progression de lecture. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 180, damping: 30, restDelta: 0.001 });

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[70] h-[2px] origin-left bg-gradient-to-r from-ember via-braise to-braise-deep"
    />
  );
}
