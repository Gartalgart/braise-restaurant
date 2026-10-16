"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";

/**
 * Barre de réservation mobile, fixe en bas d'écran, sous le pouce, et visible
 * dès le premier écran. Inutile sur la page de réservation elle-même.
 */
export function FloatingCTA() {
  const pathname = usePathname();
  if (pathname === "/reservation") return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-coal px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 md:hidden">
      <Link
        href="/reservation"
        className="flex h-[52px] items-center justify-center gap-2.5 rounded-[2px] bg-brass text-sm font-semibold uppercase tracking-[0.14em] text-night active:scale-[0.98]"
      >
        Réserver une table
        <ArrowRight size={18} weight="bold" aria-hidden="true" />
      </Link>
    </div>
  );
}
