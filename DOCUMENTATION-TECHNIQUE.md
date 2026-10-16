# Documentation technique — Braise

Documentation de l'implémentation réelle du site (par opposition à [ARCHITECTURE.md](./ARCHITECTURE.md), qui décrit l'architecture *proposée* en amont du développement). À jour au 2026-07-25 (refonte « Nuit & Braise » : interface sombre, scène 3D pilotée au scroll).

## 1. Stack

| Domaine | Choix |
|---|---|
| Framework | Next.js 15 (App Router), React 19 |
| Langage | TypeScript |
| Styling | Tailwind CSS v4 (thème défini dans `app/globals.css` via `@theme`) |
| Animations | `motion` (successeur de Framer Motion, même API) + `lenis` pour le scroll inertiel |
| 3D | `@react-three/fiber` + `@react-three/drei` + `@react-three/postprocessing` (bloom) — scène procédurale, pas de modèle glTF chargé pour l'instant |
| Base de données | PostgreSQL via Prisma ORM |
| Déploiement | Docker (build multi-stage) + docker-compose (app + Postgres) |

## 2. Structure du projet

```
app/
  page.tsx                    Accueil
  menu/page.tsx                Carte (Server Component, lit Prisma)
  reservation/page.tsx         Réservation
  galerie/page.tsx             Galerie photo
  avis/page.tsx                Avis clients
  contact/page.tsx             Contact & horaires
  api/
    creneaux/route.ts          GET — disponibilité des créneaux
    reservations/route.ts      POST — création d'une réservation
  layout.tsx                   Layout racine (fonts, Header/Footer/CTA)
  globals.css                  Thème Tailwind (palette, typo, utilitaires)

components/
  layout/                      Header, Footer, FloatingCTA, PageTransition
  home/                        HeroExperience (section épinglée : 3D + calques)
  menu/                        MenuExplorer (filtres, client), DishCard
  reservation/                 ReservationFlow (client, tout le flux)
  gallery/                     GalleryGrid (mosaïque + lightbox `layoutId`)
  reviews/                     RatingBreakdown (note + répartition animée)
  contact/                     HoursTable (jour courant mis en avant)
  three/                       HeroScene (Canvas R3F, chargé en `next/dynamic`)
  ui/                          GlassCard, MagneticButton, SplitText, Reveal,
                               Marquee, PageHeader, SectionHeading, Stars,
                               Counter, Glow, Cursor, ScrollProgress, SmoothScroll

lib/
  db.ts                        Client Prisma (singleton, réutilisé en dev)
  restaurant.ts                Coordonnées, horaires, allergènes (source unique)
  motion.ts                    Ressorts, variants et easing partagés avec la 3D
  hooks.ts                     Hooks d'interaction (magnétisme, parallax, scroll)
  gallery.ts, reviews.ts       Données statiques (photos, avis)

prisma/
  schema.prisma                Modèles Dish, TimeSlot, Reservation
  seed.ts                      Jeu de données de démo (16 plats, 30 jours de créneaux)
```

Le menu (`app/menu/page.tsx`) et l'accueil (`app/page.tsx`) sont en `export const dynamic = "force-dynamic"` : ils sont rendus à la requête (pas en build statique), car ils lisent Prisma et la carte doit refléter la base de données immédiatement après modification.

## 3. Modèle de données (`prisma/schema.prisma`)

```
Dish
  id, name, description, price, category (ENTREE|PLAT|DESSERT|BOISSON),
  imageUrl, isVegetarian, isVegan, isSignature, allergens[], createdAt

TimeSlot
  id, date, time ("19:00"), capacity, remainingCapacity
  @@unique([date, time])

Reservation
  id, timeSlotId (FK → TimeSlot), partySize,
  customerName, customerEmail, customerPhone,
  status (PENDING|CONFIRMED|CANCELLED), stripePaymentIntentId?, createdAt
```

Points clés :
- **`TimeSlot` est la seule source de vérité sur la disponibilité.** Chaque créneau (date + heure) a une capacité totale et une capacité restante ; il n'y a pas de calcul de disponibilité "à la volée" à partir des réservations existantes.
- Le seed (`prisma/seed.ts`) génère un créneau par tranche horaire (`12:00` à `21:00`, service midi + soir) pour les 30 prochains jours, en sautant le lundi (jour de fermeture), avec une capacité de 20 couverts par créneau.
- Le champ `stripePaymentIntentId` existe dans le schéma mais n'est pas encore branché à un flux Stripe réel (voir §6).

## 4. Le système de réservation

C'est la fonctionnalité la plus sensible du site : elle doit éviter le double-booking même en cas de requêtes concurrentes (deux personnes qui réservent le même dernier créneau en même temps).

### 4.1 Vue d'ensemble du flux

