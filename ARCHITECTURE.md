# Architecture technique

Référence technique pour l'implémentation décrite dans [PRD.md](./PRD.md).

## Stack

| Domaine | Choix | Notes |
|---|---|---|
| Frontend | Next.js (App Router) | SSR/ISR pour le menu (change souvent), pages statiques pour Accueil/Galerie |
| Styling | Tailwind CSS | Thème centralisé (couleurs, typographie, espacements) partagé avec le rendu 3D |
| 3D | `@react-three/fiber` + `@react-three/drei` | `GLTFLoader`, modèle en `.glb`, compression Draco/Meshopt |
| Animations | Framer Motion | Transitions de scroll, hovers, transitions de page |
| Base de données | PostgreSQL | Menu, créneaux de réservation, réservations |
| Paiement | Stripe (optionnel) | Prépaiement groupes uniquement |
| Déploiement | Docker | Image app + service Postgres |

## Structure des dossiers (proposée)

```
/app
  /(site)
    /page.tsx                 # Accueil
    /menu/page.tsx
    /reservation/page.tsx
    /galerie/page.tsx
    /avis/page.tsx
    /contact/page.tsx
  /api
    /menu/route.ts
    /reservations/route.ts
    /creneaux/route.ts
    /stripe/webhook/route.ts
/components
  /layout/                     # Header sticky, CTA flottant, Footer
  /menu/                       # Cartes plats, filtres
  /reservation/                # Formulaire multi-étapes, sélecteur de créneaux
  /gallery/                    # Grille + lightbox
  /three/                      # Scène 3D, modèle glTF, fallback
  /ui/                         # Composants Tailwind réutilisables
/lib
  /db.ts                       # Client PostgreSQL
  /stripe.ts
  /motion.ts                   # Transitions/easing Framer Motion partagés
/public
  /models/                     # Fichiers .glb
  /images/
/prisma (ou /db/migrations)    # Schéma + migrations
```

## Schéma de données (esquisse)

```
Dish
  id, name, description, price, category, image_url,
  is_vegetarian, is_vegan, allergens[]

TimeSlot
  id, date, time, capacity, remaining_capacity

Reservation
  id, time_slot_id (FK), party_size, customer_name,
  customer_email, customer_phone, status,
  stripe_payment_intent_id (nullable), created_at
```

## Points d'attention techniques

- **Créneaux temps réel :** décrémenter `remaining_capacity` de façon atomique (transaction SQL) pour éviter le double-booking en cas de requêtes concurrentes.
- **Menu modifiable facilement :** soit une interface d'admin simple (page protégée), soit un accès direct à la DB documenté pour le restaurateur/l'agence qui maintient le site.
- **3D performant :** lazy-load du composant Three.js (`next/dynamic` avec `ssr: false`), modèle compressé Draco/Meshopt, fallback image pendant le chargement.
- **Cohérence 2D/3D :** un seul fichier de config (couleurs, easing, durées) importé à la fois par le thème Tailwind, les composants Framer Motion et l'éclairage de la scène Three.js.
- **Stripe :** flux de prépaiement uniquement pour les réservations de groupe (seuil à définir), webhook pour confirmer le paiement avant de valider la réservation.
- **Docker :** un `docker-compose.yml` avec service `app` (Next.js) et service `db` (Postgres), variables d'environnement pour les secrets (Stripe, Google Maps API key).
