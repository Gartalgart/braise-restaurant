"use client";

import { motion } from "motion/react";
import { EASE, VIEWPORT } from "@/lib/motion";
import { Stars } from "@/components/ui/Stars";
import { Counter } from "@/components/ui/Counter";
import { GlassCard } from "@/components/ui/GlassCard";

/**
 * Note globale + répartition des étoiles. Les barres se remplissent quand le
 * bloc entre à l'écran ; les pourcentages restent lisibles au lecteur d'écran.
 */
export function RatingBreakdown({
  average,
  count,
  distribution,
}: {
  average: number;
  count: number;
  /** Nombre d'avis par note, index 0 = 1 étoile. */
  distribution: number[];
}) {
  const total = distribution.reduce((a, b) => a + b, 0) || 1;

  return (
    <GlassCard className="flex flex-col gap-8 p-7 md:flex-row md:items-center md:gap-12 md:p-9">
      <div className="shrink-0">
        <p className="font-display text-7xl font-bold leading-none text-ember md:text-8xl">
          <Counter value={average} decimals={1} />
          <span className="text-3xl text-ash">/5</span>
        </p>
        <div className="mt-3">
          <Stars rating={average} size={20} />
        </div>
        <p className="meta mt-3 text-ash">{count} avis Google</p>
      </div>

      <ul className="flex-1 space-y-2.5">
        {[5, 4, 3, 2, 1].map((star) => {
          const n = distribution[star - 1] ?? 0;
          const pct = Math.round((n / total) * 100);
          return (
            <li key={star} className="flex items-center gap-3">
              <span className="meta w-8 shrink-0 text-ash">{star}★</span>
              <span className="h-2 flex-1 overflow-hidden rounded-pill bg-white/8">
                <motion.span
                  className="block h-full rounded-pill bg-gradient-to-r from-braise to-ember"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: pct / 100 }}
                  viewport={VIEWPORT}
                  transition={{ duration: 0.9, ease: EASE, delay: (5 - star) * 0.08 }}
                  style={{ originX: 0 }}
                />
              </span>
              <span className="meta w-10 shrink-0 text-right text-ash">{pct} %</span>
            </li>
          );
        })}
      </ul>
    </GlassCard>
  );
}
