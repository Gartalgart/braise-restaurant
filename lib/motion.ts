import type { Transition, Variants } from "motion/react";

/**
 * Rythme d'animation partagé — 2D (Motion) et 3D (R3F) puisent ici.
 * Le site fonctionne à la physique, pas à la durée : des ressorts, pas des
 * `duration`. Trois raideurs suffisent à couvrir tout le site.
 */

// Interface : réponse immédiate, aucun rebond (boutons, filtres, hover)
export const SPRING_SNAPPY: Transition = { type: "spring", stiffness: 420, damping: 34, mass: 0.7 };

// Entrées de contenu : ample et posé (sections, cartes, révélations)
export const SPRING_SOFT: Transition = { type: "spring", stiffness: 140, damping: 22, mass: 1 };

// Gestes marqués : léger dépassement (modales, badges, confirmation)
export const SPRING_BOUNCY: Transition = { type: "spring", stiffness: 260, damping: 18, mass: 0.9 };

// Courbe d'easing pour ce qui doit rester strictement chronométré (CSS, 3D)
export const EASE = [0.16, 1, 0.3, 1] as const;
export const DURATION = 0.55;
export const transition: Transition = { duration: DURATION, ease: EASE };

/** Marge de déclenchement au scroll — le contenu s'anime avant d'être plein cadre. */
export const VIEWPORT = { once: true, margin: "-12% 0px -12% 0px" } as const;

/* --- Variants réutilisables ---------------------------------------------- */

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28, filter: "blur(6px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: SPRING_SOFT },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.7, ease: EASE } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: { opacity: 1, scale: 1, transition: SPRING_SOFT },
};

/** Conteneur qui cascade ses enfants — à coupler avec `fadeUp`. */
export const staggerParent = (stagger = 0.07, delayChildren = 0): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: stagger, delayChildren } },
});

/** Mot ou ligne révélé depuis le bas, derrière un masque. */
export const maskUp: Variants = {
  hidden: { y: "115%" },
  visible: { y: "0%", transition: { duration: 0.9, ease: EASE } },
};
