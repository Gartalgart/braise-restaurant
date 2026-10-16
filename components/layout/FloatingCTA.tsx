"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useState } from "react";
import { SPRING_SNAPPY } from "@/lib/motion";

/**
 * CTA flottant mobile — pastille en verre qui apparaît une fois le hero passé,
 * pour ne pas masquer le premier écran. Inutile sur la page de réservation.
 */
export function FloatingCTA() {
  const pathname = usePathname();
  const [shown, setShown] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (v) => setShown(v > 420));

  if (pathname === "/reservation") return null;

  return (
    <AnimatePresence>
      {shown && (
        <motion.div
          initial={{ y: 90, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 90, opacity: 0 }}
          transition={SPRING_SNAPPY}
          className="fixed inset-x-4 bottom-4 z-[65] md:hidden"
        >
          <Link
            href="/reservation"
            className="meta flex items-center justify-center gap-2 rounded-pill bg-braise py-4 text-night shadow-ember"
          >
            Réserver une table
            <span aria-hidden="true">→</span>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
