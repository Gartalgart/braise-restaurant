import { pexels, unsplash } from "./images";

// Galerie — le feu, la salle, les plats de la carte (format 4:3 uniforme).
// Chaque `alt` décrit ce que la photo montre réellement.
export const GALLERY = [
  { src: pexels(12261087), alt: "Côte de bœuf sur l'os saisie au-dessus des flammes du gril" },
  { src: unsplash("photo-1414235077428-338989a2e8c0"), alt: "Table dressée à la lueur des bougies" },
  { src: pexels(36169156), alt: "Cuisinier au gril, viandes saisies au-dessus du feu" },
  { src: pexels(16064369), alt: "Filet de poisson blanc saisi sur la peau, ciboulette" },
  { src: pexels(14887408), alt: "Braises incandescentes dans l'obscurité" },
  { src: unsplash("photo-1552566626-52f8b828add9"), alt: "Grande salle de restaurant, banquettes et suspensions" },
  { src: pexels(29799014), alt: "Magret de canard rosé tranché, dressé sur assiette blanche" },
  { src: unsplash("photo-1510812431401-41d2bd2722f3"), alt: "Verres de vin rouge levés pour trinquer" },
  { src: unsplash("photo-1476124369491-e7addf5db371"), alt: "Risotto crémeux aux herbes dans une assiette creuse" },
  { src: pexels(29279929), alt: "Flammes et fumée au-dessus du foyer" },
  { src: pexels(26833230), alt: "Burrata entière sur tomates cerises" },
  { src: unsplash("photo-1470337458703-46ad1756a187"), alt: "Cocktail ambré versé sur un gros glaçon, zeste d'orange" },
] as const;
