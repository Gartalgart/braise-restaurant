"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { EASE, SPRING_SNAPPY, fadeUp, staggerParent, VIEWPORT } from "@/lib/motion";

type Photo = { src: string; alt: string };

// Rythme de la mosaïque : trois hauteurs qui alternent pour casser la grille
const RATIOS = ["aspect-[4/5]", "aspect-square", "aspect-[3/4]"];

export function GalleryGrid({ photos }: { photos: Photo[] }) {
  const [lightbox, setLightbox] = useState<number | null>(null);

  const close = useCallback(() => setLightbox(null), []);
  const move = useCallback(
    (dir: 1 | -1) =>
      setLightbox((i) => (i === null ? null : (i + dir + photos.length) % photos.length)),
    [photos.length],
  );

  // Navigation clavier dans la lightbox (accessibilité)
  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") move(1);
      if (e.key === "ArrowLeft") move(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightbox, close, move]);

  return (
    <>
      {/* Mosaïque en colonnes : les photos gardent leur cadence naturelle */}
      <motion.div
        variants={staggerParent(0.05)}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT}
        className="mx-auto max-w-6xl columns-2 gap-4 px-5 pb-28 pt-12 md:columns-3 md:gap-5 md:px-8"
      >
        {photos.map((photo, i) => (
          <motion.button
            key={photo.src}
            type="button"
            variants={fadeUp}
            onClick={() => setLightbox(i)}
            className="group mb-4 block w-full text-left md:mb-5"
            aria-label={`Agrandir : ${photo.alt}`}
          >
            <motion.span
              layoutId={`photo-${i}`}
              transition={SPRING_SNAPPY}
              className={`relative block overflow-hidden rounded-card border border-white/8 ${
                RATIOS[i % RATIOS.length]
              }`}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                loading="lazy"
                sizes="(max-width: 768px) 50vw, 33vw"
                className="object-cover opacity-80 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105 group-hover:opacity-100"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-night/80 via-transparent to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-90" />

              {/* La légende monte au survol */}
              <span className="absolute inset-x-0 bottom-0 translate-y-3 p-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                <span className="meta block text-braise">
                  Fig. {String(i + 1).padStart(2, "0")}
                </span>
                <span className="mt-1 block text-sm leading-snug text-cream">{photo.alt}</span>
              </span>
            </motion.span>
          </motion.button>
        ))}
      </motion.div>

      {/* --- Lightbox : la vignette grandit jusqu'au plein écran ----------- */}
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={photos[lightbox].alt}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="fixed inset-0 z-[90] flex items-center justify-center bg-night/92 p-4 backdrop-blur-xl md:p-12"
            onClick={close}
          >
            <motion.div
              layoutId={`photo-${lightbox}`}
              transition={SPRING_SNAPPY}
              className="relative h-full max-h-[78vh] w-full max-w-5xl overflow-hidden rounded-panel"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={photos[lightbox].src}
                alt={photos[lightbox].alt}
                fill
                sizes="100vw"
                className="object-contain"
              />
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="meta absolute bottom-6 left-1/2 max-w-lg -translate-x-1/2 px-4 text-center text-ash"
            >
              Fig. {String(lightbox + 1).padStart(2, "0")} — {photos[lightbox].alt}
              <span className="mt-1 block text-ash/50">
                {lightbox + 1} / {photos.length} — ← → pour naviguer, échap pour fermer
              </span>
            </motion.p>

            <button
              type="button"
              onClick={close}
              autoFocus
              aria-label="Fermer la galerie"
              className="glass absolute right-5 top-5 flex h-12 w-12 items-center justify-center rounded-full text-cream transition-colors hover:border-braise/60 hover:text-ember"
            >
              ✕
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                move(-1);
              }}
              aria-label="Photo précédente"
              className="glass absolute left-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full text-cream transition-colors hover:border-braise/60 hover:text-ember md:left-6"
            >
              ←
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                move(1);
              }}
              aria-label="Photo suivante"
              className="glass absolute right-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full text-cream transition-colors hover:border-braise/60 hover:text-ember md:right-6"
            >
              →
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
