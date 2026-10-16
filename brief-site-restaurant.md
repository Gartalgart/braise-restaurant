# Brief projet — Site vitrine restaurant / café indépendant

## Mise en situation

Un restaurant ou café indépendant veut se démarquer en ligne avec un menu vivant et une réservation simplifiée. C'est le profil de client idéal pour un premier vrai contrat payant : secteur local, besoin concret, budget accessible pour une PME/TPE.

**Histoire à raconter au client :** « Votre carte change souvent, vos clients doivent pouvoir réserver en 30 secondes depuis leur téléphone, sans passer par une appli tierce qui prend une commission. »

## Objectif produit

Le site doit être **pro, simple et ergonomique**. Chaque page doit :
- Pousser à réserver une table (CTA de réservation visible en permanence)
- Donner faim (photos, mise en page, typographie qui valorisent la nourriture)

## Pages du site

1. **Accueil** (hero + ambiance)
2. **Menu** (filtrable : végétarien, allergènes, prix)
3. **Réservation de table**
4. **Galerie photos**
5. **Avis clients**
6. **Contact & horaires**

## Fonctionnalités clés

- Menu dynamique filtrable par catégorie et allergène
- Système de réservation avec créneaux horaires en temps réel
- Intégration Google Maps + avis Google
- Prépaiement optionnel pour les groupes (Stripe)

## Stack technique

- **Frontend :** Next.js
- **Styling :** Tailwind CSS
- **3D :** Three.js (via `@react-three/fiber` + `@react-three/drei`)
- **Animations :** Framer Motion
- **Base de données :** PostgreSQL
- **Paiement :** Stripe (optionnel)
- **Déploiement :** Docker

## Directives UX / Design

### Pousser à la réservation
- CTA "Réserver une table" fixe (header sticky ou bouton flottant), visible sur toutes les pages, y compris mobile.
- Formulaire de réservation en 3 champs max à l'écran initial (date, heure, nombre de personnes) avant de demander les coordonnées.
- Afficher la disponibilité en temps réel (créneaux) plutôt qu'un simple formulaire de contact, pour réduire la friction.
- Sur la page Menu, insérer un CTA "Réserver" après les sections les plus visuelles (ex. plats signature).

### Donner faim
- Hero de la page d'accueil : photo plein écran d'un plat signature ou de l'ambiance du lieu, avec un léger overlay pour garder le texte lisible.
- Menu présenté avec photos de qualité (pas de longues listes de texte brut) ; typographie chaleureuse pour les titres de plats.
- Galerie photo en grille avec effet zoom/hover, format carré ou 4:3 pour l'uniformité.
- Couleurs et contrastes qui évoquent la gastronomie (tons chauds, noir/blanc élégant, ou palette propre à l'identité du restaurant) plutôt qu'une palette corporate froide.

### Simplicité et ergonomie
- Navigation à 6 entrées maximum (voir pages ci-dessus), toujours visible.
- Mobile-first : la majorité des réservations se feront depuis un téléphone.
- Temps de chargement rapide : images optimisées (Next.js Image), lazy loading sur la galerie.
- Accessibilité : contraste suffisant, alt text sur toutes les images de plats, formulaire de réservation utilisable au clavier.

### Modèle 3D (Sketchfab / Three.js)

- Exporter le modèle depuis Sketchfab au format **glTF/GLB** (ne pas utiliser l'embed iframe Sketchfab — trop lourd et non stylable). Vérifier la licence du modèle (privilégier un modèle libre de droits ou créé pour le client).
- Charger le modèle avec `GLTFLoader` via `@react-three/fiber` + `@react-three/drei` plutôt qu'en Three.js impératif pur, pour une meilleure intégration avec React et Framer Motion.
- Un seul élément 3D fort plutôt que plusieurs : par exemple un plat signature en 3D dans le hero, ou un élément déco (bouteille, assiette) qu'on peut faire pivoter à la souris. Éviter de multiplier les modèles 3D.
- **Performance :** lazy-loading du composant 3D (chargé après le reste de la page), compression Draco/Meshopt sur le modèle glTF, fallback image statique pendant le chargement pour ne pas ralentir le premier affichage.

### Animations (Framer Motion)

- Utiliser Framer Motion pour les transitions de scroll (fade-in, slide-up sur les sections), les hovers (cartes du menu, galerie) et les transitions de page.
- Centraliser les durées et courbes d'easing (ex. un seul `transition` réutilisé) pour que le rythme des animations 2D soit identique à celui du modèle 3D (rotation, apparition).

### Cohérence visuelle globale

- Même palette de lumière entre le rendu 3D (éclairage du modèle) et les photos/overlays du site (tons chauds si l'ambiance est chaleureuse).
- Un seul système d'espacement et de typographie (thème Tailwind centralisé) appliqué aux photos, aux animations et au canvas Three.js.
- Le 3D doit rester discret et servir l'ambiance générale, pas la dominer — éviter un contraste trop fort entre un rendu 3D "tech" et des photos de plats "artisanales/chaleureuses".

## Livrables attendus

- Site Next.js fonctionnel avec les 6 pages ci-dessus
- Menu filtrable connecté à PostgreSQL (facilement modifiable par le restaurateur)
- Formulaire de réservation avec gestion des créneaux
- Intégration Google Maps + emplacement pour avis Google
- Configuration Docker pour déploiement
- Modèle 3D intégré via Three.js (glTF, chargement optimisé, fallback image)
- Animations Framer Motion cohérentes sur l'ensemble du site
- (Optionnel) Intégration Stripe pour prépaiement groupes
