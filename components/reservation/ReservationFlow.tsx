"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { EASE, SPRING_BOUNCY, SPRING_SNAPPY, staggerParent } from "@/lib/motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { MagneticButton } from "@/components/ui/MagneticButton";

type Slot = { id: string; time: string; available: boolean; remaining: number };

const todayISO = () => new Date().toISOString().slice(0, 10);
const DAYS_AHEAD = 28; // le back accepte 30 jours ; on en propose 28 dans la bande

const GROUP_THRESHOLD = 7; // au-delà : prépaiement demandé (Stripe)
const LOW_STOCK = 4; // en dessous : on affiche « dernières places »

const STEPS = ["Créneau", "Coordonnées", "C'est noté"] as const;

/* -------------------------------------------------------------------------- */

/** Fil d'Ariane des étapes, avec barre de progression continue. */
function Stepper({ step }: { step: 1 | 2 | 3 }) {
  return (
    <div>
      <ol className="flex items-center gap-2">
        {STEPS.map((label, i) => {
          const index = (i + 1) as 1 | 2 | 3;
          const done = step > index;
          const current = step === index;
          return (
            <li key={label} className="flex flex-1 items-center gap-2">
              <span
                className={`meta flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors ${
                  done
                    ? "border-ember bg-ember text-night"
                    : current
                      ? "border-braise bg-braise text-night shadow-ember"
                      : "border-white/15 text-ash"
                }`}
                aria-hidden="true"
              >
                {done ? "✓" : `0${index}`}
              </span>
              <span className={`meta hidden sm:block ${current ? "text-cream" : "text-ash"}`}>
                {label}
              </span>
              {i < STEPS.length - 1 && <span className="h-px flex-1 bg-white/10" aria-hidden="true" />}
            </li>
          );
        })}
      </ol>
      <div className="mt-4 h-[3px] overflow-hidden rounded-pill bg-white/8">
        <motion.div
          className="h-full rounded-pill bg-gradient-to-r from-ember to-braise"
          initial={false}
          animate={{ width: `${(step / 3) * 100}%` }}
          transition={SPRING_SNAPPY}
        />
      </div>
      <p className="sr-only" aria-live="polite">
        Étape {step} sur 3 : {STEPS[step - 1]}
      </p>
    </div>
  );
}

/** Champ à label flottant — le label monte quand le champ est rempli ou actif. */
function Field({
  label,
  type,
  value,
  onChange,
  autoComplete,
  className = "",
}: {
  label: string;
  type: "text" | "email" | "tel";
  value: string;
  onChange: (v: string) => void;
  autoComplete: string;
  className?: string;
}) {
  return (
    <label className={`relative block ${className}`}>
      <input
        type={type}
        required
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder=" "
        className="peer w-full rounded-card border border-white/12 bg-white/4 px-4 pb-3 pt-6 font-mono text-sm text-cream transition-colors placeholder-shown:pt-4 focus:border-braise/70 focus:bg-white/6 focus:outline-none"
      />
      <span className="meta pointer-events-none absolute left-4 top-2 text-ash transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-[0.75rem] peer-focus:top-2 peer-focus:text-[0.7rem] peer-focus:text-braise">
        {label}
      </span>
    </label>
  );
}

/* -------------------------------------------------------------------------- */

