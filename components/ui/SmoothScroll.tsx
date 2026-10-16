"use client";

import { useEffect } from "react";
import { useReducedMotion } from "motion/react";

/**
 * Scroll inertiel (Lenis) — c'est lui qui donne la sensation « site de studio »
 * et qui rend lisibles les animations liées au scroll.
 * Désactivé si l'utilisateur demande moins de mouvement : on retombe alors sur
 * le scroll natif, sans aucune perte de fonctionnalité.
 */
export function SmoothScroll() {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;

    let lenis: import("lenis").default | null = null;
    let frame = 0;
    let cancelled = false;

    import("lenis").then(({ default: Lenis }) => {
      if (cancelled) return;
      lenis = new Lenis({
        duration: 1.05,
        // Décroissance exponentielle : rapide au départ, arrêt franc
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        touchMultiplier: 1.6,
      });

      const raf = (time: number) => {
        lenis?.raf(time);
        frame = requestAnimationFrame(raf);
      };
      frame = requestAnimationFrame(raf);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      lenis?.destroy();
    };
  }, [reduced]);

  return null;
}
