# Phase 1 — État des lieux (16/10/2026)

Captures : `design-audit/avant/` (6 pages × desktop 1440 / tablette 768 / mobile 375, pleine page + premier écran).
Script : `design-audit/capture.cjs` (défilement progressif avant capture pour déclencher les révélations au scroll).
Méthode critique : double agent (A : revue design · B : détecteur + navigateur), synthèse ci-dessous.

## Audit technique — 10/20 (Acceptable)

| # | Dimension | Score | Constat clé |
|---|---|---|---|
| 1 | Accessibilité | 2 | Texte `ash/70`, `/60`, `/50` entre 2,1 et 3,1:1 ; `.meta` à 11,2 px en capitales mono partout ; erreur 409 jamais annoncée ; focus non déplacé entre les étapes |
| 2 | Performance | 2 | Hero épinglé 240svh + vidéo pilotée au scroll ; halos `blur(90px)` animés en boucle et `backdrop-filter` sur toutes les cartes ; Lenis + curseur custom ; image LCP de la galerie sans `priority` |
| 3 | Thème / tokens | 3 | Tokens `@theme` propres, mais collisions de cascade : `.text-ember` (classe maison) écrase l'utilitaire couleur Tailwind → 15+ textes deviennent du texte en dégradé ; `.meta` écrase les `text-[…]` ; rgba en dur dans Header, Cursor, HeroVideo |
| 4 | Responsive | 2 | Barre de filtres du menu collante = 411 px, 60 % de l'écran mobile ; 19/22 cibles < 44 px sur /menu (pastilles 38 px) ; pas de « Réserver » dans le header mobile au premier écran ; champs à 14 px → zoom iOS |
| 5 | Intégrité | 1 | Gabarit « dark premium IA » systémique (verre, halos, grille, Fig., (01), marquees, curseur, boutons magnétiques) ; le hero vend un burger absent de la carte |

## Critique UX — 22/40 (Acceptable)

| # | Heuristique | Score |
|---|---|---|
| 1 | Visibilité de l'état | 2 |
| 2 | Correspondance avec le monde réel | 2 |
| 3 | Contrôle utilisateur | 3 |
| 4 | Cohérence | 3 |
| 5 | Prévention des erreurs | 2 |
| 6 | Reconnaissance plutôt que rappel | 2 |
| 7 | Flexibilité | 2 |
| 8 | Esthétique minimaliste | 2 |
| 9 | Récupération d'erreur | 1 |
| 10 | Aide | 3 |

Charge cognitive : 4 échecs sur 8 (focus de l'accueil, groupement des filtres, ≤ 4 options, mémoire de travail).

## Problèmes par priorité

### P0 — bloquant
1. **Réservation : état vide mensonger.** « Fermé ce jour-là (le lundi…) » est écrit en dur (`ReservationFlow.tsx`) et s'affiche pour *tout* jour sans créneau — un vendredi ouvert, un soir complet. Les jours fermés ne sont pas marqués dans la bande, aucun « prochain créneau libre ». Aggravé aujourd'hui par les données : créneaux seedés pour juillet 2026 uniquement.

### P1 — majeur
2. **Erreur 409 avalée** : l'erreur est posée puis le formulaire qui l'affiche est démonté (retour étape 1) ; l'utilisateur perd son créneau sans explication.
3. **Hero hors sujet** : burger détouré + « Défilez pour ouvrir le burger », alors que la carte n'a aucun burger ; 240svh d'épinglage avant le moindre contenu ; photo de burgers/frites dans la galerie ; alt textes qui nomment des plats que les photos ne montrent pas.
4. **Filtres du menu sur mobile** : collants à toutes les tailles, 411 px, 13 pastilles de même poids ; trois « Tout » allumés en même temps.
5. **Contraste et taille du texte** : `.meta` 11,2 px capitales espacées pour la nav, les CTA, les allergènes (info de sécurité), les horaires ; variantes `ash/70…/35` sous 4,5:1.
6. **CTA réservation absent du premier écran mobile** sur /menu, /galerie, /avis, /contact (bouton flottant seulement après 420 px de scroll) — contraire au brief.

### P2 — mineur
7. Contenu caché tant que le JS/scroll ne l'a pas révélé (`Reveal` opacity 0 + flou) — captures pleine page noires, fragile si le JS échoue.
8. Le CTA du hero reste focusable et cliquable une fois devenu invisible.
9. `aria-live` sur toute la grille de créneaux → ré-annonce complète à chaque rechargement.
10. Curseur custom `cursor: none` : supprime l'affordance pointeur sans bénéfice.
11. `prefers-reduced-motion` : coupure globale `0.01ms` qui supprime aussi les retours d'état utiles.
12. Erreurs console intermittentes en dev (`SyntaxError`, 500 + `Unexpected end of JSON input` sur /menu) — à revérifier en build de prod.

### P3 — finition
13. 4 signatures sur /menu → la 4e est orpheline en tablette.
14. 7 allergènes sur les 14 réglementaires UE.
15. « pers. » au singulier comme au pluriel ; labels d'étapes masqués sur mobile.

## Ce qui marche (à garder)
- La **structure du parcours de réservation** : 3 décisions (bande de jours, +/−, créneaux réels), puis 3 champs, récap avec « Modifier », créneaux complets désactivés, avis prépaiement groupe.
- Le **ton éditorial** très spécifique (« la braise se repose », « trente couverts, pas un de plus ») et la **carte à points de conduite** (`.dots`), vraie signature de carte imprimée.
- Bases d'accessibilité sérieuses : lien d'évitement, focus visible, `aria-pressed`/`aria-current`, repli reduced-motion du hero sans casser l'hydratation.

## Détecteur Impeccable
CLI : 3 constats vérifiés (texte en dégradé ×2, grille décorative). Overlay navigateur : 18 (/), 11 (/menu), 12 (/reservation), 7 (/galerie) — halos/glow, texte en dégradé, eyebrow chips, marquee, texte < 11 px, abus de tirets cadratins, contrastes 3,1 et 3,5:1. Un faux positif (pastille de date sélectionnée, fond porté par un enfant absolu).
