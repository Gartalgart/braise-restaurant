"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle, Minus, Phone, Plus } from "@phosphor-icons/react/dist/ssr";
import { RESTAURANT } from "@/lib/restaurant";
import { dayIndex } from "@/lib/hours";
import { Button } from "@/components/ui/Button";

type Slot = { id: string; time: string; available: boolean; remaining: number };

const DAYS_AHEAD = 28; // le back accepte 30 jours ; on en propose 28 dans la bande
const GROUP_THRESHOLD = 7; // à partir de 7 : prépaiement demandé (Stripe)
const LOW_STOCK = 4; // en dessous : « dernières places »
const LUNCH_UNTIL = "15:00"; // sépare les créneaux du midi de ceux du soir

const STEPS = ["Créneau", "Coordonnées", "Confirmation"] as const;

/** Date locale au format AAAA-MM-JJ (et non UTC : après minuit, on reste le bon jour). */
const isoLocal = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const dateFromIso = (iso: string) => new Date(`${iso}T12:00:00`);

/** Fermé ce jour-là d'après les horaires de la maison (jamais déduit d'une liste vide). */
const isClosedDay = (iso: string) => {
  const h = RESTAURANT.hours[dayIndex(dateFromIso(iso))];
  return !h.lunch && !h.dinner;
};

const longDate = (iso: string) =>
  dateFromIso(iso).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });

const hhmm = (time: string) => time.replace(":", "h");

/* -------------------------------------------------------------------------- */

/** Étapes nommées, visibles à toutes les tailles. */
function Stepper({ step }: { step: 1 | 2 | 3 }) {
  return (
    <ol className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-line pb-5">
      {STEPS.map((label, i) => {
        const index = i + 1;
        const current = step === index;
        const done = step > index;
        return (
          <li
            key={label}
            aria-current={current ? "step" : undefined}
            className={`flex items-center gap-2.5 text-[0.9375rem] ${current ? "text-cream" : "text-muted"}`}
          >
            <span
              aria-hidden="true"
              className={`flex h-7 w-7 items-center justify-center rounded-full border text-sm ${
                current ? "border-brass bg-brass text-night" : done ? "border-brass text-brass" : "border-line"
              }`}
            >
              {index}
            </span>
            {label}
            {done && <span className="sr-only"> (terminé)</span>}
          </li>
        );
      })}
    </ol>
  );
}

/** Champ texte : libellé au-dessus, 16 px pour éviter le zoom iOS. */
function Field({
  id,
  label,
  type,
  value,
  onChange,
  autoComplete,
  inputRef,
  className = "",
}: {
  id: string;
  label: string;
  type: "text" | "email" | "tel";
  value: string;
  onChange: (v: string) => void;
  autoComplete: string;
  inputRef?: React.Ref<HTMLInputElement>;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label htmlFor={id} className="text-[0.9375rem] text-cream">
        {label}
      </label>
      <input
        ref={inputRef}
        id={id}
        type={type}
        required
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-14 rounded-[2px] border border-line bg-surface px-4 text-base text-cream transition-colors focus:border-brass focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
      />
    </div>
  );
}

/** Un créneau : libre, choisi (laiton), dernières places (écrit), complet (barré). */
function SlotButton({ slot, selected, onPick }: { slot: Slot; selected: boolean; onPick: () => void }) {
  const low = slot.available && slot.remaining <= LOW_STOCK;
  return (
    <button
      type="button"
      disabled={!slot.available}
      onClick={onPick}
      aria-pressed={selected}
      aria-label={`${hhmm(slot.time)}${slot.available ? (low ? ", dernières places" : "") : ", complet"}`}
      className={`flex min-h-12 flex-col items-center justify-center rounded-[2px] border px-2 py-2 text-base transition-colors ${
        selected
          ? "border-brass bg-brass text-night"
          : slot.available
            ? "border-line text-cream hover:border-brass"
            : "cursor-not-allowed border-line/60 text-muted line-through"
      }`}
    >
      {hhmm(slot.time)}
      {low && !selected && <span className="text-xs text-brass no-underline">dernières places</span>}
    </button>
  );
}

/* -------------------------------------------------------------------------- */

