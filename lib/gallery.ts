const u = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=75`;

// Galerie — photos plats, salle, équipe (format 4:3 uniforme)
export const GALLERY = [
  { src: u("photo-1558030006-450675393462"), alt: "Côte de bœuf saisie sur le gril, flammes vives" },
  { src: u("photo-1414235077428-338989a2e8c0"), alt: "Table dressée à la lueur des bougies dans la salle" },
  { src: u("photo-1517248135467-4c7edcad34c4"), alt: "Salle du restaurant, bois clair et banquettes" },
  { src: u("photo-1476124369491-e7addf5db371"), alt: "Risotto d'épeautre aux cèpes dressé en cuisine" },
  { src: u("photo-1551024506-0bccd828d307"), alt: "Fondant au chocolat, cœur coulant" },
  { src: u("photo-1552566626-52f8b828add9"), alt: "Comptoir et cuisine ouverte en plein service" },
  { src: u("photo-1467003909585-2f8a72700288"), alt: "Tartare de daurade aux agrumes, herbes fraîches" },
  { src: u("photo-1510812431401-41d2bd2722f3"), alt: "Verres de vin nature servis au comptoir" },
  { src: u("photo-1466978913421-dad2ebd01d17"), alt: "Tablée conviviale vue de haut, plats à partager" },
  { src: u("photo-1544025162-d76694265947"), alt: "Canard rôti tranché, cerises brûlées" },
  { src: u("photo-1470337458703-46ad1756a187"), alt: "Cocktail fumé au zeste d'orange brûlé" },
  { src: u("photo-1547592166-23ac45744acd"), alt: "Velouté de butternut, noisettes torréfiées" },
] as const;
