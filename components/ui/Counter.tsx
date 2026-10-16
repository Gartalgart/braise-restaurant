"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useMotionValue, useSpring, useReducedMotion } from "motion/react";

/**
 * Nombre qui grimpe jusqu'à sa valeur quand il entre à l'écran.
 * La valeur finale est toujours dans le DOM pour les lecteurs d'écran.
 */
export function Counter({
  value,
  decimals = 0,
  suffix = "",
  className,
}: {
  value: number;
  decimals?: number;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15%" });
  const reduced = useReducedMotion();

  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 60, damping: 20, mass: 1 });
  // Toujours 0 au premier rendu : `reduced` vaut `false` côté serveur, un état
  // initial qui en dépend produirait un HTML différent et casserait
  // l'hydratation. La valeur finale est posée juste après, dans l'effet.
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (reduced) {
      setDisplay(value);
      return;
    }
    if (inView) mv.set(value);
  }, [inView, mv, value, reduced]);

  useEffect(() => {
    if (reduced) return;
    return spring.on("change", (v) => setDisplay(v));
  }, [spring, reduced]);

  return (
    <span ref={ref} className={className}>
      <span aria-hidden="true">
        {display.toFixed(decimals).replace(".", ",")}
        {suffix}
      </span>
      <span className="sr-only">
        {value.toFixed(decimals).replace(".", ",")}
        {suffix}
      </span>
    </span>
  );
}
