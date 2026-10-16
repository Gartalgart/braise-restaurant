// Informations du restaurant — source unique, facilement modifiable
export const RESTAURANT = {
  name: "Braise",
  tagline: "Cuisine de saison, feu de bois",
  address: "14 rue des Tanneurs, 59000 Lille",
  phone: "03 20 00 00 00",
  email: "bonjour@braise-restaurant.fr",
  googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=14+rue+des+Tanneurs+59000+Lille",
  googleReviewUrl: "https://search.google.com/local/writereview?placeid=PLACE_ID",
  mapsEmbedSrc:
    "https://www.google.com/maps?q=14+rue+des+Tanneurs,+59000+Lille&output=embed",
  instagram: "https://instagram.com/braise.lille",
  hours: [
    { day: "Lundi", lunch: null, dinner: null },
    { day: "Mardi", lunch: "12h – 14h", dinner: "19h – 22h" },
    { day: "Mercredi", lunch: "12h – 14h", dinner: "19h – 22h" },
    { day: "Jeudi", lunch: "12h – 14h", dinner: "19h – 22h" },
    { day: "Vendredi", lunch: "12h – 14h", dinner: "19h – 23h" },
    { day: "Samedi", lunch: "12h – 14h30", dinner: "19h – 23h" },
    { day: "Dimanche", lunch: "12h – 15h", dinner: null },
  ],
  rating: { average: 4.8, count: 327 },
} as const;

export const ALLERGENS = [
  "gluten",
  "lait",
  "œufs",
  "poisson",
  "fruits à coque",
  "sésame",
  "sulfites",
] as const;
