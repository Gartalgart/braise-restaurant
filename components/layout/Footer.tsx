import Link from "next/link";
import { RESTAURANT } from "@/lib/restaurant";
import { Button } from "@/components/ui/Button";
import { HoursList } from "@/components/ui/HoursList";

export function Footer() {
  return (
    // Sur mobile, la marge basse laisse la place à la barre de réservation fixe
    <footer className="border-t border-line bg-coal pb-24 md:pb-0">
      <div className="mx-auto grid max-w-[1200px] gap-12 px-6 py-16 sm:grid-cols-2 md:gap-16 md:px-12 md:py-24 lg:grid-cols-3">
        <div>
          <p className="font-display text-[1.75rem] leading-none">Braise</p>
          <p className="mt-5 max-w-xs text-muted">
            {RESTAURANT.tagline}. Une carte courte, trente couverts, un feu qui ne
            s&apos;éteint pas avant la fin du service.
          </p>
          <a
            href={RESTAURANT.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex h-11 items-center text-cream underline decoration-brass underline-offset-[6px] hover:text-brass-strong"
          >
            Instagram
          </a>
        </div>

        <div>
          <h2 className="label text-muted">Horaires</h2>
          <HoursList className="mt-5" />
        </div>

        <div>
          <h2 className="label text-muted">Contact</h2>
          <address className="mt-5 space-y-1 not-italic">
            <p>{RESTAURANT.address}</p>
            <p>
              <a
                href={`tel:${RESTAURANT.phone.replace(/\s/g, "")}`}
                className="inline-flex h-11 items-center hover:text-brass-strong"
              >
                {RESTAURANT.phone}
              </a>
            </p>
            <p>
              <a href={`mailto:${RESTAURANT.email}`} className="inline-flex h-11 items-center hover:text-brass-strong">
                {RESTAURANT.email}
              </a>
            </p>
          </address>
          <Button href="/reservation" variant="secondary" className="mt-6">
            Réserver une table
          </Button>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-2 px-6 py-6 text-sm text-muted md:flex-row md:items-center md:justify-between md:px-12">
          <p>© {new Date().getFullYear()} Braise · {RESTAURANT.address}</p>
          <p>Restaurant fictif, site de démonstration.</p>
        </div>
      </div>
    </footer>
  );
}
