import Link from "next/link";
import { RESTAURANT } from "@/lib/restaurant";
import { Glow } from "@/components/ui/Glow";
import { Reveal } from "@/components/ui/Reveal";
import { MagneticButton } from "@/components/ui/MagneticButton";

function Column({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="meta flex items-center gap-3 text-braise">
        <span className="inline-block h-px w-6 bg-braise/60" aria-hidden="true" />
        {title}
      </h2>
      <div className="mt-5">{children}</div>
    </div>
  );
}

export function Footer() {
  const today = (new Date().getDay() + 6) % 7;

  return (
    <footer className="grain relative isolate mt-24 overflow-hidden border-t border-white/8 bg-coal">
      <Glow className="-bottom-96 left-1/2 -translate-x-1/2" size={900} intensity={0.7} />

      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 md:grid-cols-3 md:px-8 md:py-24">
        <Reveal>
          <Column title="La maison">
            <p className="max-w-xs text-lead text-ash">
              {RESTAURANT.tagline}. Une carte courte, trente couverts, une braise
              qui ne s&apos;éteint jamais.
            </p>
            <a
              href={RESTAURANT.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="meta mt-7 inline-flex items-center gap-2 rounded-pill border border-white/12 px-5 py-3 text-cream transition-colors hover:border-braise/60 hover:text-ember"
            >
              Instagram
              <span aria-hidden="true">↗</span>
            </a>
          </Column>
        </Reveal>

        <Reveal delay={0.08}>
          <Column title="Horaires">
            <ul className="space-y-2.5 font-mono text-xs uppercase tracking-wider text-ash">
              {RESTAURANT.hours.map((h, i) => {
                const isToday = i === today;
                return (
                  <li
                    key={h.day}
                    className={`flex items-baseline ${isToday ? "text-cream" : ""}`}
                    aria-current={isToday ? "date" : undefined}
                  >
                    <span className={isToday ? "text-ember" : ""}>{h.day}</span>
                    <span className="dots" aria-hidden="true" />
                    <span className="text-right">
                      {h.lunch || h.dinner
                        ? [h.lunch, h.dinner].filter(Boolean).join(" · ")
                        : "Fermé"}
                    </span>
                  </li>
                );
              })}
            </ul>
          </Column>
        </Reveal>

        <Reveal delay={0.16}>
          <Column title="Contact">
            <address className="space-y-2.5 font-mono text-xs uppercase not-italic tracking-wider text-ash">
              <p>{RESTAURANT.address}</p>
              <p>
                <a href={`tel:${RESTAURANT.phone.replace(/\s/g, "")}`} className="transition-colors hover:text-ember">
                  {RESTAURANT.phone}
                </a>
              </p>
              <p className="normal-case">
                <a href={`mailto:${RESTAURANT.email}`} className="transition-colors hover:text-ember">
                  {RESTAURANT.email}
                </a>
              </p>
            </address>
            <div className="mt-8">
              <MagneticButton href="/reservation" variant="outline">
                Réserver une table
              </MagneticButton>
            </div>
          </Column>
        </Reveal>
      </div>

      {/* Le nom en très grand, dégradé, comme une enseigne au néon éteinte */}
      <p
        aria-hidden="true"
        className="select-none bg-gradient-to-b from-cream/12 to-cream/0 bg-clip-text px-2 text-center font-display text-[23vw] font-bold uppercase leading-[0.78] tracking-tight text-transparent"
      >
        Braise
      </p>

      <div className="flex flex-col items-center justify-between gap-3 border-t border-white/8 px-5 py-5 text-center font-mono text-[0.65rem] uppercase tracking-widest text-ash md:flex-row md:px-8">
        <p>© {new Date().getFullYear()} Braise — {RESTAURANT.address}</p>
        <p className="flex items-center gap-4">
          <Link href="/menu" className="transition-colors hover:text-ember">
            Carte
          </Link>
          <Link href="/contact" className="transition-colors hover:text-ember">
            Accès
          </Link>
          <span>Feu de bois depuis le premier service</span>
        </p>
      </div>
    </footer>
  );
}
