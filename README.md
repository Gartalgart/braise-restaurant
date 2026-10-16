# Site vitrine — Restaurant / Café indépendant

Site vitrine avec menu dynamique, réservation en ligne temps réel, galerie photo, avis clients et un élément 3D d'ambiance. Voir [brief-site-restaurant.md](./brief-site-restaurant.md) pour le brief complet.

## Stack

- **Frontend :** Next.js (App Router)
- **Styling :** Tailwind CSS
- **3D :** Three.js via `@react-three/fiber` + `@react-three/drei`
- **Animations :** Framer Motion
- **Base de données :** PostgreSQL
- **Paiement :** Stripe (optionnel, prépaiement groupes)
- **Déploiement :** Docker

## Documentation du projet

- [brief-site-restaurant.md](./brief-site-restaurant.md) — brief client original
- [PRD.md](./PRD.md) — spécifications produit détaillées par page/fonctionnalité
- [ARCHITECTURE.md](./ARCHITECTURE.md) — architecture technique, structure des dossiers, schéma de données
- [TASKS.md](./TASKS.md) — découpage du travail en étapes

## Démarrage

```bash
npm install
# base PostgreSQL (Docker) puis schéma + données de démo
npx prisma db push
npm run db:seed
npm run dev
```

Le site attend un PostgreSQL accessible via `DATABASE_URL` (voir `.env.example`).
En production : `docker compose up --build` (app Next.js standalone + Postgres 16).

## Identité

Restaurant fictif **« Braise »** — cuisine de saison au feu de bois, Lille.
Thème : crème/espresso, accents terracotta et or ; typographies Fraunces (titres) + Karla (texte).
L'élément 3D (cloche de service, `components/three/SignatureScene.tsx`) est procédural ;
pour un client réel, le remplacer par un modèle glTF/GLB compressé Draco chargé via `useGLTF`.

## Scripts

| Commande | Effet |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` / `npm start` | Build et serveur de production |
| `npm run db:push` | Synchronise le schéma Prisma |
| `npm run db:seed` | Réinitialise plats + créneaux de démo |

## Variables d'environnement

Voir `.env.example` — `DATABASE_URL` (obligatoire), clés Stripe et Google Maps (optionnelles).
