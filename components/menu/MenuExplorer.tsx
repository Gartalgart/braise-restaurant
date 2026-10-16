"use client";

import Image from "next/image";
import { useId, useMemo, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring } from "motion/react";
import { DishCard, type DishData } from "./DishCard";
import { ALLERGENS } from "@/lib/restaurant";
import { SPRING_SNAPPY, fadeUp, staggerParent, VIEWPORT } from "@/lib/motion";
import { useIsDesktop } from "@/lib/hooks";
import { GlassCard } from "@/components/ui/GlassCard";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { Glow } from "@/components/ui/Glow";

const CATEGORIES = [
  { value: "TOUT", label: "Tout" },
  { value: "ENTREE", label: "Entrées" },
  { value: "PLAT", label: "Plats" },
  { value: "DESSERT", label: "Desserts" },
  { value: "BOISSON", label: "Boissons" },
] as const;

const DIETS = [
  { value: "tout", label: "Tous régimes" },
  { value: "vegetarien", label: "Végétarien" },
  { value: "vegan", label: "Vegan" },
] as const;

const PRICES = [
  { value: 0, label: "Tous prix" },
  { value: 15, label: "≤ 15 €" },
  { value: 25, label: "≤ 25 €" },
] as const;

/**
 * Filtre en pastille. Quand il est actif, un fond partagé (`layoutId`) glisse
 * depuis le filtre précédent au lieu d'apparaître sèchement.
 */
function Chip({
  active,
  onClick,
  children,
  group,
  pressed,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  /** Identifiant du groupe : l'indicateur ne glisse qu'entre pairs. */
  group: string;
  pressed?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={pressed ?? active}
      className={`meta relative rounded-pill border px-4 py-2.5 transition-colors ${
        active ? "border-transparent text-night" : "border-white/10 text-ash hover:border-white/25 hover:text-cream"
      }`}
    >
      {active && (
        <motion.span
          layoutId={`chip-${group}`}
          transition={SPRING_SNAPPY}
          className="absolute inset-0 -z-10 rounded-pill bg-braise shadow-ember"
        />
      )}
      {children}
    </button>
  );
}

