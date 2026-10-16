# Plan de développement

Découpage en étapes pour construire le site décrit dans [PRD.md](./PRD.md) et [ARCHITECTURE.md](./ARCHITECTURE.md).

## Étape 0 — Setup projet
- [ ] `create-next-app` (App Router, TypeScript, Tailwind)
- [ ] Config Tailwind : palette, typographie, espacements centralisés
- [ ] Docker : `Dockerfile` + `docker-compose.yml` (app + Postgres)
- [ ] Connexion PostgreSQL + choix ORM (Prisma recommandé) + migration initiale (schéma `Dish`, `TimeSlot`, `Reservation`)

## Étape 1 — Layout & navigation
- [ ] Header sticky avec navigation 6 entrées
- [ ] CTA "Réserver une table" fixe/flottant (desktop + mobile)
- [ ] Footer (horaires, contact, réseaux sociaux)

## Étape 2 — Page Accueil
- [ ] Hero plein écran (photo/vidéo + overlay)
- [ ] Intégration élément 3D (glTF via drei, lazy-load, fallback image)
- [ ] Sections secondaires (plats phares, aperçu avis, lien galerie)
- [ ] Animations Framer Motion (fade-in/slide-up au scroll)

## Étape 3 — Page Menu
- [ ] Modèle de données `Dish` + seed initial
- [ ] Affichage des plats (photo, prix, badges allergènes/régime)
- [ ] Filtres catégorie / régime / allergènes / prix (sans rechargement)
- [ ] CTA réservation après sections visuelles

## Étape 4 — Réservation
- [ ] Modèle `TimeSlot` + génération des créneaux
- [ ] Formulaire étape 1 (date, heure, personnes) avec dispo temps réel
- [ ] Formulaire étape 2 (coordonnées) + création `Reservation`
- [ ] Décrément atomique de la capacité (éviter double-booking)
- [ ] Email/SMS de confirmation
- [ ] (Optionnel) Prépaiement Stripe pour groupes + webhook

## Étape 5 — Galerie photos
- [ ] Grille responsive (format uniforme), lazy loading
- [ ] Lightbox avec navigation clavier

## Étape 6 — Avis clients
- [ ] Intégration avis Google (note + extraits)
- [ ] Lien vers la fiche Google pour laisser un avis

## Étape 7 — Contact & horaires
- [ ] Intégration Google Maps
- [ ] Horaires + coordonnées (source facilement modifiable)

## Étape 8 — Polish & performance
- [ ] Audit accessibilité (contrastes, alt text, navigation clavier)
- [ ] Optimisation images (`next/image`) sur tout le site
- [ ] Vérification cohérence visuelle 2D/3D (palette, easing partagé)
- [ ] Tests responsive mobile-first

## Étape 9 — Déploiement
- [ ] Build Docker de production
- [ ] Variables d'environnement (Stripe, Google Maps, DB) en prod
- [ ] Déploiement + vérification post-déploiement
