import type { Metadata } from "next";
import { ReservationFlow } from "@/components/reservation/ReservationFlow";
import { Glow } from "@/components/ui/Glow";
import { RESTAURANT } from "@/lib/restaurant";

export const metadata: Metadata = {
  title: "Réserver une table — Braise",
  description:
    "Réservez votre table chez Braise en 30 secondes : date, heure, nombre de convives — disponibilité en temps réel.",
};

export default function ReservationPage() {
  return (
    <div className="grain relative isolate min-h-svh overflow-hidden">
      <Glow className="-top-64 left-1/2 -translate-x-1/2" size={780} intensity={0.6} />
      <div className="gridlines absolute inset-0 -z-10" aria-hidden="true" />

      <div className="mx-auto max-w-3xl px-5 pb-28 pt-28 md:px-8 md:pt-36">
        <p className="meta flex items-center gap-3 text-braise">
          <span className="inline-block h-px w-8 bg-braise" aria-hidden="true" />
          Table pour ce soir ?
        </p>
        <h1 className="mt-5 font-display text-hero font-bold uppercase tracking-tight">
          Réserver
        </h1>
        <p className="mt-6 max-w-xl text-lead text-ash">
          Choisissez votre créneau, laissez vos coordonnées — c&apos;est tout.
          La salle est petite : trente couverts, pas un de plus.
        </p>
        <p className="meta mt-4 text-ash/70">
          Un souci avec le formulaire ? Appelez-nous au{" "}
          <a
            href={`tel:${RESTAURANT.phone.replace(/\s/g, "")}`}
            className="text-ember underline underline-offset-4"
          >
            {RESTAURANT.phone}
          </a>
        </p>

        <ReservationFlow />
      </div>
    </div>
  );
}
