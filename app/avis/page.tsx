import type { Metadata } from "next";
import { REVIEWS } from "@/lib/reviews";
import { RESTAURANT } from "@/lib/restaurant";
import { Stars } from "@/components/ui/Stars";
import { Reveal } from "@/components/ui/Reveal";
import { PageHeader } from "@/components/ui/PageHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { Glow } from "@/components/ui/Glow";
import { RatingBreakdown } from "@/components/reviews/RatingBreakdown";

export const metadata: Metadata = {
  title: "Avis clients — Braise",
  description: `${RESTAURANT.rating.average}/5 sur ${RESTAURANT.rating.count} avis Google — ce que nos clients disent de Braise.`,
};

export default function AvisPage() {
  // Répartition calculée sur les avis affichés (index 0 = 1 étoile).
  // En production, ces valeurs viennent de l'API Google Places.
  const distribution = [1, 2, 3, 4, 5].map(
    (star) => REVIEWS.filter((r) => r.rating === star).length,
  );

  return (
    <div>
      <PageHeader title="Avis">
        <p>
          Les retours de salle, tels quels — y compris ceux qui piquent un peu.
        </p>
      </PageHeader>

      <section className="relative isolate mx-auto max-w-6xl overflow-x-clip px-5 pt-14 md:px-8">
        <Glow className="-left-32 top-0" size={520} intensity={0.35} />
        <Reveal>
          <RatingBreakdown
            average={RESTAURANT.rating.average}
            count={RESTAURANT.rating.count}
            distribution={distribution}
          />
        </Reveal>
      </section>

      {/* Mosaïque d'avis — les cartes gardent leur hauteur naturelle */}
      <div className="mx-auto max-w-6xl columns-1 gap-5 px-5 pb-16 pt-14 md:columns-3 md:px-8">
        {REVIEWS.map((r, i) => (
          <Reveal key={r.author} delay={(i % 3) * 0.08} className="mb-5 break-inside-avoid">
            <GlassCard as="blockquote" className="p-7">
              <div className="flex items-center justify-between">
                <Stars rating={r.rating} />
                <span className="meta text-ash">{r.date}</span>
              </div>
              <p className="mt-5 leading-relaxed text-cream/85">« {r.text} »</p>
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
          </Reveal>
        ))}
      </div>

      <div className="mx-auto max-w-6xl px-5 pb-28 md:px-8">
        <Reveal>
          <GlassCard className="grain flex flex-col items-center gap-5 px-6 py-14 text-center md:py-20">
            <Glow className="left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" size={520} intensity={0.5} />
            <h2 className="font-display text-display font-bold uppercase leading-none">
              Vous êtes passés <em className="font-serif normal-case text-ember">nous voir</em> ?
            </h2>
            <p className="max-w-md text-lead text-ash">
              Un mot sur Google aide énormément une petite maison comme la nôtre.
            </p>
            <div className="mt-3 flex flex-wrap justify-center gap-3">
              <MagneticButton href="/reservation">Réserver une table</MagneticButton>
              <a
                href={RESTAURANT.googleReviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="meta glass inline-flex items-center gap-2 rounded-pill px-7 py-4 text-cream transition-colors hover:border-braise/60 hover:text-ember"
              >
                Laisser un avis Google
                <span aria-hidden="true">↗</span>
              </a>
            </div>
          </GlassCard>
        </Reveal>
      </div>
    </div>
  );
}
