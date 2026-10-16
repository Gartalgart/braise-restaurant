import type { Metadata } from "next";
import { RESTAURANT } from "@/lib/restaurant";
import { Reveal } from "@/components/ui/Reveal";
import { PageHeader } from "@/components/ui/PageHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { Glow } from "@/components/ui/Glow";
import { HoursTable } from "@/components/contact/HoursTable";

export const metadata: Metadata = {
  title: "Contact & horaires — Braise",
  description: `Braise, ${RESTAURANT.address}. Horaires, plan d'accès et coordonnées.`,
};

function CardTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="meta flex items-center gap-3 text-braise">
      <span className="inline-block h-px w-6 bg-braise/60" aria-hidden="true" />
      {children}
    </h2>
  );
}

export default function ContactPage() {
  return (
    <div>
      <PageHeader kicker="On vous attend" title="Contact">
        <p className="mt-7 max-w-xl text-lead text-ash">
          Wazemmes, à deux rues du marché. Le téléphone reste le plus rapide
          pour les demandes particulières.
        </p>
      </PageHeader>

      <div className="relative isolate mx-auto grid max-w-6xl gap-5 overflow-x-clip px-5 pb-28 pt-14 md:grid-cols-5 md:px-8">
        <Glow className="-left-40 top-20" size={520} intensity={0.35} />

        <div className="space-y-5 md:col-span-2">
          <Reveal>
            <GlassCard as="article" className="p-7">
              <CardTitle>Horaires</CardTitle>
              <div className="mt-5">
                <HoursTable />
              </div>
            </GlassCard>
          </Reveal>

          <Reveal delay={0.08}>
            <GlassCard as="article" className="p-7">
              <CardTitle>Coordonnées</CardTitle>
              <address className="mt-5 space-y-3 font-mono text-xs uppercase not-italic tracking-wider text-ash">
                <p className="text-cream">{RESTAURANT.address}</p>
                <p>
                  <a
                    href={`tel:${RESTAURANT.phone.replace(/\s/g, "")}`}
                    className="transition-colors hover:text-ember"
                  >
                    {RESTAURANT.phone}
                  </a>
                </p>
                <p className="normal-case">
                  <a href={`mailto:${RESTAURANT.email}`} className="transition-colors hover:text-ember">
                    {RESTAURANT.email}
                  </a>
                </p>
              </address>
              <a
                href={RESTAURANT.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="meta mt-6 inline-flex items-center gap-2 text-ember underline-offset-4 hover:underline"
              >
                Itinéraire Google Maps
                <span aria-hidden="true">↗</span>
              </a>
            </GlassCard>
          </Reveal>

          <Reveal delay={0.16}>
            <GlassCard className="flex flex-col items-start gap-4 p-7">
              <p className="text-lead text-cream/85">
                Une table pour ce soir ? La réservation en ligne prend trente
                secondes.
              </p>
              <MagneticButton href="/reservation">Réserver une table</MagneticButton>
            </GlassCard>
          </Reveal>
        </div>

        <Reveal delay={0.1} className="md:col-span-3">
          <GlassCard className="h-full min-h-[460px] p-0 md:min-h-[620px]" spotlight={false} lift={false}>
            {/* Le plan est repassé en sombre pour rester dans la palette du site */}
            <iframe
              src={RESTAURANT.mapsEmbedSrc}
              title={`Plan d'accès — ${RESTAURANT.name}, ${RESTAURANT.address}`}
              className="h-full min-h-[460px] w-full border-0 md:min-h-[620px]"
              style={{ filter: "invert(0.92) hue-rotate(180deg) contrast(0.88) saturate(0.55)" }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />
            <p className="meta pointer-events-none absolute bottom-4 left-5 rounded-pill bg-night/80 px-4 py-2 text-ash backdrop-blur-md">
              Fig. — Wazemmes, à deux rues du marché
            </p>
          </GlassCard>
        </Reveal>
      </div>
    </div>
  );
}
