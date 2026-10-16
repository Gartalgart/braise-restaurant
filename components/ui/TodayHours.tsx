"use client";

import { useEffect, useState } from "react";
import { todayLine } from "@/lib/hours";

/**
 * Horaires du jour. Calculés après le montage : le serveur et le visiteur ne
 * sont pas forcément dans le même fuseau. Un espace réservé garde la hauteur.
 */
export function TodayHours({ className = "" }: { className?: string }) {
  const [line, setLine] = useState<string | null>(null);
  useEffect(() => setLine(todayLine().text), []);

  return <span className={className}>{line ?? " "}</span>;
}
