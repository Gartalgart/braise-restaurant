"use client";

import { useEffect, useState } from "react";
import { RESTAURANT } from "@/lib/restaurant";
import { dayIndex } from "@/lib/hours";

/**
 * Horaires de la semaine, jour par jour. Le jour courant ressort par la
 * graisse et la couleur, et il est annoncé « aujourd'hui » aux lecteurs
 * d'écran. Il est calculé après le montage pour éviter un écart
 * d'hydratation entre fuseaux.
 */
export function HoursList({ className = "" }: { className?: string }) {
  const [today, setToday] = useState<number | null>(null);
  useEffect(() => setToday(dayIndex()), []);

  return (
    <ul className={`space-y-2 ${className}`}>
      {RESTAURANT.hours.map((h, i) => {
        const isToday = today === i;
        const closed = !h.lunch && !h.dinner;
        return (
          <li
            key={h.day}
            aria-current={isToday ? "date" : undefined}
            className={`flex items-baseline ${isToday ? "font-semibold text-cream" : "text-muted"}`}
          >
            <span>
              {h.day}
              {isToday && <span className="sr-only"> (aujourd&apos;hui)</span>}
            </span>
            <span className="dots" aria-hidden="true" />
            <span className="whitespace-nowrap text-right">
              {closed ? "Fermé" : [h.lunch, h.dinner].filter(Boolean).join(" · ")}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
