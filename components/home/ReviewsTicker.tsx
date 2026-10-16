"use client";

import { Ticker } from "@/components/ui/Ticker";
import { GlassCard } from "@/components/ui/GlassCard";
import { Stars } from "@/components/ui/Stars";

type Review = { author: string; rating: number; date: string; text: string };

/**
 * Les avis défilent en continu de droite à gauche, et s'arrêtent au survol
 * pour rester lisibles. Pleine largeur : la bande traverse tout l'écran.
 */
export function ReviewsTicker({ reviews }: { reviews: Review[] }) {
  return (
    <Ticker speed={45} className="py-1">
      {reviews.map((r) => (
        <div key={r.author} className="mr-5 w-[300px] shrink-0 sm:w-[360px]">
          <GlassCard as="blockquote" className="flex h-full flex-col p-6 md:p-7">
            <div className="flex items-center justify-between">
              <Stars rating={r.rating} />
              <span className="meta text-ash">{r.date}</span>
            </div>
            <p className="mt-5 flex-1 leading-relaxed text-cream/85">« {r.text} »</p>
            <footer className="meta mt-6 flex items-center gap-3 text-ash">
              <span
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/12 bg-white/5 text-[0.7rem] text-ember"
                aria-hidden="true"
              >
                {r.author.charAt(0)}
              </span>
              {r.author}
            </footer>
          </GlassCard>
        </div>
      ))}
    </Ticker>
  );
}
