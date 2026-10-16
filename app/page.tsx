import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { RESTAURANT } from "@/lib/restaurant";
import { REVIEWS } from "@/lib/reviews";
import { GALLERY } from "@/lib/gallery";
import { HeroExperience } from "@/components/home/HeroExperience";
import { ReviewsTicker } from "@/components/home/ReviewsTicker";
import { Reveal } from "@/components/ui/Reveal";
import { Marquee } from "@/components/ui/Marquee";
import { DishCard } from "@/components/menu/DishCard";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { Glow } from "@/components/ui/Glow";
import { Counter } from "@/components/ui/Counter";
import { Stars } from "@/components/ui/Stars";

// Rendu à la requête : évite d'exiger la base de données pendant `next build`
export const dynamic = "force-dynamic";

/** Tuile photo du bento, avec sa légende de planche technique. */
function PhotoTile({
  index,
  caption,
  className = "",
  sizes,
}: {
  index: number;
  caption: string;
  className?: string;
  sizes: string;
}) {
  return (
    <GlassCard className={`group relative min-h-[260px] ${className}`} spotlight={false}>
      <Image
        src={GALLERY[index].src}
        alt={GALLERY[index].alt}
        fill
        sizes={sizes}
        className="object-cover opacity-70 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105 group-hover:opacity-100"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-night/85 via-night/10 to-transparent" />
      <p className="meta absolute bottom-4 left-5 text-cream/80">{caption}</p>
    </GlassCard>
  );
}

/** Tuile chiffre du bento : une donnée, une unité, une glose. */
function StatTile({
  value,
  decimals = 0,
  suffix = "",
  label,
  note,
  className = "",
}: {
  value: number;
  decimals?: number;
  suffix?: string;
  label: string;
  note: string;
  className?: string;
}) {
  return (
    <GlassCard className={`flex min-h-[180px] flex-col justify-between p-6 ${className}`}>
      <p className="meta text-braise">{label}</p>
      <div>
        <p className="font-display text-6xl font-bold leading-none text-cream md:text-7xl">
          <Counter value={value} decimals={decimals} suffix={suffix} />
        </p>
        <p className="mt-2 text-sm text-ash">{note}</p>
      </div>
    </GlassCard>
  );
}

