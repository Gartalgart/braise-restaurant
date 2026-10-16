"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useNearViewport, useScrollMap, useSectionProgress } from "@/lib/hooks";
import { EASE, fadeUp, staggerParent } from "@/lib/motion";
import { RESTAURANT } from "@/lib/restaurant";
import { SplitText } from "@/components/ui/SplitText";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { Glow } from "@/components/ui/Glow";
import { HeroVideo } from "@/components/home/HeroVideo";

const POSTER =
  "https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=1920&q=80";

/** Fond photo : sert d'affiche pendant le chargement du canvas et de repli. */
function Poster({ dim = 0.5 }: { dim?: number }) {
  return (
    <div className="absolute inset-0 -z-10" aria-hidden="true">
      <Image
        src={POSTER}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
        style={{ opacity: dim }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-night/70 via-night/40 to-night" />
    </div>
  );
}

/* -------------------------------------------------------------------------- */

export function HeroExperience() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { ref: nearRef, near } = useNearViewport<HTMLDivElement>("200px");

  // Progression de 0 (haut de section) à 1 (bas) : pilote la 3D et les calques
  const scrollYProgress = useSectionProgress(ref);

  const heroOpacity = useScrollMap(scrollYProgress, [0, 0.14, 0.3], [1, 1, 0]);
  const heroOpacityBottom = useScrollMap(scrollYProgress, [0, 0.14, 0.3], [1, 1, 0]);
  const heroY = useScrollMap(scrollYProgress, [0, 0.3], [0, -70]);
  const ritualOpacity = useScrollMap(scrollYProgress, [0.45, 0.62, 0.9, 1], [0, 1, 1, 0.35]);
  const ritualY = useScrollMap(scrollYProgress, [0.45, 0.62], [50, 0]);
  const hintOpacity = useScrollMap(scrollYProgress, [0, 0.08], [1, 0]);

  /*
   * Le repli « sans mouvement » est fait en CSS (`motion-reduce:`), pas par un
   * `if (reduced) return ...` : `useReducedMotion` vaut toujours `false` au
   * rendu serveur, donc un branchement JS produirait un arbre différent côté
   * client et casserait l'hydratation. Ici, serveur et client rendent
   * exactement le même HTML — c'est la feuille de style qui décide.
   *
   * En `prefers-reduced-motion` : la section perd sa hauteur d'épinglage et
   * redevient un hero d'un écran, le calque « rituel » et l'invite à défiler
   * disparaissent, et la vidéo n'est jamais montée (décision prise après
   * l'hydratation, `near` étant faux au premier rendu des deux côtés).
   */
  return (
    <section ref={ref} className="relative h-[240svh] motion-reduce:h-auto">
      <div
        ref={nearRef}
        // `isolate` : le poster est en `-z-10` et doit rester au-dessus du fond
        // de ce bloc. `sticky` créait le contexte d'empilement ; en
        // `motion-reduce` le bloc redevient statique, il faut donc le déclarer.
        className="grain sticky top-0 isolate flex h-svh flex-col justify-between overflow-hidden motion-reduce:static motion-reduce:h-auto motion-reduce:min-h-svh"
      >
        <Poster dim={near && !reduced ? 0.16 : 0.5} />
        <Glow className="left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" size={780} intensity={0.85} />

        {/* Le plan signature : sa tête de lecture suit la progression */}
        {near && !reduced && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, ease: EASE }}
            className="absolute inset-0 z-0"
          >
            <HeroVideo progress={scrollYProgress} />
          </motion.div>
        )}

        {/* Voile bas : garantit la lisibilité du texte par-dessus la 3D */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-72 bg-gradient-to-t from-night via-night/85 to-transparent"
        />

        {/* --- Calque 1 : l'accroche ------------------------------------- */}
        <motion.div
          style={{ opacity: heroOpacity, y: heroY }}
          className="pointer-events-none relative z-10 px-5 pt-28 md:px-8 md:pt-32"
        >
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6, ease: EASE }}
            className="meta flex items-center gap-3 text-braise"
          >
            <span className="inline-block h-px w-8 bg-braise" aria-hidden="true" />
            {RESTAURANT.tagline} — Lille
          </motion.p>

          <h1 className="mt-5 font-display text-hero font-bold uppercase tracking-tight">
            <SplitText text="Le feu fait" animateOnMount delay={0.15} />
            <br />
            <SplitText text="la" animateOnMount delay={0.3} />{" "}
            <span className="inline-block overflow-hidden align-bottom">
              <motion.em
                initial={{ y: "115%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 0.9, delay: 0.42, ease: EASE }}
                className="inline-block font-serif normal-case tracking-normal text-ember"
              >
                cuisine.
              </motion.em>
            </span>
          </h1>
        </motion.div>

        {/* --- Calque 2 : le rituel, découvert au fil du plan -------------- */}
        <motion.div
          style={{ opacity: ritualOpacity, y: ritualY }}
          className="pointer-events-none absolute inset-x-0 top-1/2 z-10 -translate-y-1/2 px-5 motion-reduce:hidden md:px-8"
        >
          <div className="mx-auto max-w-6xl">
            {/* Colonne de gauche : la vidéo occupe la droite du cadre */}
            <div className="max-w-md">
              <p className="meta text-braise">(00) Le rituel</p>
              <h2 className="mt-4 font-display text-title font-bold uppercase leading-none">
                Monté à la main,
                <br />
                étage par étage
              </h2>
              <p className="mt-5 text-lead text-ash">
                Pain brioché toasté sur la braise, viande saisie à la minute,
                affinage de trois semaines. Rien n&apos;est dressé à l&apos;avance :
                tout se monte au moment du service.
              </p>
              <p className="meta mt-5 text-ash/70">Fig. 00 — les étages se séparent au défilement</p>
            </div>
          </div>
        </motion.div>

        {/* --- Bas d'écran : promesse, CTA, fiche technique ----------------- */}
        <motion.div
          style={{ opacity: heroOpacityBottom }}
          variants={staggerParent(0.09, 0.5)}
          initial="hidden"
          animate="visible"
          className="relative z-10 px-5 pb-8 md:px-8 md:pb-10"
        >
          <div className="mx-auto grid max-w-6xl items-end gap-6 md:grid-cols-12">
            <motion.div variants={fadeUp} className="md:col-span-4">
              <p className="max-w-md text-lead text-cream/80">
                Une carte courte qui change avec le marché, des produits de la
                région et une braise qui ne s&apos;éteint jamais.
              </p>
            </motion.div>

            <motion.div variants={fadeUp} className="flex flex-wrap gap-3 md:col-span-5">
              <MagneticButton href="/reservation">Réserver une table</MagneticButton>
              <MagneticButton href="/menu" variant="outline">
                Voir la carte
              </MagneticButton>
            </motion.div>

            <motion.div
              variants={fadeUp}
              // Sur mobile, l'adresse encombre le premier écran : elle reste
              // accessible dans le pied de page et sur la page Contact.
              className="meta hidden space-y-1.5 text-ash md:col-span-3 md:block md:text-right"
            >
              <p>N° 14 — Rue des Tanneurs</p>
              <p>59000 Lille — Wazemmes</p>
              <p>Mar. – Dim. · {RESTAURANT.phone}</p>
            </motion.div>
          </div>

          {/* Invitation à défiler — disparaît au premier geste */}
          <motion.div
            style={{ opacity: hintOpacity }}
            className="mt-8 flex items-center justify-center gap-3 motion-reduce:hidden"
            aria-hidden="true"
          >
            <span className="meta text-ash/60">Défilez pour ouvrir le burger</span>
            <motion.span
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              className="text-braise"
            >
              ↓
            </motion.span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
