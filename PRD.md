# PRD — Site vitrine restaurant / café indépendant

Spécifications produit dérivées de [brief-site-restaurant.md](./brief-site-restaurant.md).

## 1. Accueil

**Objectif :** donner faim et pousser à réserver dès l'arrivée.

- Hero plein écran : photo (ou vidéo courte) d'un plat signature ou de l'ambiance, léger overlay pour la lisibilité du texte.
- CTA "Réserver une table" visible immédiatement (au-dessus de la ligne de flottaison).
- Élément 3D d'ambiance (plat signature ou objet déco, rotation à la souris), chargé en lazy avec fallback image statique.
- Sections secondaires : présentation courte du lieu, mise en avant de 2-3 plats phares, aperçu des avis clients, lien vers la galerie.
- Animations Framer Motion : fade-in / slide-up au scroll sur chaque section.

**Critères d'acceptation :**
- Le CTA réservation est cliquable sans scroll sur mobile et desktop.
- Le composant 3D ne bloque pas le First Contentful Paint (chargé après le reste).
- Toutes les images ont un `alt` descriptif.

## 2. Menu

**Objectif :** présenter la carte de façon appétissante et filtrable.

- Filtres : catégorie (entrée/plat/dessert/boisson…), régime (végétarien, vegan…), allergènes, prix.
- Chaque plat : photo, nom, description courte, prix, badges allergènes/régime.
- Données servies depuis PostgreSQL, modifiables facilement par le restaurateur (interface d'admin minimale ou accès direct DB documenté).
- CTA "Réserver" inséré après les sections les plus visuelles (ex. après les plats signature).

**Critères d'acceptation :**
- Les filtres se combinent (ex. végétarien + sans gluten).
- Le filtrage se fait sans rechargement de page.
- Un plat sans photo affiche un visuel de secours cohérent avec la charte.

## 3. Réservation de table

**Objectif :** réserver en moins de 30 secondes, sans friction.

- Étape 1 (3 champs max) : date, heure, nombre de personnes.
- Créneaux affichés en temps réel selon la disponibilité (pas un simple champ libre).
- Étape 2 : coordonnées (nom, téléphone, email) une fois le créneau choisi.
- Confirmation immédiate (email et/ou SMS) après réservation.
- Option prépaiement Stripe pour les groupes (seuil de nombre de personnes à définir avec le client).
- Formulaire utilisable entièrement au clavier.

**Critères d'acceptation :**
- Un créneau déjà complet n'est pas sélectionnable.
- La réservation est enregistrée en base et un créneau se décrémente en conséquence.
- Le formulaire fonctionne sur mobile en une seule main (boutons/dates assez grands).

## 4. Galerie photos

**Objectif :** renforcer l'envie visuellement.

- Grille de photos (plats, ambiance, équipe), format uniforme (carré ou 4:3).
- Effet zoom/hover au survol, ouverture en lightbox au clic.
- Lazy loading des images hors écran.

**Critères d'acceptation :**
- Aucune image ne charge avant d'être proche du viewport.
- Navigation clavier possible dans la lightbox (flèches, Échap).

## 5. Avis clients

**Objectif :** rassurer et donner confiance.

- Intégration des avis Google (note globale + extraits d'avis).
- Mise en page cohérente avec le reste du site (pas de widget Google brut non stylé si possible).

**Critères d'acceptation :**
- La note moyenne et le nombre d'avis sont visibles en un coup d'œil.
- Lien vers la fiche Google du restaurant pour laisser un avis.

## 6. Contact & horaires

**Objectif :** informations pratiques immédiates.

- Horaires d'ouverture clairs (jour par jour), adresse, téléphone, email.
- Intégration Google Maps (carte interactive, localisation du restaurant).
- CTA réservation également présent sur cette page.

**Critères d'acceptation :**
- La carte Google Maps est cliquable et pointe vers l'adresse exacte.
- Les horaires reflètent une donnée facilement modifiable (config ou DB).

## Exigences transverses

- **Navigation :** 6 entrées max, toujours visible (header sticky), CTA réservation fixe/flottant sur toutes les pages y compris mobile.
- **Mobile-first :** priorité à l'expérience mobile pour la réservation.
- **Performance :** images optimisées via `next/image`, lazy loading galerie et modèle 3D.
- **Accessibilité :** contrastes suffisants, alt text systématique, formulaires navigables au clavier.
- **Cohérence visuelle :** palette de lumière identique entre rendu 3D et photos, système d'espacement/typographie Tailwind centralisé, animations Framer Motion avec easing/durées partagés entre 2D et 3D.

## Hors périmètre (v1)

- Application mobile dédiée.
- Système de fidélité / comptes clients.
- Commande en ligne (livraison/à emporter) — non mentionné dans le brief.
