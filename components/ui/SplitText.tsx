"use client";

import { motion } from "motion/react";
import { maskUp, staggerParent, VIEWPORT } from "@/lib/motion";

/**
 * Titre révélé mot par mot derrière un masque, comme une affiche qui se compose.
 * Chaque mot reste un mot pour les lecteurs d'écran : le texte complet est
 * exposé une seule fois via `aria-label`, les fragments sont masqués.
 */
export function SplitText({
  text,
  className,
  wordClassName,
  delay = 0,
  stagger = 0.055,
  animateOnMount = false,
}: {
  text: string;
  className?: string;
  wordClassName?: string;
  delay?: number;
  stagger?: number;
  /** Hero : on anime au montage plutôt qu'à l'entrée dans le viewport. */
  animateOnMount?: boolean;
}) {
  const words = text.split(" ");
  const trigger = animateOnMount
    ? { animate: "visible" as const }
    : { whileInView: "visible" as const, viewport: VIEWPORT };

  return (
    <motion.span
      className={className}
      aria-label={text}
      variants={staggerParent(stagger, delay)}
      initial="hidden"
      {...trigger}
    >
      {words.map((word, i) => (
        <span key={`${word}-${i}`} aria-hidden="true" className="inline-block overflow-hidden pb-[0.08em] align-bottom">
          <motion.span className={`inline-block ${wordClassName ?? ""}`} variants={maskUp}>
            {word}
          </motion.span>
          {i < words.length - 1 && <span className="inline-block">&nbsp;</span>}
        </span>
      ))}
    </motion.span>
  );
}