export default async function HomePage() {
  const signatures = await prisma.dish.findMany({
    where: { isSignature: true },
    take: 3,
  });

  return (
    <>
      <HeroExperience />

      <Marquee items={["Feu de bois", "Marché de Wazemmes", "Carte courte", "Trente couverts", "Lille"]} />

      {/* 01 — La maison, en bento : texte, photos, chiffres ----------------- */}
      <section className="relative isolate mx-auto max-w-6xl overflow-x-clip px-5 py-24 md:px-8 md:py-32">
        <Glow className="-left-40 top-20" size={520} intensity={0.4} />

        <SectionHeading num="01" kicker="La maison" title="Une carte courte, un feu constant" />

        <div className="mt-14 grid gap-4 md:grid-cols-12">
          <Reveal className="md:col-span-7">
            <GlassCard className="flex h-full flex-col justify-between p-7 md:p-9">
              <div>
                <p className="text-lead text-cream/85">
                  Chez Braise, la carte suit le marché de Wazemmes et les saisons
                  du Nord. Tout passe par le feu de bois : les viandes maturées,
                  les légumes entiers, jusqu&apos;aux desserts flambés en salle.
                </p>
                <ul className="mt-8 space-y-3 font-mono text-xs uppercase tracking-wider text-ash">
                  <li className="flex items-baseline">
                    Produits <span className="dots" aria-hidden="true" /> Hauts-de-France
                  </li>
                  <li className="flex items-baseline">
                    Cuisson <span className="dots" aria-hidden="true" /> Braise de hêtre &amp; chêne
                  </li>
                  <li className="flex items-baseline">
                    Salle <span className="dots" aria-hidden="true" /> 30 couverts, pas un de plus
                  </li>
                </ul>
              </div>
              <div className="mt-9">
                <MagneticButton href="/galerie" variant="outline">
                  Découvrir le lieu
                  <span aria-hidden="true">→</span>
                </MagneticButton>
              </div>
            </GlassCard>
          </Reveal>

          <Reveal delay={0.08} className="md:col-span-5">
            <PhotoTile
              index={2}
              caption="Fig. 01 — la salle"
              className="h-full min-h-[320px]"
              sizes="(max-width: 768px) 100vw, 42vw"
            />
          </Reveal>

          <Reveal delay={0.04} className="md:col-span-3">
            <StatTile value={30} label="Couverts" note="Une seule salle, un seul service à la fois." className="h-full" />
          </Reveal>

          <Reveal delay={0.1} className="md:col-span-3">
            <StatTile
              value={RESTAURANT.rating.average}
              decimals={1}
              suffix="/5"
              label="Note Google"
              note={`Sur ${RESTAURANT.rating.count} avis vérifiés.`}
              className="h-full"
            />
          </Reveal>

          <Reveal delay={0.16} className="md:col-span-6">
            <PhotoTile
              index={8}
              caption="Fig. 02 — la tablée"
              className="h-full min-h-[220px]"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </Reveal>
        </div>
      </section>

      {/* 02 — Les signatures ---------------------------------------------- */}
      <section className="relative isolate overflow-hidden border-y border-white/8 bg-coal py-24 md:py-32">
        <Glow className="-top-40 right-0" size={700} intensity={0.55} />
        <div className="gridlines absolute inset-0 -z-10" aria-hidden="true" />

        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <SectionHeading num="02" kicker="À ne pas manquer" title="Les signatures" />

          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {signatures.map((dish, i) => (
              <DishCard key={dish.id} dish={dish} index={i} />
            ))}
          </div>

          {/* CTA après la section la plus visuelle (directive UX du brief) */}
          <Reveal className="mt-16 flex flex-col items-center gap-5 text-center">
            <p className="font-display text-title font-bold uppercase leading-none">
              L&apos;eau à la <em className="font-serif normal-case text-ember">bouche</em> ?
            </p>
            <MagneticButton href="/reservation">Réserver une table</MagneticButton>
            <p className="meta text-ash">
              Ou parcourez{" "}
              <Link href="/menu" className="text-cream underline underline-offset-4 transition-colors hover:text-ember">
                la carte complète
              </Link>
            </p>
          </Reveal>
        </div>
      </section>

      <Marquee items={["Ouvert du mardi au dimanche", "Réservation en 30 secondes", "Desserts flambés en salle"]} />

      {/* 03 — Avis --------------------------------------------------------- */}
      <section className="relative isolate overflow-x-clip py-24 md:py-32">
        <Glow className="-right-32 bottom-0" size={560} intensity={0.35} />

        <div className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-8 px-5 md:px-8">
          <SectionHeading num="03" kicker="Ils en parlent" title="Avis clients" />

          <Reveal delay={0.1}>
            <GlassCard className="flex items-center gap-5 px-6 py-5">
              <span className="font-display text-6xl font-bold leading-none text-ember">
                <Counter value={RESTAURANT.rating.average} decimals={1} />
              </span>
              <div>
                <Stars rating={RESTAURANT.rating.average} size={18} />
                <p className="meta mt-2 text-ash">{RESTAURANT.rating.count} avis Google</p>
              </div>
            </GlassCard>
          </Reveal>
        </div>

        {/* Bande d'avis en défilement continu, pleine largeur */}
        <div className="mt-14">
          <ReviewsTicker reviews={[...REVIEWS]} />
        </div>

        <Reveal className="mx-auto mt-12 max-w-6xl px-5 md:px-8">
          <MagneticButton href="/avis" variant="outline">
            Lire tous les avis
            <span aria-hidden="true">→</span>
          </MagneticButton>
        </Reveal>
      </section>
    </>
  );
}