/** Ligne de carte imprimée : plat …… prix, avec aperçu photo au survol. */
function DishRow({
  dish,
  onHover,
}: {
  dish: DishData;
  onHover: (dish: DishData | null) => void;
}) {
  const diet = dish.isVegan ? "vegan" : dish.isVegetarian ? "végétarien" : null;

  return (
    <motion.li
      variants={fadeUp}
      onPointerEnter={() => onHover(dish)}
      onPointerLeave={() => onHover(null)}
      className="group relative border-b border-white/8 py-6 transition-colors last:border-b-0 hover:border-braise/40"
    >
      {/* Voile chaud au survol, débordant légèrement de la ligne */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -inset-x-4 inset-y-0 -z-10 rounded-card bg-gradient-to-r from-braise/8 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
      <div className="flex items-baseline">
        <h3 className="font-display text-2xl font-bold uppercase leading-none transition-colors group-hover:text-ember md:text-3xl">
          {dish.name}
          {dish.isSignature && (
            <span className="ml-1.5 align-super text-base text-braise" title="Plat signature">
              ✳
            </span>
          )}
        </h3>
        <span className="dots" aria-hidden="true" />
        <p className="shrink-0 font-mono text-cream">{dish.price} €</p>
      </div>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-ash">{dish.description}</p>
      {(diet || dish.allergens.length > 0) && (
        <p className="meta mt-2.5 text-[0.62rem] text-ash/70">
          {diet && <span className="text-ember">{diet} · </span>}
          {dish.allergens.length > 0 ? dish.allergens.join(", ") : "sans allergène majeur"}
        </p>
      )}
    </motion.li>
  );
}

/* -------------------------------------------------------------------------- */

export function MenuExplorer({ dishes }: { dishes: DishData[] }) {
  const [category, setCategory] = useState<string>("TOUT");
  const [diet, setDiet] = useState<string>("tout");
  const [maxPrice, setMaxPrice] = useState(0);
  const [excluded, setExcluded] = useState<string[]>([]);
  const [allergensOpen, setAllergensOpen] = useState(false);
  const [preview, setPreview] = useState<DishData | null>(null);

  const desktop = useIsDesktop();
  const panelId = useId();

  // Aperçu photo qui suit le curseur le long de la carte
  const px = useSpring(useMotionValue(0), { stiffness: 220, damping: 28 });
  const py = useSpring(useMotionValue(0), { stiffness: 220, damping: 28 });

  const filtered = useMemo(
    () =>
      dishes.filter((d) => {
        if (category !== "TOUT" && d.category !== category) return false;
        if (diet === "vegetarien" && !d.isVegetarian && !d.isVegan) return false;
        if (diet === "vegan" && !d.isVegan) return false;
        if (maxPrice > 0 && d.price > maxPrice) return false;
        if (excluded.some((a) => d.allergens.includes(a))) return false;
        return true;
      }),
    [dishes, category, diet, maxPrice, excluded],
  );

  const signatures = filtered.filter((d) => d.isSignature);
  const others = filtered.filter((d) => !d.isSignature);

  // La carte se lit par sections, comme sur papier
  const sections = CATEGORIES.filter((c) => c.value !== "TOUT")
    .map((c) => ({ ...c, dishes: others.filter((d) => d.category === c.value) }))
    .filter((s) => s.dishes.length > 0);

  const toggleAllergen = (a: string) =>
    setExcluded((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));

  const resetAll = () => {
    setCategory("TOUT");
    setDiet("tout");
    setMaxPrice(0);
    setExcluded([]);
  };

  return (
    <div
      className="relative mx-auto max-w-6xl px-5 pb-28 md:px-8"
      onPointerMove={(e) => {
        px.set(e.clientX + 28);
        py.set(e.clientY - 90);
      }}
    >
      {/* --- Barre de filtres, collée sous l'en-tête flottant -------------- */}
      <div className="sticky top-20 z-40 -mx-5 px-5 pt-6 md:top-24 md:mx-0 md:px-0">
        <GlassCard spotlight={false} lift={false} className="space-y-3 p-4 md:p-5">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrer par catégorie">
            {CATEGORIES.map((c) => (
              <Chip key={c.value} group="cat" active={category === c.value} onClick={() => setCategory(c.value)}>
                {c.label}
              </Chip>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrer par régime">
              {DIETS.map((d) => (
                <Chip key={d.value} group="diet" active={diet === d.value} onClick={() => setDiet(d.value)}>
                  {d.label}
                </Chip>
              ))}
            </div>
            <span className="mx-1 hidden h-5 w-px bg-white/12 md:block" aria-hidden="true" />
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrer par prix">
              {PRICES.map((p) => (
                <Chip key={p.value} group="price" active={maxPrice === p.value} onClick={() => setMaxPrice(p.value)}>
                  {p.label}
                </Chip>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setAllergensOpen((v) => !v)}
              aria-expanded={allergensOpen}
              aria-controls={panelId}
              className="meta flex items-center gap-2 rounded-pill border border-white/10 px-4 py-2.5 text-ember transition-colors hover:border-ember/50"
            >
              Exclure des allergènes
              {excluded.length > 0 && (
                <span className="rounded-pill bg-ember px-2 py-0.5 text-[0.6rem] text-night">{excluded.length}</span>
              )}
              <motion.span animate={{ rotate: allergensOpen ? 90 : 0 }} transition={SPRING_SNAPPY} aria-hidden="true">
                →
              </motion.span>
            </button>

            <p className="meta text-ash" aria-live="polite">
              {filtered.length} {filtered.length > 1 ? "plats" : "plat"} / {dishes.length}
            </p>

            {(category !== "TOUT" || diet !== "tout" || maxPrice > 0 || excluded.length > 0) && (
              <button
                type="button"
                onClick={resetAll}
                className="meta text-ash underline underline-offset-4 transition-colors hover:text-cream"
              >
                Tout réinitialiser
              </button>
            )}
          </div>

          <AnimatePresence initial={false}>
            {allergensOpen && (
              <motion.div
                id={panelId}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap gap-2 pt-1" role="group" aria-label="Exclure des allergènes">
                  {ALLERGENS.map((a) => (
                    <Chip
                      key={a}
                      group={`allergen-${a}`}
                      active={excluded.includes(a)}
                      pressed={excluded.includes(a)}
                      onClick={() => toggleAllergen(a)}
                    >
                      sans {a}
                    </Chip>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>
      </div>

      {/* --- Les signatures ----------------------------------------------- */}
      <AnimatePresence mode="popLayout">
        {signatures.length > 0 && (
          <motion.section
            key="signatures"
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={SPRING_SNAPPY}
            className="relative isolate mt-16 overflow-x-clip"
            aria-label="Plats signature"
          >
            <Glow className="-left-32 top-0" size={480} intensity={0.35} />
            <div className="flex items-end gap-4 border-b border-white/10 pb-4">
              <span className="meta text-braise">(✳)</span>
              <h2 className="font-display text-title font-bold uppercase leading-none">Les signatures</h2>
            </div>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {signatures.map((dish, i) => (
                <DishCard key={dish.id} dish={dish} index={i} />
              ))}
            </div>

            {/* CTA après la section la plus visuelle */}
            <GlassCard className="mt-10 flex flex-col items-center gap-5 px-6 py-12 text-center">
              <p className="font-display text-title font-bold uppercase leading-none">
                L&apos;eau à la <em className="font-serif normal-case text-ember">bouche</em> ?
              </p>
              <MagneticButton href="/reservation">Réserver une table</MagneticButton>
            </GlassCard>
          </motion.section>
        )}
      </AnimatePresence>

      {/* --- Le reste de la carte, en liste typographique ------------------ */}
      {sections.length > 0
        ? sections.map((s) => (
            <section key={s.value} className="mt-16" aria-label={s.label}>
              <div className="flex items-baseline justify-between border-b border-white/10 pb-4">
                <h2 className="font-display text-title font-bold uppercase leading-none">{s.label}</h2>
                <span className="meta text-ash">
                  {s.dishes.length} {s.dishes.length > 1 ? "plats" : "plat"}
                </span>
              </div>
              <motion.ul
                variants={staggerParent(0.05)}
                initial="hidden"
                whileInView="visible"
                viewport={VIEWPORT}
              >
                {s.dishes.map((dish) => (
                  <DishRow key={dish.id} dish={dish} onHover={setPreview} />
                ))}
              </motion.ul>
            </section>
          ))
        : signatures.length === 0 && (
            <GlassCard className="mt-16 p-12 text-center" spotlight={false} lift={false}>
              <p className="text-lead text-ash">
                Aucun plat ne correspond à ces filtres — essayez d&apos;en retirer
                un, ou demandez-nous en salle : la cuisine s&apos;adapte volontiers.
              </p>
              <div className="mt-6 flex justify-center">
                <MagneticButton variant="outline" onClick={resetAll}>
                  Réinitialiser les filtres
                </MagneticButton>
              </div>
            </GlassCard>
          )}

      {/* --- Aperçu photo au survol d'une ligne (desktop) ------------------ */}
      <AnimatePresence>
        {desktop && preview && (
          <motion.div
            key={preview.id}
            style={{ x: px, y: py }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.22 }}
            className="pointer-events-none fixed left-0 top-0 z-50 hidden h-[170px] w-[240px] overflow-hidden rounded-card border border-white/12 shadow-lift md:block"
            aria-hidden="true"
          >
            <Image src={preview.imageUrl} alt="" fill sizes="240px" className="object-cover" />
            <span className="absolute inset-0 bg-gradient-to-t from-night/70 to-transparent" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