export function ReservationFlow() {
  // Étape 1 — 3 décisions seulement : jour, convives, créneau (directive du brief)
  const [date, setDate] = useState(todayISO());
  const [partySize, setPartySize] = useState(2);
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slot, setSlot] = useState<Slot | null>(null);

  // Étape 2 — coordonnées
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<{ date: string; time: string; partySize: number } | null>(null);

  const formRef = useRef<HTMLFormElement>(null);

  // Bande des jours réservables — calculée une fois côté client
  const days = useMemo(() => {
    const out: { iso: string; weekday: string; day: string; month: string }[] = [];
    const base = new Date();
    for (let i = 0; i < DAYS_AHEAD; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      out.push({
        iso: d.toISOString().slice(0, 10),
        weekday: d.toLocaleDateString("fr-FR", { weekday: "short" }).replace(".", ""),
        day: String(d.getDate()).padStart(2, "0"),
        month: d.toLocaleDateString("fr-FR", { month: "short" }).replace(".", ""),
      });
    }
    return out;
  }, []);

  const loadSlots = useCallback(async () => {
    setLoadingSlots(true);
    setSlot(null);
    try {
      const res = await fetch(`/api/creneaux?date=${date}&partySize=${partySize}`);
      const data = await res.json();
      setSlots(data.slots ?? []);
    } catch {
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }, [date, partySize]);

  useEffect(() => {
    loadSlots();
  }, [loadSlots]);

  // Le formulaire de coordonnées vient d'apparaître : on l'amène à l'écran.
  // À la confirmation, on remonte : le récapitulatif se lit depuis son titre.
  useEffect(() => {
    if (step === 2) formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    if (step === 3) window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

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
        setError(data.error ?? "Une erreur est survenue.");
        // 409 : le créneau vient d'être pris pendant la saisie — on recharge
        if (res.status === 409) {
          setStep(1);
          loadSlots();
        }
        return;
      }
      setConfirmation(data);
      setStep(3);
    } catch {
      setError("Impossible de joindre le serveur — réessayez.");
    } finally {
      setSubmitting(false);
    }
  }

  const dateLabel = (iso: string) =>
    new Date(`${iso}T12:00:00`).toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });

  /* --- Étape 3 : confirmation --------------------------------------------- */
  if (step === 3 && confirmation) {
    return (
      <div className="mt-10">
        <Stepper step={3} />
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={SPRING_BOUNCY}
          className="mt-8"
        >
          <GlassCard className="p-8 md:p-10" spotlight={false} lift={false}>
            {/* La coche se dessine, elle n'apparaît pas */}
            <motion.svg
              width="56"
              height="56"
              viewBox="0 0 52 52"
              aria-hidden="true"
              className="text-braise"
            >
              <motion.circle
                cx="26"
                cy="26"
                r="24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.7, ease: EASE }}
              />
              <motion.path
                d="M15 27l8 8 15-16"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: 0.5, ease: EASE }}
              />
            </motion.svg>

            <h2 className="mt-6 font-display text-display font-bold uppercase leading-none">
              À {confirmation.time.replace(":", "h")},
              <br />
              <span className="text-ember">{dateLabel(confirmation.date)}.</span>
            </h2>

            <ul className="mt-8 space-y-3 border-t border-white/10 pt-6 font-mono text-xs uppercase tracking-wider text-ash">
              <li className="flex items-baseline">
                Couverts <span className="dots" aria-hidden="true" />
                <span className="text-cream">{confirmation.partySize}</span>
              </li>
              <li className="flex items-baseline">
                Au nom de <span className="dots" aria-hidden="true" />
                <span className="text-cream">{name}</span>
              </li>
              <li className="flex items-baseline normal-case">
                Confirmation <span className="dots" aria-hidden="true" />
                <span className="text-cream">{email}</span>
              </li>
            </ul>

            <p className="meta mt-6 border-t border-white/10 pt-6 text-ash">
              Un empêchement ? Appelez-nous, la table repartira au feu sans rancune.
            </p>
          </GlassCard>
        </motion.div>
      </div>
    );
  }

  /* --- Étapes 1 & 2 -------------------------------------------------------- */
  return (
    <div className="mt-10">
      <Stepper step={step} />

      {/* --- 01 · Le créneau -------------------------------------------- */}
      <GlassCard className="mt-8 p-6 md:p-8" spotlight={false} lift={false}>
        {/* `min-w-0` : sans ça, la largeur mini d'un fieldset est celle de son
            contenu — la bande des 28 jours ferait déborder toute la carte. */}
        <fieldset className="min-w-0">
          <legend className="meta text-braise">01 · Votre créneau</legend>

          {/* Bande des jours : plus rapide qu'un sélecteur de date au pouce */}
          <div className="mt-6">
            <p className="meta mb-3 text-ash">Jour</p>
            <div
              className="-mx-1 flex snap-x snap-mandatory gap-2 overflow-x-auto px-1 pb-2"
              role="group"
              aria-label="Choisir un jour"
            >
              {days.map((d) => {
                const active = d.iso === date;
                return (
                  <button
                    key={d.iso}
                    type="button"
                    onClick={() => setDate(d.iso)}
                    aria-pressed={active}
                    aria-label={dateLabel(d.iso)}
                    className={`relative flex w-[68px] shrink-0 snap-start flex-col items-center gap-0.5 rounded-card border px-2 py-3 transition-colors ${
                      active
                        ? "border-transparent text-night"
                        : "border-white/10 text-ash hover:border-white/25 hover:text-cream"
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="day-active"
                        transition={SPRING_SNAPPY}
                        className="absolute inset-0 -z-10 rounded-card bg-braise shadow-ember"
                      />
                    )}
                    <span className="meta text-[0.6rem] opacity-80">{d.weekday}</span>
                    <span className="font-display text-2xl font-bold leading-none">{d.day}</span>
                    <span className="meta text-[0.55rem] opacity-70">{d.month}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Convives : un pas à pas, pas un menu déroulant */}
          <div className="mt-7">
            <p className="meta mb-3 text-ash">Convives</p>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setPartySize((n) => Math.max(1, n - 1))}
                disabled={partySize <= 1}
                aria-label="Retirer un convive"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/12 text-xl text-cream transition-colors hover:border-braise/60 hover:text-ember disabled:opacity-30"
              >
                −
              </button>
              <p className="min-w-[7ch] text-center" aria-live="polite">
                <span className="font-display text-4xl font-bold leading-none">{partySize}</span>
                <span className="meta ml-2 text-ash">{partySize > 1 ? "pers." : "pers."}</span>
              </p>
              <button
                type="button"
                onClick={() => setPartySize((n) => Math.min(12, n + 1))}
                disabled={partySize >= 12}
                aria-label="Ajouter un convive"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/12 text-xl text-cream transition-colors hover:border-braise/60 hover:text-ember disabled:opacity-30"
              >
                +
              </button>
            </div>
          </div>

          {/* Créneaux réels, rechargés à chaque changement */}
          <div className="mt-7" role="group" aria-label="Créneaux disponibles" aria-live="polite">
            <p className="meta mb-3 text-ash">Heure</p>

            {loadingSlots ? (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="shimmer h-[52px] rounded-card" aria-hidden="true" />
                ))}
              </div>
            ) : slots && slots.length > 0 ? (
              <motion.div
                variants={staggerParent(0.03)}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-3 gap-2 sm:grid-cols-5"
              >
                {slots.map((s) => {
                  const selected = slot?.id === s.id;
                  const low = s.available && s.remaining <= LOW_STOCK;
                  return (
                    <motion.button
                      key={s.id}
                      type="button"
                      variants={{
                        hidden: { opacity: 0, y: 10 },
                        visible: { opacity: 1, y: 0, transition: SPRING_SNAPPY },
                      }}
                      disabled={!s.available}
                      onClick={() => {
                        setSlot(s);
                        setStep(2);
                      }}
                      aria-pressed={selected}
                      aria-label={`${s.time.replace(":", "h")}${
                        s.available ? (low ? ", dernières places" : "") : ", complet"
                      }`}
                      className={`relative rounded-card border py-3.5 font-mono text-sm transition-colors ${
                        selected
                          ? "border-transparent text-night"
                          : s.available
                            ? "border-white/12 text-cream hover:border-braise/60 hover:bg-braise/10"
                            : "cursor-not-allowed border-white/6 text-ash/35 line-through"
                      }`}
                    >
                      {selected && (
                        <motion.span
                          layoutId="slot-active"
                          transition={SPRING_SNAPPY}
                          className="absolute inset-0 -z-10 rounded-card bg-braise shadow-ember"
                        />
                      )}
                      {s.time.replace(":", "h")}
                      {low && !selected && (
                        <span className="absolute -top-1.5 right-1.5 h-2 w-2 rounded-full bg-ember" title="Dernières places" />
                      )}
                    </motion.button>
                  );
                })}
              </motion.div>
            ) : (
              <p className="rounded-card border border-dashed border-white/12 p-6 text-sm text-ash">
                Fermé ce jour-là (le lundi, la braise se repose). Essayez une
                autre date dans la bande ci-dessus.
              </p>
            )}

            {slots && slots.some((s) => s.available && s.remaining <= LOW_STOCK) && (
              <p className="meta mt-3 flex items-center gap-2 text-ember">
                <span className="h-2 w-2 rounded-full bg-ember" aria-hidden="true" />
                Point orange : dernières places sur ce créneau
              </p>
            )}
          </div>

          {partySize >= GROUP_THRESHOLD && (
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={SPRING_SNAPPY}
              className="mt-6 rounded-card border border-braise/40 bg-braise/8 p-4 font-mono text-xs uppercase leading-relaxed tracking-wider text-cream/90"
            >
              Groupe de {partySize} : un prépaiement de 10 € par personne (déduit
              de l&apos;addition) vous sera demandé pour garantir la table.
            </motion.p>
          )}
        </fieldset>
      </GlassCard>

      {/* --- 02 · Coordonnées, seulement après le choix du créneau -------- */}
      <AnimatePresence>
        {step === 2 && slot && (
          <motion.form
            ref={formRef}
            onSubmit={submit}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={SPRING_SNAPPY}
            className="mt-5"
          >
            <GlassCard className="p-6 md:p-8" spotlight={false} lift={false}>
              <fieldset className="min-w-0">
                <legend className="meta text-braise">02 · Vos coordonnées</legend>

                <p className="meta mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-ash">
                  <span className="text-cream">{dateLabel(date)}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-cream">{slot.time.replace(":", "h")}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-cream">
                    {partySize} {partySize > 1 ? "couverts" : "couvert"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="underline underline-offset-4 transition-colors hover:text-ember"
                  >
                    Modifier
                  </button>
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <Field
                    label="Nom"
                    type="text"
                    value={name}
                    onChange={setName}
                    autoComplete="name"
                    className="sm:col-span-2"
                  />
                  <Field label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" />
                  <Field label="Téléphone" type="tel" value={phone} onChange={setPhone} autoComplete="tel" />
                </div>

                {error && (
                  <motion.p
                    role="alert"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mt-5 rounded-card border border-braise/50 bg-braise/12 p-4 text-sm text-cream"
                  >
                    {error}
                  </motion.p>
                )}

                <div className="mt-7">
                  <MagneticButton type="submit" disabled={submitting}>
                    {submitting ? "Un instant…" : "Confirmer la réservation"}
                  </MagneticButton>
                </div>
              </fieldset>
            </GlassCard>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
