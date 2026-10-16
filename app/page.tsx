import Image from "next/image";
import { ArrowRight, MapPin } from "@phosphor-icons/react/dist/ssr";
import { prisma } from "@/lib/db";
import { RESTAURANT } from "@/lib/restaurant";
import { REVIEWS } from "@/lib/reviews";
import { PHOTOS } from "@/lib/images";
import { Button } from "@/components/ui/Button";
import { Stars } from "@/components/ui/Stars";
import { TodayHours } from "@/components/ui/TodayHours";

// Rendu à la requête : évite d'exiger la base de données pendant `next build`
export const dynamic = "force-dynamic";

const FACTS = [
  { title: "Hêtre et chêne", text: "Un seul foyer, allumé avant le service, pour les viandes, les légumes et les desserts." },
  { title: "Le marché de Wazemmes", text: "La carte suit les étals du quartier et change avec les saisons du Nord." },
  { title: "Trente couverts", text: "Une seule salle, pas un couvert de plus. Mieux vaut réserver." },
];

type Signature = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
};

/** Plat signature : photo 4:3, nom en serif, prix aligné à droite. */
function SignatureDish({ dish, large = false }: { dish: Signature; large?: boolean }) {
  return (
    <article className="group">
      <div className="relative aspect-[4/3] overflow-hidden rounded-[2px] bg-surface">
        <Image
          src={dish.imageUrl}
          alt={dish.name}
          fill
          sizes={large ? "(max-width: 768px) 100vw, 58vw" : "(max-width: 768px) 100vw, 40vw"}
          className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.2,0,0,1)] group-hover:scale-[1.03]"
        />
      </div>
      <div className="mt-5 flex items-baseline justify-between gap-6">
        <h3 className={large ? "text-[2rem] leading-tight" : "text-2xl leading-tight"}>{dish.name}</h3>
        <p className="shrink-0 text-lg">{dish.price} €</p>
      </div>
      <p className="mt-2 max-w-[60ch] text-[0.9375rem] text-muted">{dish.description}</p>
    </article>
  );
}

