"use client";

import { motion, type HTMLMotionProps } from "motion/react";
import { useSpotlight } from "@/lib/hooks";
import { SPRING_SNAPPY } from "@/lib/motion";

type Props = Omit<HTMLMotionProps<"div">, "children"> & {
  children?: React.ReactNode;
  /** Projecteur chaud qui suit le curseur à l'intérieur de la carte. */
  spotlight?: boolean;
  /** Léger soulèvement au survol. */
  lift?: boolean;
  as?: "div" | "article" | "li" | "blockquote";
};

/**
 * Carte en verre dépoli : fond translucide, arête supérieure lumineuse,
 * projecteur au curseur. C'est la surface par défaut de tout le contenu.
 */
export function GlassCard({
  children,
  className = "",
  spotlight = true,
  lift = true,
  as = "div",
  ...rest
}: Props) {
  const { ref, handlers } = useSpotlight<HTMLDivElement>();
  const M = motion[as] as typeof motion.div;

  return (
    <M
      ref={ref}
      onPointerMove={spotlight ? handlers.onPointerMove : undefined}
      whileHover={lift ? { y: -5 } : undefined}
      transition={SPRING_SNAPPY}
      className={`glass glass-edge group relative isolate overflow-hidden rounded-card ${className}`}
      {...rest}
    >
      {spotlight && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(340px circle at var(--mx, 50%) var(--my, 50%), rgb(255 90 31 / 0.16), transparent 70%)",
          }}
        />
      )}
      {children}
    </M>
  );
}
