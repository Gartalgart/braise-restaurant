"use client";

import Image from "next/image";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Faders, X } from "@phosphor-icons/react/dist/ssr";
import { DishCard, DishFacts, type DishData } from "./DishCard";
import { ALLERGENS } from "@/lib/restaurant";
import { useIsDesktop } from "@/lib/hooks";
import { Button } from "@/components/ui/Button";

const CATEGORIES = [
  { value: "TOUT", label: "Tout" },
  { value: "ENTREE", label: "Entrées" },
  { value: "PLAT", label: "Plats" },
  { value: "DESSERT", label: "Desserts" },
  { value: "BOISSON", label: "Boissons" },
] as const;

// Un groupe sans choix vaut « tous » : pas de pastille « Tous régimes » allumée
const DIETS = [
  { value: "vegetarien", label: "Végétarien" },
  { value: "vegan", label: "Vegan" },
] as const;

const PRICES = [
  { value: 15, label: "15 € et moins" },
  { value: 25, label: "25 € et moins" },
] as const;

/** Pastille de filtre : 44 px de haut, pleine en laiton quand elle est active. */
function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex h-11 shrink-0 items-center whitespace-nowrap rounded-[2px] border px-4 text-[0.9375rem] transition-colors ${
        active ? "border-brass bg-brass text-night" : "border-line text-cream hover:border-muted"
      }`}
    >
      {children}
    </button>
  );
}

/** Groupe de filtres libellé (régime, prix, allergènes). */
function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div role="group" aria-label={label}>
      <p className="label mb-3 text-muted" aria-hidden="true">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

/** Ligne de carte imprimée : plat …… prix, description, régime et allergènes. */
function DishRow({ dish, onHover }: { dish: DishData; onHover: (dish: DishData | null) => void }) {
  return (
    <li
      onPointerEnter={() => onHover(dish)}
      onPointerLeave={() => onHover(null)}
      className="border-b border-line py-6 last:border-b-0"
    >
      <div className="flex items-baseline">
        <h3 className="text-2xl leading-tight">{dish.name}</h3>
        <span className="dots" aria-hidden="true" />
        <p className="shrink-0 text-lg">{dish.price} €</p>
      </div>
      <p className="mt-2 max-w-[60ch] text-[0.9375rem] text-muted">{dish.description}</p>
      <DishFacts dish={dish} className="mt-2" />
    </li>
  );
}

/* -------------------------------------------------------------------------- */

export function MenuExplorer({ dishes }: { dishes: DishData[] }) {
  const [category, setCategory] = useState<string>("TOUT");
  const [diet, setDiet] = useState<string>("tout");
  const [maxPrice, setMaxPrice] = useState(0);
  const [excluded, setExcluded] = useState<string[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [preview, setPreview] = useState<{ dish: DishData; x: number; y: number } | null>(null);

  const desktop = useIsDesktop();
  const sheetId = useId();
  const sheetRef = useRef<HTMLDivElement>(null);
  const sheetToggleRef = useRef<HTMLButtonElement>(null);

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

  // Filtres secondaires actifs (régime, prix, allergènes) : le badge du bouton mobile
  const secondaryCount = (diet !== "tout" ? 1 : 0) + (maxPrice > 0 ? 1 : 0) + excluded.length;
  const anyFilter = category !== "TOUT" || secondaryCount > 0;

  const resetAll = () => {
    setCategory("TOUT");
    setDiet("tout");
    setMaxPrice(0);
    setExcluded([]);
  };

  // Panneau mobile : Échap ferme, focus déplacé dedans puis rendu au bouton
  useEffect(() => {
    if (!sheetOpen) return;
    document.body.style.overflow = "hidden";
    sheetRef.current?.querySelector<HTMLElement>("button")?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeSheet();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [sheetOpen]);

  function closeSheet() {
    setSheetOpen(false);
    sheetToggleRef.current?.focus();
  }

  const countLabel = `${filtered.length} ${filtered.length > 1 ? "plats" : "plat"}`;

  /** Régime, prix et allergènes : partagés entre la barre desktop et le panneau mobile. */
  const secondaryFilters = (
    <>
      <FilterGroup label="Régime">
        {DIETS.map((d) => (
          <Chip key={d.value} active={diet === d.value} onClick={() => setDiet(diet === d.value ? "tout" : d.value)}>
            {d.label}
          </Chip>
        ))}
      </FilterGroup>
      <FilterGroup label="Prix">
        {PRICES.map((p) => (
          <Chip
            key={p.value}
            active={maxPrice === p.value}
            onClick={() => setMaxPrice(maxPrice === p.value ? 0 : p.value)}
          >
            {p.label}
          </Chip>
        ))}
      </FilterGroup>
      <FilterGroup label="Exclure les allergènes">
        {ALLERGENS.map((a) => (
          <Chip key={a} active={excluded.includes(a)} onClick={() => toggleAllergen(a)}>
            Sans {a}
          </Chip>
        ))}
      </FilterGroup>
    </>
  );

  return (
    <div className="relative pb-16 md:pb-24">
      {/* --- Barre de filtres, collée sous l'en-tête ---------------------- */}
      <div className="sticky top-[72px] z-30 border-b border-line bg-night md:top-20">
        <div className="mx-auto flex max-w-[1200px] items-center gap-3 px-6 py-3 md:px-12">
          {/* Catégories : une seule rangée, défilable au pouce */}
          <div
            role="group"
            aria-label="Catégorie"
            className="-mx-6 flex flex-1 gap-2 overflow-x-auto px-6 [scrollbar-width:none] md:mx-0 md:px-0"
          >
            {CATEGORIES.map((c) => (
              <Chip key={c.value} active={category === c.value} onClick={() => setCategory(c.value)}>
                {c.label}
              </Chip>
            ))}
          </div>

          <button
            ref={sheetToggleRef}
            type="button"
            onClick={() => setSheetOpen(true)}
            aria-expanded={sheetOpen}
            aria-controls={sheetId}
            className="inline-flex h-11 shrink-0 items-center gap-2 rounded-[2px] border border-line px-4 text-[0.9375rem] hover:border-muted md:hidden"
          >
            <Faders size={18} aria-hidden="true" />
            Filtres{secondaryCount > 0 && ` (${secondaryCount})`}
          </button>

          <p className="hidden shrink-0 text-[0.9375rem] text-muted md:block" aria-live="polite">
            {countLabel}
          </p>
        </div>
      </div>

      {/* Desktop : filtres secondaires visibles sous la barre, en trois groupes libellés */}
      <div className="hidden border-b border-line md:block">
        <div className="mx-auto flex max-w-[1200px] flex-wrap gap-x-10 gap-y-6 px-12 py-5 lg:grid lg:grid-cols-[auto_auto_1fr]">
          {secondaryFilters}
        </div>
        {anyFilter && (
          <div className="mx-auto max-w-[1200px] px-12 pb-4">
            <Button variant="link" onClick={resetAll}>
              Réinitialiser les filtres
            </Button>
          </div>
        )}
      </div>

      {/* Mobile : compteur sous la barre, annoncé aux lecteurs d'écran */}
      <p className="mx-auto max-w-[1200px] px-6 pt-6 text-[0.9375rem] text-muted md:hidden" aria-live="polite">
        {countLabel}
        {anyFilter && (
          <>
            {" · "}
            <button type="button" onClick={resetAll} className="text-cream underline decoration-brass underline-offset-4">
              Réinitialiser
            </button>
          </>
        )}
      </p>

      <div className="mx-auto max-w-[1200px] px-6 md:px-12">
        {/* --- Les signatures -------------------------------------------- */}
        {signatures.length > 0 && (
          <section className="mt-10 md:mt-16" aria-labelledby="signatures">
            <h2 id="signatures" className="text-title">
              Les signatures
            </h2>
            <div className="mt-8 grid gap-12 md:grid-cols-2 md:gap-x-12 md:gap-y-16">
              {signatures.map((dish, i) => {
                // Un nombre impair : la dernière carte prend toute la ligne, pas d'orpheline
                const wide = signatures.length % 2 === 1 && i === signatures.length - 1;
                return (
                  <div key={dish.id} className={wide ? "md:col-span-2" : ""}>
                    <DishCard dish={dish} wide={wide} />
                  </div>
                );
              })}
            </div>

            {/* CTA après la section la plus visuelle (directive du brief) */}
            <div className="mt-12 flex flex-col items-start justify-between gap-6 border-y border-line py-8 md:mt-16 md:flex-row md:items-center">
              <p className="font-display text-[2rem] leading-tight">Une envie se précise ?</p>
              <Button href="/reservation">Réserver une table</Button>
            </div>
          </section>
        )}

        {/* --- Le reste de la carte, en liste typographique --------------- */}
        {sections.map((s) => (
          <section key={s.value} className="mt-12 md:mt-16" aria-labelledby={`section-${s.value}`}>
            <div className="flex items-baseline justify-between border-b border-line pb-4">
              <h2 id={`section-${s.value}`} className="text-title">
                {s.label}
              </h2>
              <span className="text-[0.9375rem] text-muted">
                {s.dishes.length} {s.dishes.length > 1 ? "plats" : "plat"}
              </span>
            </div>
            <ul
              onPointerMove={(e) => preview && setPreview({ ...preview, x: e.clientX, y: e.clientY })}
            >
              {s.dishes.map((dish) => (
                <DishRow
                  key={dish.id}
                  dish={dish}
                  onHover={(d) => setPreview(d ? { dish: d, x: 0, y: 0 } : null)}
                />
              ))}
            </ul>
          </section>
        ))}

        {/* --- Aucun résultat ---------------------------------------------- */}
        {filtered.length === 0 && (
          <div className="mt-12 border border-line p-8 md:mt-16 md:p-12">
            <p className="font-display text-2xl">Aucun plat ne correspond à ces filtres.</p>
            <p className="mt-3 max-w-[60ch] text-muted">
              Retirez un filtre, ou demandez-nous en salle : la cuisine adapte
              volontiers un plat.
            </p>
            <Button variant="secondary" onClick={resetAll} className="mt-6">
              Réinitialiser les filtres
            </Button>
          </div>
        )}

        <p className="mt-12 max-w-[60ch] text-sm text-muted md:mt-16">
          Les filtres couvrent les allergènes les plus fréquents. La liste des 14
          allergènes réglementaires de chaque plat est disponible en salle, sur
          simple demande.
        </p>
      </div>

      {/* --- Aperçu photo au survol d'une ligne (desktop, souris) ---------- */}
      {desktop && preview && preview.x > 0 && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed left-0 top-0 z-40 h-[180px] w-[240px] overflow-hidden rounded-[2px] border border-line"
          style={{ transform: `translate(${preview.x + 24}px, ${preview.y - 90}px)` }}
        >
          <Image src={preview.dish.imageUrl} alt="" fill sizes="240px" className="object-cover" />
        </div>
      )}

      {/* --- Panneau de filtres mobile ------------------------------------ */}
      {sheetOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <button
            type="button"
            aria-label="Fermer les filtres"
            tabIndex={-1}
            onClick={closeSheet}
            className="absolute inset-0 bg-night/70"
          />
          <div
            ref={sheetRef}
            id={sheetId}
            role="dialog"
            aria-modal="true"
            aria-label="Filtres de la carte"
            className="absolute inset-x-0 bottom-0 flex max-h-[85dvh] flex-col border-t border-line bg-coal"
          >
            <div className="flex items-center justify-between border-b border-line px-6 py-3">
              <p className="font-display text-2xl">Filtres</p>
              <button
                type="button"
                onClick={closeSheet}
                aria-label="Fermer les filtres"
                className="-mr-2 flex h-11 w-11 items-center justify-center"
              >
                <X size={24} aria-hidden="true" />
              </button>
            </div>
            <div className="space-y-8 overflow-y-auto px-6 py-6">{secondaryFilters}</div>
            <div className="flex items-center gap-4 border-t border-line px-6 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4">
              {secondaryCount > 0 && (
                <Button variant="link" onClick={() => { setDiet("tout"); setMaxPrice(0); setExcluded([]); }}>
                  Effacer
                </Button>
              )}
              <Button onClick={closeSheet} className="flex-1">
                Voir {countLabel}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