export default async function HomePage() {
  const signatures = await prisma.dish.findMany({
    where: { isSignature: true },
    orderBy: { price: "desc" },
    take: 3,
  });
  const [lead, ...others] = signatures;
  const reviews = REVIEWS.slice(0, 3);

  return (
    <>
      {/* --- Hero : le feu et un plat réel de la carte ------------------- */}
      {/* Sur mobile, la marge basse garde la ligne horaires visible au-dessus de la barre de réservation */}
      <section className="relative isolate flex min-h-[100dvh] flex-col pb-[76px] md:pb-0">
        <Image
          src={PHOTOS.heroFire.src}
          alt={PHOTOS.heroFire.alt}
          fill
          priority
          sizes="100vw"
          className="-z-10 object-cover"
        />
        {/* Voile sombre : la seule transparence du système, pour la lisibilité */}
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-b from-night/60 via-night/45 to-night/90" />

        <div className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col items-center justify-center px-6 pb-16 pt-32 text-center md:px-12">
          <h1 className="text-hero">Braise</h1>
          <span className="rule mt-8" aria-hidden="true" />
          <p className="mt-8 text-lead text-cream">{RESTAURANT.tagline} à Lille</p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button href="/reservation">Réserver une table</Button>
            <Button href="/menu" variant="secondary">
              Voir la carte
            </Button>
          </div>
        </div>

        <div className="border-t border-cream/15">
          <div className="mx-auto flex max-w-[1200px] flex-col gap-1 px-6 py-5 text-[0.9375rem] text-cream sm:flex-row sm:justify-between md:px-12">
            <TodayHours />
            <p className="flex items-center gap-2">
              <MapPin size={18} aria-hidden="true" className="text-brass" />
              {RESTAURANT.address}
            </p>
          </div>
        </div>
      </section>

      {/* --- La maison --------------------------------------------------- */}
      <section className="mx-auto max-w-[1200px] px-6 py-16 md:px-12 md:py-24">
        <div className="grid items-center gap-10 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-5">
            <span className="rule" aria-hidden="true" />
            <h2 className="mt-6 text-title">Une carte courte, un seul feu</h2>
            <p className="mt-6 text-muted">
              Chez Braise, tout passe par le feu de bois : les viandes maturées, le
              poisson de petit bateau, les légumes rôtis entiers, jusqu&apos;aux desserts
              flambés en salle.
            </p>
            <p className="mt-4 text-muted">
              La carte suit le marché et tient en une page. Ce qui n&apos;est pas de
              saison n&apos;y figure pas.
            </p>
            <Button href="/galerie" variant="link" className="mt-8">
              Découvrir le lieu
              <ArrowRight size={18} aria-hidden="true" />
            </Button>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[2px] bg-surface md:col-span-7">
            <Image
              src={PHOTOS.grillCook.src}
              alt={PHOTOS.grillCook.alt}
              fill
              sizes="(max-width: 768px) 100vw, 58vw"
              className="object-cover"
            />
          </div>
        </div>

        <ul className="mt-16 grid gap-10 border-t border-line pt-10 md:mt-24 md:grid-cols-3 md:gap-16">
          {FACTS.map((f) => (
            <li key={f.title}>
              <h3 className="text-2xl">{f.title}</h3>
              <p className="mt-3 text-[0.9375rem] text-muted">{f.text}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* --- Les signatures : un plat en vedette, deux à côté ------------ */}
      <section className="border-t border-line bg-coal">
        <div className="mx-auto max-w-[1200px] px-6 py-16 md:px-12 md:py-24">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <span className="rule" aria-hidden="true" />
              <h2 className="mt-6 text-title">Les signatures</h2>
            </div>
            <Button href="/menu" variant="link">
              Voir toute la carte
              <ArrowRight size={18} aria-hidden="true" />
            </Button>
          </div>

          {lead && (
            <div className="mt-12 grid gap-12 md:grid-cols-12 md:gap-16">
              <div className="md:col-span-7">
                <SignatureDish dish={lead} large />
              </div>
              <div className="grid gap-12 md:col-span-5">
                {others.map((d) => (
                  <SignatureDish key={d.id} dish={d} />
                ))}
              </div>
            </div>
          )}

          <div className="mt-16 flex flex-col items-start justify-between gap-6 border-t border-line pt-10 md:mt-24 md:flex-row md:items-center">
            <p className="font-display text-[2rem] leading-tight">Une table ce soir ?</p>
            <Button href="/reservation">Réserver une table</Button>
          </div>
        </div>
      </section>

      {/* --- Le feu : une respiration avant les avis --------------------- */}
      <section className="relative isolate">
        <div className="relative h-[56vh] min-h-[360px] md:h-[70vh]">
          <Image src={PHOTOS.embers.src} alt={PHOTOS.embers.alt} fill sizes="100vw" className="object-cover" />
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-night via-night/60 to-night/30 md:from-night/85 md:via-night/20 md:to-night/40" />
        </div>
        <div className="absolute inset-x-0 bottom-0">
          <p className="mx-auto max-w-[1200px] px-6 pb-12 font-display text-[clamp(1.75rem,3.6vw,3rem)] leading-tight md:px-12 md:pb-16">
            Le feu est allumé le matin.{" "}
            <br className="hidden md:block" />
            Tout ce qui sort de la cuisine passe par lui.
          </p>
        </div>
      </section>

      {/* --- Avis -------------------------------------------------------- */}
      <section className="mx-auto max-w-[1200px] px-6 py-16 md:px-12 md:py-24">
        <div className="grid gap-12 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-4">
            <span className="rule" aria-hidden="true" />
            <h2 className="mt-6 text-title">Ce qu&apos;en disent nos clients</h2>
            <p className="mt-8 font-display text-[4rem] leading-none">
              {String(RESTAURANT.rating.average).replace(".", ",")}
              <span className="text-2xl text-muted"> / 5</span>
            </p>
            <div className="mt-4">
              <Stars rating={RESTAURANT.rating.average} size={20} />
            </div>
            <p className="mt-3 text-muted">{RESTAURANT.rating.count} avis Google</p>
            <Button href="/avis" variant="link" className="mt-8">
              Lire les avis
              <ArrowRight size={18} aria-hidden="true" />
            </Button>
          </div>

          <ul className="divide-y divide-line border-y border-line md:col-span-8">
            {reviews.map((r) => (
              <li key={r.author} className="py-8">
                <blockquote>
                  <p className="text-lead italic">« {r.text} »</p>
                  <footer className="mt-4 flex items-center gap-4 text-[0.9375rem] text-muted">
                    <span className="text-cream">{r.author}</span>
                    <Stars rating={r.rating} size={14} />
                    <span>{r.date}</span>
                  </footer>
                </blockquote>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* --- Clôture : on termine sur la réservation --------------------- */}
      <section className="border-t border-line bg-coal">
        <div className="mx-auto grid max-w-[1200px] items-center gap-12 px-6 py-16 md:grid-cols-12 md:gap-16 md:px-12 md:py-24">
          <div className="md:col-span-6">
            <h2 className="text-display">Venez nous voir</h2>
            <p className="mt-6 max-w-md text-muted">
              14 rue des Tanneurs, à deux rues du marché de Wazemmes. La réservation
              en ligne prend trente secondes ; pour une demande particulière,
              appelez-nous.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Button href="/reservation">Réserver une table</Button>
              <Button href="/contact" variant="secondary">
                Itinéraire
              </Button>
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[2px] bg-surface md:col-span-6">
            <Image src={PHOTOS.table.src} alt={PHOTOS.table.alt} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
          </div>
        </div>
      </section>
    </>
  );
}
