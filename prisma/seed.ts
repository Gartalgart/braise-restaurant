import { PrismaClient, Category } from "@prisma/client";
import { BOOKING_DAYS, nowInRestaurant, slotsFor } from "../lib/slots";

const prisma = new PrismaClient();

const u = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=75`;

// Pexels : photos libres, choisies pour montrer le plat réellement servi
const p = (id: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=900`;

const dishes = [
  // Entrées
  {
    name: "Velouté de butternut rôtie",
    description: "Courge rôtie au thym, crème crue de Normandie, noisettes torréfiées, huile de courge.",
    price: 11,
    category: Category.ENTREE,
    imageUrl: u("photo-1547592166-23ac45744acd"),
    isVegetarian: true,
    allergens: ["lait", "fruits à coque"],
  },
  {
    name: "Tartare de daurade aux agrumes",
    description: "Daurade royale de ligne, suprêmes de pamplemousse, huile d'olive citronnée, herbes fraîches.",
    price: 14,
    category: Category.ENTREE,
    imageUrl: p(8611130),
    allergens: ["poisson"],
  },
  {
    name: "Burrata crémeuse, tomates anciennes",
    description: "Burrata des Pouilles, tomates de plein champ, basilic, focaccia grillée au feu de bois.",
    price: 13,
    category: Category.ENTREE,
    imageUrl: p(26833230),
    isVegetarian: true,
    allergens: ["lait", "gluten"],
  },
  {
    name: "Champignons braisés, jaune d'œuf confit",
    description: "Cèpes et shiitakés braisés, jaune confit à l'huile de foin, mouillettes de pain de campagne.",
    price: 12,
    category: Category.ENTREE,
    imageUrl: p(4661880),
    isVegetarian: true,
    allergens: ["œufs", "gluten"],
  },
  // Plats
  {
    name: "Côte de bœuf maturée aux braises",
    description: "Race normande maturée 40 jours, cuite à la braise, jus corsé, pommes grenaille fumées. Pour deux.",
    price: 68,
    category: Category.PLAT,
    imageUrl: u("photo-1558030006-450675393462"),
    isSignature: true,
    allergens: [],
  },
  {
    name: "Lieu jaune, beurre blanc au sarrasin",
    description: "Lieu jaune de petit bateau, beurre blanc torréfié au sarrasin, poireaux grillés, kale croustillant.",
    price: 27,
    category: Category.PLAT,
    imageUrl: p(16064369),
    isSignature: true,
    allergens: ["poisson", "lait", "gluten"],
  },
  {
    name: "Risotto d'épeautre aux cèpes",
    description: "Petit épeautre de Provence crémeux, cèpes poêlés, vieux parmesan, huile de persil.",
    price: 22,
    category: Category.PLAT,
    imageUrl: u("photo-1476124369491-e7addf5db371"),
    isVegetarian: true,
    isSignature: true,
    allergens: ["gluten", "lait"],
  },
  {
    name: "Canard de Challans, cerises brûlées",
    description: "Filet rosé, cerises au feu, betteraves fumées, jus au poivre de Timut.",
    price: 29,
    category: Category.PLAT,
    imageUrl: p(29799014),
    allergens: [],
  },
  {
    name: "Légumes de saison au feu, houmous de haricots blancs",
    description: "Légumes du maraîcher rôtis entiers à la braise, houmous fumé, dukkah de graines, pain plat.",
    price: 19,
    category: Category.PLAT,
    imageUrl: p(30488354),
    isVegetarian: true,
    isVegan: true,
    allergens: ["sésame", "gluten"],
  },
  {
    name: "Gnocchis dorés au beurre de sauge",
    description: "Gnocchis maison poêlés, beurre noisette à la sauge, courge rôtie, pecorino.",
    price: 21,
    category: Category.PLAT,
    imageUrl: p(6659627),
    isVegetarian: true,
    allergens: ["gluten", "lait", "œufs"],
  },
  // Desserts
  {
    name: "Fondant au chocolat grand cru",
    description: "Chocolat 70% du Pérou, cœur coulant, glace crème crue, cacao brûlé.",
    price: 11,
    category: Category.DESSERT,
    imageUrl: p(24247232),
    isVegetarian: true,
    isSignature: true,
    allergens: ["lait", "œufs", "gluten"],
  },
  {
    name: "Tarte fine aux pommes flambées",
    description: "Pommes du verger caramélisées, feuilletage croustillant, calvados flambé en salle, crème d'Isigny.",
    price: 10,
    category: Category.DESSERT,
    imageUrl: u("photo-1621743478914-cc8a86d7e7b5"),
    isVegetarian: true,
    allergens: ["gluten", "lait", "œufs"],
  },
  {
    name: "Poire pochée au vin épicé",
    description: "Poire conférence pochée, vin rouge aux épices douces, crumble d'avoine, sorbet poire.",
    price: 9,
    category: Category.DESSERT,
    imageUrl: p(30648994),
    isVegetarian: true,
    isVegan: true,
    allergens: ["gluten"],
  },
  // Boissons
  {
    name: "Vin nature du moment (verre)",
    description: "Sélection de vignerons indépendants, rouge, blanc ou orange selon l'humeur de la cave.",
    price: 7,
    category: Category.BOISSON,
    imageUrl: u("photo-1510812431401-41d2bd2722f3"),
    isVegetarian: true,
    isVegan: true,
    allergens: ["sulfites"],
  },
  {
    name: "Cocktail Braise fumée",
    description: "Whisky tourbé, sirop d'érable fumé au bois de hêtre, bitter cacao, zeste d'orange brûlé.",
    price: 12,
    category: Category.BOISSON,
    imageUrl: u("photo-1470337458703-46ad1756a187"),
    isVegetarian: true,
    isVegan: true,
    allergens: [],
  },
  {
    name: "Café de spécialité, torréfaction locale",
    description: "Espresso ou filtre doux, torréfacteur du quartier, servi avec sa mignardise maison.",
    price: 4,
    category: Category.BOISSON,
    imageUrl: p(1233528),
    isVegetarian: true,
    allergens: ["lait"],
  },
];

async function main() {
  await prisma.reservation.deleteMany();
  await prisma.timeSlot.deleteMany();
  await prisma.dish.deleteMany();

  await prisma.dish.createMany({ data: dishes });

  // Créneaux des 30 prochains jours, calés sur les horaires (lib/slots.ts).
  // Au-delà, /api/creneaux crée les jours manquants à la première consultation.
  const { date: today } = nowInRestaurant();
  const slots = Array.from({ length: BOOKING_DAYS }, (_, i) => {
    const d = new Date(`${today}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + i);
    return slotsFor(d.toISOString().slice(0, 10));
  }).flat();
  await prisma.timeSlot.createMany({ data: slots });

  console.log(`Seed OK — ${dishes.length} plats, ${slots.length} créneaux`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