export function ReservationFlow() {
  // Bande des jours réservables, calculée côté client (fuseau du visiteur)
  const days = useMemo(() => {
    const out: { iso: string; weekday: string; day: string; month: string; closed: boolean }[] = [];
    const base = new Date();
    for (let i = 0; i < DAYS_AHEAD; i++) {
      const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + i, 12);
      const iso = isoLocal(d);
      out.push({
        iso,
        weekday: d.toLocaleDateString("fr-FR", { weekday: "short" }).replace(".", ""),
        day: String(d.getDate()),
        month: d.toLocaleDateString("fr-FR", { month: "short" }).replace(".", ""),
        closed: isClosedDay(iso),
      });
    }
    return out;
  }, []);

  // Étape 1 : 3 décisions seulement (jour, convives, créneau), directive du brief.
  // Par défaut : le premier jour ouvert, pas « aujourd'hui » si on est lundi.
  const [date, setDate] = useState(() => days.find((d) => !d.closed)?.iso ?? days[0].iso);
  const [partySize, setPartySize] = useState(2);
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slot, setSlot] = useState<Slot | null>(null);
  const [nextFree, setNextFree] = useState<{ iso: string; time: string } | null | "searching">(null);

  // Étape 2 : coordonnées
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<{ date: string; time: string; partySize: number } | null>(null);

  const errorRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const confirmRef = useRef<HTMLHeadingElement>(null);

  const fetchSlots = useCallback(
    async (iso: string) => {
      const res = await fetch(`/api/creneaux?date=${iso}&partySize=${partySize}`);
      const data = await res.json();
      return (data.slots ?? []) as Slot[];
    },
    [partySize],
  );

  const loadSlots = useCallback(async () => {
    setLoadingSlots(true);
    setSlot(null);
    setNextFree(null);
    try {
      setSlots(await fetchSlots(date));
    } catch {
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }, [date, fetchSlots]);

  useEffect(() => {
    loadSlots();
  }, [loadSlots]);

  const dayClosed = isClosedDay(date);
  const noneAvailable = !loadingSlots && slots !== null && !slots.some((s) => s.available);

  // Journée fermée ou complète : on cherche le prochain créneau libre dans la bande
  useEffect(() => {
    if (!noneAvailable) return;
    let cancelled = false;
    setNextFree("searching");
    (async () => {
      for (const d of days) {
        if (d.iso <= date || d.closed) continue;
        try {
          const found = (await fetchSlots(d.iso)).find((s) => s.available);
          if (found) {
            if (!cancelled) setNextFree({ iso: d.iso, time: found.time });
            return;
          }
        } catch {
          break;
        }
      }
      if (!cancelled) setNextFree(null);
    })();
    return () => {
      cancelled = true;
    };
  }, [noneAvailable, date, days, fetchSlots]);

  // Gestion du focus : formulaire à l'étape 2, titre à la confirmation, alerte en cas d'erreur
  useEffect(() => {
    if (step === 2) nameRef.current?.focus();
    if (step === 3) {
      window.scrollTo({ top: 0 });
      confirmRef.current?.focus();
    }
  }, [step]);

  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!slot) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timeSlotId: slot.id,
          partySize,
          customerName: name,
          customerEmail: email,
          customerPhone: phone,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        // 409 : le créneau vient d'être pris pendant la saisie. Retour à l'étape 1,
        // coordonnées conservées, et le message reste affiché au-dessus des étapes.
        if (res.status === 409) {
          setError("Ce créneau vient d'être pris pendant votre saisie. Choisissez un autre horaire : vos coordonnées sont gardées.");
          setStep(1);
          loadSlots();
        } else {
          setError(data.error ?? "Une erreur est survenue. Réessayez ou appelez-nous.");
        }
        return;
      }
      setConfirmation(data);
      setStep(3);
    } catch {
      setError("Impossible de joindre le serveur. Vérifiez votre connexion et réessayez.");
    } finally {
      setSubmitting(false);
    }
  }

  const phoneHref = `tel:${RESTAURANT.phone.replace(/\s/g, "")}`;
  const lunch = (slots ?? []).filter((s) => s.time < LUNCH_UNTIL);
  const dinner = (slots ?? []).filter((s) => s.time >= LUNCH_UNTIL);

  /* --- Étape 3 : confirmation ------------------------------------------- */
  if (step === 3 && confirmation) {
    return (
      <div className="mt-12">
        <Stepper step={3} />
        <div className="mt-10">
          <CheckCircle size={48} className="text-brass" aria-hidden="true" />
          <h2 ref={confirmRef} tabIndex={-1} className="mt-6 text-display focus:outline-none">
            À {longDate(confirmation.date)}, {hhmm(confirmation.time)}.
          </h2>
          <p className="mt-4 text-lead text-muted">Votre table est réservée. À très bientôt chez Braise.</p>

          <dl className="mt-10 max-w-lg divide-y divide-line border-y border-line">
            {[
              ["Couverts", String(confirmation.partySize)],
              ["Au nom de", name],
              ["Confirmation envoyée à", email],
            ].map(([k, v]) => (
              <div key={k} className="flex items-baseline justify-between gap-6 py-4">
                <dt className="text-muted">{k}</dt>
                <dd className="text-right">{v}</dd>
              </div>
            ))}
          </dl>

          <p className="mt-8 max-w-lg text-muted">
            Un empêchement ? Prévenez-nous au{" "}
            <a href={phoneHref} className="text-cream underline decoration-brass underline-offset-4">
              {RESTAURANT.phone}
            </a>
            , la table repartira au feu sans rancune.
          </p>
        </div>
      </div>
    );
  }

  /* --- Étapes 1 et 2 ------------------------------------------------------ */
  return (
    <div className="mt-12">
      <Stepper step={step} />

      {/* Zone d'alerte toujours montée : le message survit au retour à l'étape 1 */}
      <div ref={errorRef} tabIndex={-1} role="alert" className="focus:outline-none">
        {error && (
          <p className="mt-6 border border-danger p-4 text-cream">
            <span className="text-danger">Réservation non enregistrée. </span>
            {error}
          </p>
        )}
      </div>

      {/* --- 1 · Le créneau ----------------------------------------------- */}
      <fieldset className="mt-10 min-w-0">
        <legend className="font-display text-title">Votre créneau</legend>

        {/* Jour : une bande défilable, plus rapide qu'un calendrier au pouce */}
        <div className="mt-8">
          <p id="label-jour" className="label text-muted">
            Jour
          </p>
          <div
            role="group"
            aria-labelledby="label-jour"
            className="-mx-6 mt-3 flex snap-x gap-2 overflow-x-auto px-6 pb-2 md:mx-0 md:px-0"
          >
            {days.map((d) => {
              const active = d.iso === date;
              return (
                <button
                  key={d.iso}
                  type="button"
                  onClick={() => setDate(d.iso)}
                  disabled={d.closed}
                  aria-pressed={active}
                  aria-label={`${longDate(d.iso)}${d.closed ? ", fermé" : ""}`}
                  className={`flex w-[72px] shrink-0 snap-start flex-col items-center gap-0.5 rounded-[2px] border py-3 transition-colors ${
                    active
                      ? "border-brass bg-brass text-night"
                      : d.closed
                        ? "cursor-not-allowed border-line/60 text-muted"
                        : "border-line text-cream hover:border-brass"
                  }`}
                >
                  <span className="text-sm">{d.weekday}</span>
                  <span className="font-display text-2xl leading-none">{d.day}</span>
                  <span className="text-sm">{d.closed ? "fermé" : d.month}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Convives : un pas à pas, pas un menu déroulant */}
        <div className="mt-8">
          <p id="label-convives" className="label text-muted">
            Convives
          </p>
          <div role="group" aria-labelledby="label-convives" className="mt-3 flex items-center gap-4">
            <button
              type="button"
              onClick={() => setPartySize((n) => Math.max(1, n - 1))}
              disabled={partySize <= 1}
              aria-label="Retirer un convive"
              className="flex h-12 w-12 items-center justify-center rounded-[2px] border border-line text-cream hover:border-brass disabled:opacity-40"
            >
              <Minus size={20} aria-hidden="true" />
            </button>
            <p className="min-w-[9ch] text-center" aria-live="polite">
              <span className="font-display text-4xl leading-none">{partySize}</span>
              <span className="ml-2 text-muted">{partySize > 1 ? "personnes" : "personne"}</span>
            </p>
            <button
              type="button"
              onClick={() => setPartySize((n) => Math.min(12, n + 1))}
              disabled={partySize >= 12}
              aria-label="Ajouter un convive"
              className="flex h-12 w-12 items-center justify-center rounded-[2px] border border-line text-cream hover:border-brass disabled:opacity-40"
            >
              <Plus size={20} aria-hidden="true" />
            </button>
          </div>
          {partySize >= GROUP_THRESHOLD && (
            <p className="mt-4 max-w-[60ch] border border-line bg-surface p-4 text-[0.9375rem]">
              Groupe de {partySize} : un prépaiement de 10 € par personne, déduit de
              l&apos;addition, vous sera demandé pour garantir la table.
            </p>
          )}
        </div>

        {/* Heure : créneaux réels, rechargés à chaque changement */}
        <div className="mt-8">
          <p className="label text-muted">Heure · {longDate(date)}</p>

          {loadingSlots ? (
            <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5" aria-hidden="true">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="shimmer h-12 rounded-[2px]" />
              ))}
            </div>
          ) : noneAvailable || dayClosed ? (
            <div className="mt-3 border border-line p-6">
              <p className="font-display text-2xl">
                {dayClosed
                  ? "Fermé ce jour-là, la braise se repose."
                  : `Complet ce jour-là pour ${partySize} ${partySize > 1 ? "personnes" : "personne"}.`}
              </p>
              <div className="mt-4 flex flex-col items-start gap-4" aria-live="polite">
                {nextFree === "searching" && <p className="text-muted">Recherche du prochain créneau libre…</p>}
                {nextFree && nextFree !== "searching" && (
                  <Button variant="secondary" onClick={() => setDate(nextFree.iso)}>
                    Prochain créneau libre : {longDate(nextFree.iso)}, {hhmm(nextFree.time)}
                  </Button>
                )}
                <a href={phoneHref} className="inline-flex h-11 items-center gap-2 text-cream underline decoration-brass underline-offset-4">
                  <Phone size={18} aria-hidden="true" />
                  Ou appelez-nous : {RESTAURANT.phone}
                </a>
              </div>
            </div>
          ) : (
            <div className="mt-3 space-y-6">
              {[
                ["Midi", lunch],
                ["Soir", dinner],
              ].map(([label, list]) =>
                (list as Slot[]).length > 0 ? (
                  <div key={label as string} role="group" aria-label={`Créneaux du ${String(label).toLowerCase()}`}>
                    <p className="mb-2 text-[0.9375rem] text-muted">{label as string}</p>
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                      {(list as Slot[]).map((s) => (
                        <SlotButton
                          key={s.id}
                          slot={s}
                          selected={slot?.id === s.id}
                          onPick={() => {
                            setSlot(s);
                            setError(null);
                            setStep(2);
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ) : null,
              )}
            </div>
          )}
        </div>
      </fieldset>

      {/* --- 2 · Coordonnées, seulement après le choix du créneau ---------- */}
      {step === 2 && slot && (
        <form onSubmit={submit} className="mt-12 border-t border-line pt-10">
          <fieldset className="min-w-0">
            <legend className="font-display text-title">Vos coordonnées</legend>

            <p className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span>
                {longDate(date)} · {hhmm(slot.time)} · {partySize} {partySize > 1 ? "couverts" : "couvert"}
              </span>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex h-11 items-center text-muted underline decoration-brass underline-offset-4 hover:text-cream"
              >
                Modifier
              </button>
            </p>

            <div className="mt-6 grid max-w-2xl gap-5 sm:grid-cols-2">
              <Field
                id="nom"
                label="Nom"
                type="text"
                value={name}
                onChange={setName}
                autoComplete="name"
                inputRef={nameRef}
                className="sm:col-span-2"
              />
              <Field id="email" label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" />
              <Field id="tel" label="Téléphone" type="tel" value={phone} onChange={setPhone} autoComplete="tel" />
            </div>

            <Button type="submit" disabled={submitting} className="mt-8 w-full sm:w-auto">
              {submitting ? "Envoi en cours…" : "Confirmer la réservation"}
            </Button>
          </fieldset>
        </form>
      )}
    </div>
  );
}
