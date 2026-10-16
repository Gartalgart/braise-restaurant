"use client";

import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { EASE } from "@/lib/motion";

/**
 * Transition de page : un fondu-montée court à chaque changement d'URL.
 * Volontairement bref (0,4 s) — on ne fait pas attendre quelqu'un qui veut
 * réserver une table.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
