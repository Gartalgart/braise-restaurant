import type { Metadata } from "next";
import { ReservationFlow } from "@/components/reservation/ReservationFlow";
import { RESTAURANT } from "@/lib/restaurant";

export const metadata: Metadata = {
  title: "Réserver une table — Braise",
  description:
    "Réservez votre table chez Braise en 30 secondes : jour, convives, heure, disponibilité en temps réel.",
};

export default function ReservationPage() {
  return (
    <div className="mx-auto max-w-[880px] px-6 pb-24 pt-32 md:px-12 md:pt-40">
      <h1 className="text-display">Réserver une table</h1>
      <span className="rule mt-8" aria-hidden="true" />
      <p className="mt-8 max-w-[60ch] text-lead text-muted">
        Choisissez un jour, le nombre de convives et l&apos;heure, puis laissez vos
        coordonnées. La salle compte trente couverts.
      </p>
      <p className="mt-3 text-muted">
        Une question ou un groupe ? Appelez-nous au{" "}
        <a
          href={`tel:${RESTAURANT.phone.replace(/\s/g, "")}`}
          className="inline-flex min-h-11 items-center text-cream underline decoration-brass underline-offset-4"
        >
          {RESTAURANT.phone}
        </a>
        .
      </p>

      <ReservationFlow />
    </div>
  );
}
