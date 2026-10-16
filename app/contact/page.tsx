import type { Metadata } from "next";
import { ArrowUpRight, EnvelopeSimple, MapPin, Phone } from "@phosphor-icons/react/dist/ssr";
import { RESTAURANT } from "@/lib/restaurant";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { HoursList } from "@/components/ui/HoursList";

export const metadata: Metadata = {
  title: "Contact & horaires — Braise",
  description: `Braise, ${RESTAURANT.address}. Horaires, plan d'accès et coordonnées.`,
};

export default function ContactPage() {
  return (
    <div>
      <PageHeader title="Contact">
        <p>
          À Wazemmes, à deux rues du marché. Pour une demande particulière, le
          téléphone reste le plus rapide.
        </p>
      </PageHeader>

      <div className="mx-auto grid max-w-[1200px] gap-12 px-6 py-12 md:grid-cols-12 md:gap-16 md:px-12 md:py-16">
        <div className="space-y-12 md:col-span-5">
          <section aria-labelledby="horaires">
            <h2 id="horaires" className="text-title">
              Horaires
            </h2>
            <HoursList className="mt-6" />
          </section>

          <section aria-labelledby="coordonnees">
            <h2 id="coordonnees" className="text-title">
              Coordonnées
            </h2>
            <address className="mt-6 space-y-1 not-italic">
              <p className="flex min-h-11 items-center gap-3">
                <MapPin size={20} aria-hidden="true" className="shrink-0 text-brass" />
                {RESTAURANT.address}
              </p>
              <p>
                <a
                  href={`tel:${RESTAURANT.phone.replace(/\s/g, "")}`}
                  className="inline-flex min-h-11 items-center gap-3 hover:text-brass-strong"
                >
                  <Phone size={20} aria-hidden="true" className="shrink-0 text-brass" />
                  {RESTAURANT.phone}
                </a>
              </p>
              <p>
                <a
                  href={`mailto:${RESTAURANT.email}`}
                  className="inline-flex min-h-11 items-center gap-3 break-all hover:text-brass-strong"
                >
                  <EnvelopeSimple size={20} aria-hidden="true" className="shrink-0 text-brass" />
                  {RESTAURANT.email}
                </a>
              </p>
            </address>
            <a
              href={RESTAURANT.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex h-11 items-center gap-2 text-cream underline decoration-brass underline-offset-[6px] hover:text-brass-strong"
            >
              Itinéraire sur Google Maps
              <ArrowUpRight size={18} aria-hidden="true" />
              <span className="sr-only">(nouvel onglet)</span>
            </a>
          </section>
        </div>

        {/* Le plan, assombri pour rester dans la palette sans perdre sa lisibilité */}
        <div className="md:col-span-7">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2px] border border-line bg-surface md:aspect-auto md:h-full md:min-h-[560px]">
            <iframe
              src={RESTAURANT.mapsEmbedSrc}
              title={`Plan d'accès : ${RESTAURANT.name}, ${RESTAURANT.address}`}
              className="absolute inset-0 h-full w-full border-0"
              style={{ filter: "invert(0.9) hue-rotate(180deg) saturate(0.6) brightness(0.95)" }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1200px] px-6 pb-16 md:px-12 md:pb-24">
        <div className="flex flex-col items-start justify-between gap-6 border-t border-line pt-10 md:flex-row md:items-center">
          <p className="font-display text-[2rem] leading-tight">Une table ce soir ?</p>
          <Button href="/reservation">Réserver une table</Button>
        </div>
      </div>
    </div>
  );
}
