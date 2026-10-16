"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  transform,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  type MotionValue,
} from "motion/react";
import { SPRING_SNAPPY } from "./motion";

/**
 * Mappe une progression de scroll sur une plage de valeurs, en JavaScript.
 *
 * `useTransform` laisse Motion déléguer l'opacité au compositeur via une
 * ScrollTimeline native : la plage effective ne correspond alors plus à celle
 * calculée pour une section `sticky`, et les calques ne s'effacent jamais.
 * En posant la valeur nous-mêmes, on reste sur le chemin JS, toujours exact.
 */
export function useScrollMap(
  progress: MotionValue<number>,
  input: number[],
  output: number[],
) {
  const key = `${input.join()}|${output.join()}`;
  const map = useMemo(() => transform(input, output), [key]); // eslint-disable-line react-hooks/exhaustive-deps
  const value = useMotionValue(map(progress.get()));

  useMotionValueEvent(progress, "change", (v) => value.set(map(v)));
  useEffect(() => value.set(map(progress.get())), [map, progress, value]);

  return value;
}

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

/** Vrai souris + écran large : conditionne curseur custom, parallax et pin. */
export function useIsDesktop() {
  return useMediaQuery("(min-width: 768px) and (hover: hover) and (pointer: fine)");
}

/**
 * Bouton magnétique : l'élément se décale vers le curseur qui l'approche.
 * Neutralisé si l'utilisateur demande moins de mouvement ou sur tactile.
 */
export function useMagnetic<T extends HTMLElement>(strength = 0.35) {
  const ref = useRef<T>(null);
  const reduced = useReducedMotion();
  const desktop = useIsDesktop();
  const active = desktop && !reduced;

  const x = useSpring(useMotionValue(0), SPRING_SNAPPY);
  const y = useSpring(useMotionValue(0), SPRING_SNAPPY);

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!active || !ref.current) return;
      const r = ref.current.getBoundingClientRect();
      x.set((e.clientX - (r.left + r.width / 2)) * strength);
      y.set((e.clientY - (r.top + r.height / 2)) * strength);
    },
    [active, strength, x, y],
  );

  const onPointerLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return { ref, x, y, handlers: { onPointerMove, onPointerLeave }, active };
}

/**
 * Projecteur qui suit le curseur sur une carte : expose `--mx` / `--my` en %,
 * consommés par un `radial-gradient` en CSS. Aucun re-render React.
 */
export function useSpotlight<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
    el.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
  }, []);

  return { ref, handlers: { onPointerMove } };
}

/**
 * Position normalisée du pointeur dans la fenêtre (-1 → 1), lissée par ressort.
 * Sert au parallax du hero et à l'orientation de la caméra 3D.
 */
export function usePointerParallax(): { x: MotionValue<number>; y: MotionValue<number> } {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 60, damping: 20, mass: 1 });
  const y = useSpring(rawY, { stiffness: 60, damping: 20, mass: 1 });
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const onMove = (e: PointerEvent) => {
      rawX.set((e.clientX / window.innerWidth) * 2 - 1);
      rawY.set((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [rawX, rawY, reduced]);

  return { x, y };
}

/**
 * Progression de 0 à 1 sur la traversée d'une section épinglée.
 *
 * `useScroll({ target })` mesure la section une seule fois au montage : sur une
 * section en `svh` dont le contenu (canvas, images) arrive après, la mesure
 * reste fausse jusqu'au premier redimensionnement. On recalcule donc la
 * position à chaque frame de scroll — une seule lecture de rect, négligeable.
 */
export function useSectionProgress(ref: React.RefObject<HTMLElement | null>) {
  const { scrollY } = useScroll();
  const progress = useMotionValue(0);

  const update = useCallback(
    (y: number) => {
      const el = ref.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top + y;
      const travel = el.offsetHeight - window.innerHeight;
      progress.set(travel > 0 ? Math.min(1, Math.max(0, (y - top) / travel)) : 0);
    },
    [progress, ref],
  );

  useMotionValueEvent(scrollY, "change", update);
  useEffect(() => {
    update(window.scrollY);
  }, [update]);

  return progress;
}

/** Monte le contenu lourd (canvas 3D) seulement quand la zone approche. */
export function useNearViewport<T extends HTMLElement>(rootMargin = "300px") {
  const ref = useRef<T>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);

  return { ref, near };
}
