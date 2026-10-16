import type { Metadata } from "next";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { REVIEWS } from "@/lib/reviews";
import { RESTAURANT } from "@/lib/restaurant";
import { Stars } from "@/components/ui/Stars";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Avis clients — Braise",
  description: `${RESTAURANT.rating.average}/5 sur ${RESTAURANT.rating.count} avis Google : ce que nos clients disent de Braise.`,
};

const ratingFr = String(RESTAURANT.rating.average).replace(".", ",");

export default function AvisPage() {
  return (
    <div>
      <PageHeader title="Avis">
        <p>Les retours de salle, tels quels, y compris ceux qui piquent un peu.</p>
      </PageHeader>

      <div className="mx-auto max-w-[1200px] px-6 py-12 md:px-12 md:py-16">
        {/* --- La note, lisible d'un coup d'œil ----------------------------- */}
        <section aria-labelledby="note" className="flex flex-col gap-6 border-b border-line pb-12 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 id="note" className="sr-only">
              Note globale
            </h2>
            <p className="font-display text-[clamp(4.5rem,10vw,7rem)] leading-none">
              {ratingFr}
              <span className="text-[0.35em] text-muted"> / 5</span>
            </p>
            <div className="mt-4 flex items-center gap-4">
              <Stars rating={RESTAURANT.rating.average} size={22} />
              <p className="text-muted">{RESTAURANT.rating.count} avis Google</p>
            </div>
          </div>
          <a
            href={RESTAURANT.googleReviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center gap-2 text-cream underline decoration-brass underline-offset-[6px] hover:text-brass-strong"
          >
            Voir la fiche Google
            <ArrowUpRight size={18} aria-hidden="true" />
            <span className="sr-only">(nouvel onglet)</span>
          </a>
        </section>

        {/* --- Les extraits : une grille égale, des filets, pas de cartes --- */}
        <section aria-labelledby="extraits" className="pt-12">
          <h2 id="extraits" className="text-title">
            Quelques avis récents
          </h2>
          <ul className="mt-8 grid border-t border-line md:grid-cols-2 md:gap-x-16">
            {REVIEWS.map((r) => (
              <li key={r.author} className="border-b border-line py-8">
                <blockquote>
                  <div className="flex items-center justify-between gap-4">
                    <Stars rating={r.rating} size={16} />
                    <span className="text-[0.9375rem] text-muted">{r.date}</span>
                  </div>
                  <p className="mt-4 text-lead italic">« {r.text} »</p>
                  <footer className="mt-4 text-cream">{r.author}</footer>
                </blockquote>
              </li>
            ))}
          </ul>
        </section>

        {/* --- Clôture : réserver, ou laisser un avis ----------------------- */}
        <section className="mt-16 flex flex-col gap-8 md:mt-24 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-title">Vous êtes passés nous voir ?</h2>
            <p className="mt-4 max-w-[52ch] text-muted">
              Un mot sur Google aide beaucoup une petite maison comme la nôtre.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button href="/reservation">Réserver une table</Button>
            <a
              href={RESTAURANT.googleReviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-[52px] shrink-0 items-center justify-center gap-2.5 whitespace-nowrap rounded-[2px] border border-cream px-7 text-sm font-semibold uppercase tracking-[0.14em] text-cream transition-colors hover:bg-surface"
            >
              Laisser un avis
              <ArrowUpRight size={18} aria-hidden="true" />
              <span className="sr-only">(nouvel onglet)</span>
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
