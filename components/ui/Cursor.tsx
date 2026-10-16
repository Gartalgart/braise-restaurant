"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "motion/react";
import { useIsDesktop } from "@/lib/hooks";

/**
 * Curseur maison : un point net qui suit le pointeur à l'instant, doublé d'un
 * anneau de braise qui le rattrape par ressort. L'anneau grossit au-dessus des
 * éléments marqués `data-cursor="grow"`.
 * Desktop pointeur fin uniquement — jamais sur tactile, jamais en reduced-motion.
 */
export function Cursor() {
  const desktop = useIsDesktop();
  const reduced = useReducedMotion();
  const enabled = desktop && !reduced;

  const [hovering, setHovering] = useState(false);
  const [visible, setVisible] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 260, damping: 26, mass: 0.6 });
  const ringY = useSpring(y, { stiffness: 260, damping: 26, mass: 0.6 });

  useEffect(() => {
    if (!enabled) return;
    document.body.classList.add("has-cursor");

    const onMove = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);
      const target = e.target as Element | null;
      setHovering(Boolean(target?.closest?.('a, button, [data-cursor="grow"]')));
    };
    const onLeave = () => setVisible(false);

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => {
      document.body.classList.remove("has-cursor");
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[100]">
      <motion.span
        style={{ x, y }}
        animate={{ opacity: visible ? 1 : 0, scale: hovering ? 0 : 1 }}
        transition={{ duration: 0.18 }}
        className="absolute -ml-[3px] -mt-[3px] block h-1.5 w-1.5 rounded-full bg-cream"
      />
      <motion.span
        style={{ x: ringX, y: ringY }}
        animate={{
          opacity: visible ? 1 : 0,
          width: hovering ? 52 : 26,
          height: hovering ? 52 : 26,
          borderColor: hovering ? "rgb(255 90 31 / 0.9)" : "rgb(247 242 233 / 0.35)",
          backgroundColor: hovering ? "rgb(255 90 31 / 0.12)" : "rgb(255 90 31 / 0)",
        }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        className="absolute block -translate-x-1/2 -translate-y-1/2 rounded-full border"
      />
    </div>
  );
}
