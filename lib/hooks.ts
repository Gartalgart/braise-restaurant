"use client";

import { useEffect, useState } from "react";

/** Media query réactive, sûre côté SSR (retourne `false` au premier rendu). */
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

/** Vraie souris + écran large : conditionne l'aperçu photo au survol de la carte. */
export function useIsDesktop() {
  return useMediaQuery("(min-width: 768px) and (hover: hover) and (pointer: fine)");
}
