"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { useMagnetic } from "@/lib/hooks";
import { SPRING_SNAPPY } from "@/lib/motion";

type Variant = "solid" | "outline" | "ghost";

const BASE =
  "meta relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-pill px-7 py-4 transition-colors duration-300 disabled:opacity-60";

const VARIANTS: Record<Variant, string> = {
  // Le CTA principal : pastille incandescente avec halo
  solid: "bg-braise text-night shadow-ember hover:bg-ember",
  // Secondaire : verre + bordure qui s'allume
  outline: "glass text-cream hover:border-braise/60 hover:text-ember",
  // Tertiaire : texte seul, soulignement animé
  ghost: "text-ash hover:text-cream",
};

/**
 * Bouton magnétique : il vient à la rencontre du curseur, puis revient par
 * ressort. Sur tactile ou en `prefers-reduced-motion`, c'est un bouton normal.
 */
export function MagneticButton({
  children,
  href,
  onClick,
  type = "button",
  variant = "solid",
  className = "",
  disabled,
  ariaLabel,
}: {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: Variant;
  className?: string;
  disabled?: boolean;
  ariaLabel?: string;
}) {
  const { ref, x, y, handlers } = useMagnetic<HTMLDivElement>(0.3);
  const cls = `${BASE} ${VARIANTS[variant]} ${className}`;

  const inner = (
    <>
      <span className="relative z-10 flex items-center gap-2">{children}</span>
      {variant === "solid" && (
        // Balayage clair au survol, comme une braise qu'on ravive
        <span
          aria-hidden="true"
          className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover/mag:translate-x-full"
        />
      )}
    </>
  );

  return (
    <motion.div
      ref={ref}
      style={{ x, y }}
      transition={SPRING_SNAPPY}
      className="group/mag inline-block"
      data-cursor="grow"
      {...handlers}
    >
      {href ? (
        <Link href={href} className={cls} aria-label={ariaLabel}>
          {inner}
        </Link>
      ) : (
        <button type={type} onClick={onClick} disabled={disabled} className={cls} aria-label={ariaLabel}>
          {inner}
        </button>
      )}
    </motion.div>
  );
}
