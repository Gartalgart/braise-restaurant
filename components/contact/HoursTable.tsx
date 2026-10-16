"use client";

import { useEffect, useState } from "react";
import { RESTAURANT } from "@/lib/restaurant";

/**
 * Tableau des horaires avec la ligne du jour mise en avant.
 * L'index du jour est calculé après le montage : le serveur et le client ne
 * sont pas forcément dans le même fuseau, on évite l'écart d'hydratation.
 */
export function HoursTable() {
  const [today, setToday] = useState<number | null>(null);

  useEffect(() => setToday((new Date().getDay() + 6) % 7), []);

  return (
    <ul className="space-y-1">
      {RESTAURANT.hours.map((h, i) => {
        const isToday = today === i;
        const closed = !h.lunch && !h.dinner;
        return (
          <li
            key={h.day}
            aria-current={isToday ? "date" : undefined}
            className={`flex items-baseline rounded-lg px-3 py-2.5 font-mono text-xs uppercase tracking-wider transition-colors ${
              isToday ? "bg-braise/10 text-cream ring-1 ring-braise/30" : "text-ash"
            }`}
          >
            <span className={isToday ? "text-ember" : ""}>
              {h.day}
              {isToday && <span className="ml-2 text-[0.6rem] text-braise">aujourd&apos;hui</span>}
            </span>
            <span className="dots" aria-hidden="true" />
            <span className={closed ? "text-ash/60" : ""}>
              {closed ? "Fermé" : [h.lunch, h.dinner].filter(Boolean).join(" · ")}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
