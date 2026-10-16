"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, X } from "@phosphor-icons/react/dist/ssr";

type Photo = { src: string; alt: string };

export function GalleryGrid({ photos }: { photos: Photo[] }) {
  const [current, setCurrent] = useState<number | null>(null);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const dialogRef = useRef<HTMLDivElement>(null);
  const lastOpened = useRef<number | null>(null);

  const open = (i: number) => {
    lastOpened.current = i;
    setCurrent(i);
  };

  const close = useCallback(() => setCurrent(null), []);
  const move = useCallback(
    (dir: 1 | -1) => setCurrent((i) => (i === null ? null : (i + dir + photos.length) % photos.length)),
    [photos.length],
  );

  // Lightbox : flèches, Échap, focus gardé dans la boîte, page figée derrière
  useEffect(() => {
    if (current === null) return;
    const dialog = dialogRef.current;
    dialog?.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") move(1);
      if (e.key === "ArrowLeft") move(-1);
      if (e.key === "Tab" && dialog) {
        const items = [...dialog.querySelectorAll<HTMLElement>("button")];
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [current === null, close, move]); // eslint-disable-line react-hooks/exhaustive-deps

  // À la fermeture, le focus revient sur la miniature ouverte en dernier
  useEffect(() => {
    if (current === null && lastOpened.current !== null) {
      thumbRefs.current[lastOpened.current]?.focus();
    }
  }, [current]);

  return (
    <>
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-6">
        {photos.map((photo, i) => (
          <li key={photo.src}>
            <button
              ref={(el) => {
                thumbRefs.current[i] = el;
              }}
              type="button"
              onClick={() => open(i)}
              aria-label={`Agrandir : ${photo.alt}`}
              className="group relative block aspect-[4/3] w-full overflow-hidden rounded-[2px] bg-surface"
            >
              <Image
                src={photo.src}
                alt=""
                fill
                loading="lazy"
                sizes="(max-width: 768px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.2,0,0,1)] group-hover:scale-[1.04]"
              />
            </button>
          </li>
        ))}
      </ul>

      {current !== null && (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={`Photo ${current + 1} sur ${photos.length} : ${photos[current].alt}`}
          className="fixed inset-0 z-[70] flex flex-col bg-night"
        >
          <div className="flex items-center justify-between px-4 py-3 md:px-8">
            <p className="text-[0.9375rem] text-muted" aria-live="polite">
              {current + 1} / {photos.length}
            </p>
            <button
              type="button"
              onClick={close}
              data-autofocus
              aria-label="Fermer la galerie"
              className="flex h-12 w-12 items-center justify-center text-cream hover:text-brass-strong"
            >
              <X size={26} aria-hidden="true" />
            </button>
          </div>

          <div className="relative min-h-0 flex-1 px-4 md:px-24">
            {/* `key` : remonte l'image à chaque photo, sinon l'ancienne reste affichée
                pendant le chargement de la suivante, sous la nouvelle légende */}
            <Image
              key={photos[current].src}
              src={photos[current].src}
              alt={photos[current].alt}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>

          <div className="flex items-center justify-between gap-4 px-4 py-4 md:px-8">
            <button
              type="button"
              onClick={() => move(-1)}
              aria-label="Photo précédente"
              className="flex h-12 w-12 shrink-0 items-center justify-center border border-line text-cream hover:border-brass"
            >
              <ArrowLeft size={22} aria-hidden="true" />
            </button>
            <p className="text-center text-[0.9375rem] text-cream">{photos[current].alt}</p>
            <button
              type="button"
              onClick={() => move(1)}
              aria-label="Photo suivante"
              className="flex h-12 w-12 shrink-0 items-center justify-center border border-line text-cream hover:border-brass"
            >
              <ArrowRight size={22} aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
