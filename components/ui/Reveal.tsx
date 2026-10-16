"use client";

import { motion, type Variants } from "motion/react";
import { fadeUp, VIEWPORT } from "@/lib/motion";

/**
 * Apparition au scroll — le geste de base du site : montée + défloutage,
 * porté par un ressort pour que ça respire au lieu de « jouer une durée ».
 */
export function Reveal({
  children,
  delay = 0,
  className,
  variants = fadeUp,
  as = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  variants?: Variants;
  as?: "div" | "section" | "article" | "header" | "li";
}) {
  const M = motion[as] as typeof motion.div;

  return (
    <M
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
      transition={{ delay }}
    >
      {children}
    </M>
  );
}

/** Version enfant : hérite de l'état d'un parent en `staggerParent`. */
export function RevealItem({
  children,
  className,
  variants = fadeUp,
}: {
  children: React.ReactNode;
  className?: string;
  variants?: Variants;
}) {
  return (
    <motion.div className={className} variants={variants}>
      {children}
    </motion.div>
  );
}
