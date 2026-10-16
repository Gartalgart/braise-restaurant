"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Bande défilante infinie, de droite à gauche.
 *
 * Le contenu est dupliqué et la piste translatée de -50 % : au moment où la
 * première copie sort du cadre, la seconde est exactement à sa place, la
 * boucle est invisible.
 *
 * La durée n'est pas fixe : elle est calculée depuis la largeur réelle pour
 * tenir une **vitesse constante en pixels par seconde**. Sans ça, une bande
 * au contenu long défile au ralenti et paraît figée, et deux bandes de
 * longueurs différentes n'avancent pas au même rythme.
 */
export function Ticker({
  children,
  /** Vitesse de défilement en pixels par seconde. */
  speed = 80,
  pauseOnHover = true,
  className = "",
  /** Fondus latéraux : le contenu naît et meurt dans le noir. */
  fade = true,
  /** Texte lu par les lecteurs d'écran à la place du contenu défilant. */
  label,
}: {
  children: React.ReactNode;
  speed?: number;
  pauseOnHover?: boolean;
  className?: string;
  fade?: boolean;
  label?: string;
}) {
  const track = useRef<HTMLDivElement>(null);
  const [duration, setDuration] = useState(30);

  useEffect(() => {
    const el = track.current;
    if (!el) return;

    // Une copie = la moitié de la piste. Remesuré si les polices ou la
    // largeur de la fenêtre changent après le premier rendu.
    const measure = () => {
      const half = el.scrollWidth / 2;
      if (half > 0) setDuration(half / speed);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [speed, children]);

  return (
    /*
     * `prefers-reduced-motion` est traité en CSS, jamais en JavaScript : la
     * valeur est toujours `false` au rendu serveur, un branchement ici
     * changerait les classes côté client et casserait l'hydratation.
     * La règle `.marquee-track { animation: none }` de `globals.css` arrête le
     * défilement, et `motion-reduce:overflow-x-auto` rend la bande consultable
     * à la main.
     */
    <div
      className={`relative overflow-hidden motion-reduce:overflow-x-auto ${
        pauseOnHover ? "ticker" : ""
      } ${className}`}
    >
      {fade && (
        <>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-night to-transparent md:w-28"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-night to-transparent md:w-28"
          />
        </>
      )}

      {label && <p className="sr-only">{label}</p>}

      <div
        ref={track}
        style={{ animationDuration: `${duration}s` }}
        className="marquee-track flex w-max"
      >
        <div className="flex shrink-0" aria-hidden={label ? true : undefined}>
          {children}
        </div>
        {/* Copie de bouclage : jamais annoncée deux fois */}
        <div className="flex shrink-0" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}
