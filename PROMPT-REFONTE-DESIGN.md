# Prompt de refonte design (Impeccable + Taste + Awesome Design + Playwright CLI + img2threejs + Blender MCP)

> Utilisation : copie ce fichier à la racine du projet, lance `claude` depuis cette racine, puis écris :
> « Lis PROMPT-REFONTE-DESIGN.md et exécute-le phase par phase. »
> Remplis d'abord les champs entre [crochets] dans la section Contexte.

---

## Contexte

- Projet : [NOM DU PROJET, ex. site portfolio freelance]
- Type : [portfolio / e-commerce / site vitrine / dashboard / application]
- Public cible : [ex. PME qui cherchent un développeur web]
- Ambiance souhaitée : [ex. sobre, moderne, tech, chaleureux]
- Références visuelles : [ex. Linear, Stripe, ou « voir DESIGN.md »]
- Contraintes : ne casser aucune fonctionnalité, garder la stack actuelle, rester accessible (contraste, navigation clavier) et responsive.

## Règles de travail

1. Travaille sur une branche Git dédiée : `git checkout -b refonte-design`.
2. Avance **phase par phase**. À la fin de chaque phase, fais un court résumé et **attends ma validation** avant de passer à la suivante.
3. Avant de modifier du code, lis la structure du projet (stack, composants, styles, pages).
4. Priorité des skills en cas de conflit : Impeccable (règles anti-patterns) > Taste (style) > DESIGN.md (références de marque). Ne mélange pas des directions contradictoires.
5. Si une information manque (palette, ton, image de référence), pose-moi la question au lieu d'inventer.

## Phase 1 : État des lieux (Playwright CLI + Impeccable)

1. Lance le projet en local.
2. Avec **Playwright CLI**, prends des captures de chaque page principale en desktop (1440 px), tablette (768 px) et mobile (375 px). Range-les dans `design-audit/avant/`.
3. Lance `/impeccable audit` puis `/impeccable critique` sur les pages principales.
4. Produis un résumé : problèmes de hiérarchie, typographie, espacements, contrastes, accessibilité, incohérences. Classe-les par priorité.

**Stop : attends ma validation.**

## Phase 2 : Direction artistique (DESIGN.md + Impeccable shape)

1. Si un `DESIGN.md` existe à la racine (issu d'Awesome Design), lis-le et respecte ses tokens (couleurs, typographie, espacements, composants). Sinon, propose-moi 2 ou 3 directions possibles et laisse-moi choisir.
2. Lance `/impeccable shape` : propose la structure de chaque page en texte (hiérarchie, sections, points d'attention) **avant d'écrire du code**.
3. Crée ou mets à jour `PRODUCT.md` et `DESIGN.md` pour fixer les décisions : palette, typographie, échelle d'espacement, composants, ton.

**Stop : attends ma validation.**

## Phase 3 : Réglages du style (Taste)

1. Utilise le skill **taste-skill** (ou `redesign-skill` puisque le projet existe déjà).
2. Propose les trois réglages (variance du design, intensité des animations, densité visuelle) adaptés à mon projet, avec une phrase d'explication chacun.
3. Applique-les après ma validation, sans les modifier ensuite sans me prévenir.

**Stop : attends ma validation.**

## Phase 4 : Reconstruction (Impeccable craft)

1. Lance `/impeccable craft` **page par page**, en commençant par la page d'accueil, puis les composants partagés (en-tête, pied de page, boutons, cartes, formulaires).
2. Garde la logique métier intacte : ne modifie que la présentation (styles, structure HTML/JSX, animations).
3. Après chaque page, montre ce qui a changé et attends ma validation avant la suivante.

## Phase 5 : Élément 3D (img2threejs), uniquement si pertinent

1. Ne l'utilise **que** si j'ai fourni une image de référence d'un objet simple (ou si je te le demande).
2. Lance `/img2threejs` avec cette image pour générer un modèle Three.js procédural, puis intègre-le (section hero, par exemple) avec un chargement différé pour ne pas ralentir le site.
3. Prévois une solution de repli (image fixe) pour les appareils peu puissants et pour `prefers-reduced-motion`.

## Phase 6 : Assets 3D détaillés (Blender via MCP), uniquement si pertinent

Blender est connecté en MCP. Utilise-le quand le projet a besoin d'un modèle plus riche que ce que img2threejs peut produire en code (matériaux réalistes, formes organiques, rendu précis), ou pour des visuels statiques (images de produit, illustrations 3D).

1. Commence par inspecter la scène Blender avec les outils du serveur MCP (informations sur la scène, capture du viewport) pour savoir ce qui existe déjà. Ne supprime ni ne modifie rien sans me le dire.
2. Demande-moi le sujet à modéliser, le style (low-poly, réaliste, minimal) et la palette, en cohérence avec `DESIGN.md`.
3. Construis le modèle via le MCP (création d'objets, matériaux, éclairage, caméra). Après chaque étape importante, prends une capture du viewport et montre-la-moi pour validation.
4. Choisis le bon format de sortie :
   - **Modèle interactif sur le site** : export glTF/GLB, optimisé (peu de polygones, textures compressées, poids cible sous 2 Mo si possible), à intégrer avec Three.js et un chargement différé.
   - **Visuel statique** : rendu en image (WebP ou AVIF) avec plusieurs tailles pour le responsive.
5. Range les sources et exports dans un dossier dédié (par exemple `assets/3d/`) et garde le fichier `.blend` hors du bundle du site.
6. Prévois le même repli que pour img2threejs : image fixe si l'appareil est peu puissant ou si `prefers-reduced-motion` est activé.

Règle de choix entre les deux outils : img2threejs pour un objet simple à partir d'une image (code léger, versionnable), Blender pour tout le reste. N'utilise pas les deux pour le même objet.

**Stop : attends ma validation.**

## Phase 7 : Vérification et finition (Playwright CLI + Impeccable)

1. Avec **Playwright CLI**, reprends les mêmes captures que la phase 1 dans `design-audit/apres/` (desktop, tablette, mobile).
2. Vérifie : aucune erreur dans la console, aucune barre de défilement horizontale, liens et boutons fonctionnels, navigation au clavier, contrastes lisibles, et, si des assets 3D sont présents, leur poids, leur temps de chargement et leur repli sur mobile.
3. Lance `/impeccable audit` puis `/impeccable polish` et corrige ce qui reste.
4. Compare avant/après et résume les améliorations en quelques lignes.

## Livraison

- Liste des fichiers modifiés.
- Commit propre sur la branche `refonte-design` avec un message clair.
- Points restants ou décisions à prendre de mon côté.