```
┌─────────────┐   GET /api/creneaux?date=...&partySize=...   ┌──────────┐
│ ReservationFlow │ ──────────────────────────────────────▶ │ TimeSlot │
│ (client, React)  │ ◀────────────────────────────────────── │  (lecture) │
└─────────────┘        liste des créneaux + disponibilité     └──────────┘
       │
       │ utilisateur choisit un créneau → étape 2 (coordonnées)
       ▼
┌─────────────┐   POST /api/reservations                     ┌──────────────────┐
│ ReservationFlow │ ──────────────────────────────────────▶ │ transaction Prisma │
└─────────────┘                                               │ 1. décrément atomique
                                                                │ 2. création Reservation
                                                                └──────────────────┘
```

### 4.2 Étape 1 — Recherche de créneaux (`GET /api/creneaux`)

Fichier : `app/api/creneaux/route.ts`

- Paramètres : `date` (`YYYY-MM-DD`, validé par regex) et `partySize`.
- Lit tous les `TimeSlot` de la date demandée.
- Pour chaque créneau, calcule `available = remainingCapacity >= partySize` côté serveur — le client ne fait aucun calcul de disponibilité, il affiche seulement ce que l'API renvoie.
- Le composant `ReservationFlow` (`components/reservation/ReservationFlow.tsx`) relance cet appel à chaque changement de date ou de nombre de convives (`useEffect` sur `loadSlots`).
- Si la liste est vide (ex. lundi, jour de fermeture), le front affiche « Fermé ce jour-là ».

### 4.3 Étape 2 — Création de la réservation (`POST /api/reservations`)

Fichier : `app/api/reservations/route.ts`

C'est le cœur anti-double-booking. Séquence :

1. **Validation** des champs (`timeSlotId`, `partySize` 1–12, nom, email avec `@`, téléphone) — retourne `400` sinon.
2. **Transaction Prisma** (`prisma.$transaction`) contenant :
   - `updateMany` avec une clause `WHERE id = timeSlotId AND remainingCapacity >= partySize`, qui décrémente `remainingCapacity` de `partySize`.
   - C'est un **verrou optimiste au niveau SQL** : si deux requêtes concurrentes tentent de réserver la dernière place, la base de données ne laisse qu'une seule `UPDATE` réussir (`count = 1`) ; l'autre touche `0` ligne parce que la condition `remainingCapacity >= partySize` n'est déjà plus vraie au moment où elle s'exécute. Il n'y a **pas de lecture puis écriture séparées** côté application (ce qui serait vulnérable à une race condition) : la condition et la décrémentation sont dans la même requête SQL atomique.
   - Si `updated.count === 0`, la transaction lève une erreur `SLOT_FULL`, qui annule tout (aucune `Reservation` n'est créée).
   - Sinon, création de la `Reservation` liée au `TimeSlot`.
3. **Réponses** :
   - `201` avec `{ id, date, time, partySize }` en cas de succès.
   - `409 Conflict` si le créneau vient de se remplir (`SLOT_FULL`) — le front (`ReservationFlow`) revient alors automatiquement à l'étape 1 et recharge les créneaux à jour.
   - `400` si les champs sont invalides, `500` pour toute autre erreur serveur.

### 4.4 Côté client — `ReservationFlow.tsx`

Formulaire en 3 étapes gérées par un state local (`step: 1 | 2 | 3`), conformément à la directive du brief (« 3 champs max avant de demander les coordonnées ») :

1. **Étape 1** — jour (bande horizontale des 28 prochains jours), nombre de convives (pas à pas − / +), choix du créneau parmi les boutons générés depuis `/api/creneaux`. Un point orange signale les créneaux à moins de 4 places restantes. Sélectionner un créneau disponible passe automatiquement à l'étape 2.
2. **Étape 2** — nom, email, téléphone. À la soumission, appelle `POST /api/reservations`. Si la réponse est `409`, le formulaire revient à l'étape 1 avec les créneaux rafraîchis (message d'erreur affiché). Un groupe de 7 personnes ou plus voit un message annonçant un prépaiement (le calcul est purement informatif, voir §6).
3. **Étape 3** — écran de confirmation (design "ticket") affichant la date, l'heure et les coordonnées.

Aucun état serveur n'est conservé entre les étapes : tout repose sur le `timeSlotId` renvoyé par `/api/creneaux` puis réutilisé dans le `POST`.

## 5. Le menu (`MenuExplorer`)

