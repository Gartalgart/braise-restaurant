/**
 * Photos du site — banques libres (Unsplash, Pexels), choisies pour montrer
 * les plats réellement à la carte, le feu et la salle. Restaurant de démo :
 * la provenance de chaque image est tracée dans `design-audit/photos.md`.
 */

export const unsplash = (id: string, w = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=75`;

export const pexels = (id: number, w = 1200) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;

/** Images d'ambiance utilisées hors de la carte. */
export const PHOTOS = {
  heroFire: {
    src: pexels(12261087, 2000),
    alt: "Côte de bœuf sur l'os saisie au-dessus des flammes du gril",
  },
  embers: {
    src: pexels(14887408, 2000),
    alt: "Lit de braises incandescentes dans l'obscurité",
  },
  grillCook: {
    src: pexels(36169156, 1600),
    alt: "Cuisinier au gril, viandes saisies au-dessus du feu de bois",
  },
  table: {
    src: unsplash("photo-1414235077428-338989a2e8c0", 1600),
    alt: "Table dressée à la lueur des bougies",
  },
} as const;