- Rendu initial côté serveur : `app/menu/page.tsx` récupère **tous** les plats via `prisma.dish.findMany(...)` (tri catégorie → signature → nom), sans filtrage serveur.
- Le filtrage (catégorie, régime, prix max, allergènes exclus) est **entièrement côté client** dans `MenuExplorer` (`useMemo` sur le tableau `dishes` déjà chargé) — pas d'aller-retour réseau à chaque changement de filtre, adapté à une carte de quelques dizaines de plats.
- Les plats `isSignature: true` sont toujours affichés en tête dans une grille de cartes photo ; les autres sont regroupés par catégorie dans une liste typographique (points de conduite plat/prix).
- Modifier la carte = modifier les lignes dans la table `Dish` (via `db:seed`, Prisma Studio, ou une future interface d'admin) ; aucun redéploiement n'est nécessaire grâce au rendu dynamique (`force-dynamic`).

## 6. Fonctionnalités préparées mais non actives

- **Stripe (prépaiement groupes)** : le schéma (`stripePaymentIntentId`), le seuil (`GROUP_THRESHOLD = 7` dans `ReservationFlow.tsx`) et le message utilisateur existent, mais aucun appel à l'API Stripe n'est fait — c'est indiqué par les `TODO` dans `app/api/reservations/route.ts`. À implémenter : créer un `PaymentIntent` avant de confirmer la réservation, et ne la passer en `CONFIRMED` qu'au webhook `payment_intent.succeeded` (la réservation resterait en `PENDING` entre-temps).
- **Email/SMS de confirmation** : également en `TODO` — aucun envoi n'est fait aujourd'hui après une réservation réussie.
- **Modèle 3D réel** : `HeroScene.tsx` génère la cloche, l'assiette et le plat procéduralement (géométries Three.js pures), en attendant un export glTF/GLB réel (voir le brief, section "Modèle 3D"). Remplacer `Plate`/`Food` par un `useGLTF` suffit : le reste de la scène (lumières, braises, cadrage, pilotage au scroll) est indépendant de la géométrie. Le canvas est chargé en `next/dynamic` (`ssr: false`) et monté par `IntersectionObserver` à 200px du viewport, avec une photo en repli.

## 7. Déploiement (Docker)

- `Dockerfile` : build multi-stage — `builder` installe les dépendances, génère le client Prisma (`npx prisma generate`) et build Next.js en mode `standalone` ; `runner` ne copie que le résultat du build (`~image légère`).
- `docker-compose.yml` : service `app` (port 3000) + service `db` (Postgres 16, volume persistant `braise_pgdata`), avec un `healthcheck` sur Postgres pour que l'app ne démarre qu'une fois la base prête.
- Variables d'environnement (`.env.example`) : `DATABASE_URL` (obligatoire), `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` (optionnels, non utilisés pour l'instant), `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` (optionnel — l'embed Google Maps fonctionne sans clé par défaut, voir `RESTAURANT.mapsEmbedSrc` dans `lib/restaurant.ts`).
- Après un `docker compose up`, initialiser la base avec `npm run db:push` (applique le schéma) puis `npm run db:seed` (données de démo).

## 8. Système de design partagé

- `lib/motion.ts` centralise trois ressorts (`SPRING_SNAPPY` pour l'interface, `SPRING_SOFT` pour les entrées de contenu, `SPRING_BOUNCY` pour les gestes marqués), les variants réutilisables (`fadeUp`, `maskUp`, `staggerParent`) et la courbe `EASE` pour ce qui doit rester chronométré (CSS et 3D). Le même `EASE` sert à la levée de cloche dans `HeroScene.tsx`, pour que le rythme visuel soit identique en 2D et en 3D.
- **Animations liées au scroll** : ne pas utiliser `useScroll({ target })` pour une section épinglée. La mesure est faite une fois au montage et l'opacité peut être déléguée à une `ScrollTimeline` native dont la plage ne correspond plus — les calques ne s'effacent alors jamais. `lib/hooks.ts` fournit `useSectionProgress` (progression recalculée à chaque frame) et `useScrollMap` (interpolation en JavaScript, jamais accélérée), utilisés par `HeroExperience`.
- **Ne jamais poser d'`overflow` sur `body`** : cela fausse la détection du conteneur de défilement pour toutes ces animations. Le débordement horizontal est coupé section par section (`overflow-x-clip`).
- **Accessibilité du mouvement** : `prefers-reduced-motion` désactive le scroll inertiel, le curseur maison, le parallax, les bandeaux défilants et remplace le hero épinglé par un hero statique équivalent (`HeroExperience`, branche `reduced`).
- `lib/restaurant.ts` est la source unique des coordonnées, horaires et allergènes affichés — modifiée une fois, elle se répercute sur le Header (statut "ouvert"), le Footer, la page Contact et les métadonnées SEO.
- La palette et la typographie sont définies une seule fois dans `app/globals.css` (bloc `@theme`) et consommées par toutes les classes Tailwind (`bg-braise`, `font-display`, etc.) — aucune couleur ou font-family n'est codée en dur ailleurs dans les composants.
