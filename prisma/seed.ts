import { PrismaClient, Category } from "@prisma/client";

const prisma = new PrismaClient();

const u = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=75`;

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
    imageUrl: u("photo-1467003909585-2f8a72700288"),
    allergens: ["poisson"],
  },
  {
    name: "Burrata crémeuse, tomates anciennes",
    description: "Burrata des Pouilles, tomates de plein champ, basilic, focaccia grillée au feu de bois.",
    price: 13,
    category: Category.ENTREE,
    imageUrl: u("photo-1546069901-ba9599a7e63c"),
    isVegetarian: true,
    allergens: ["lait", "gluten"],
  },
  {
    name: "Champignons braisés, jaune d'œuf confit",
    description: "Cèpes et shiitakés braisés, jaune confit à l'huile de foin, mouillettes de pain de campagne.",
    price: 12,
    category: Category.ENTREE,
    imageUrl: u("photo-1506084868230-bb9d95c24759"),
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
    imageUrl: u("photo-1519708227418-c8fd9a32b7a2"),
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
    imageUrl: u("photo-1544025162-d76694265947"),
    allergens: [],
  },
  {
    name: "Légumes de saison au feu, houmous de haricots blancs",
    description: "Légumes du maraîcher rôtis entiers à la braise, houmous fumé, dukkah de graines, pain plat.",
    price: 19,
    category: Category.PLAT,
    imageUrl: u("photo-1512621776951-a57141f2eefd"),
    isVegetarian: true,
    isVegan: true,
    allergens: ["sésame", "gluten"],
  },
  {
    name: "Gnocchis dorés au beurre de sauge",
    description: "Gnocchis maison poêlés, beurre noisette à la sauge, courge rôtie, pecorino.",
    price: 21,
    category: Category.PLAT,
    imageUrl: u("photo-1551183053-bf91a1d81141"),
    isVegetarian: true,
    allergens: ["gluten", "lait", "œufs"],
  },
  // Desserts
  {
    name: "Fondant au chocolat grand cru",
    description: "Chocolat 70% du Pérou, cœur coulant, glace crème crue, cacao brûlé.",
    price: 11,
    category: Category.DESSERT,
    imageUrl: u("photo-1551024506-0bccd828d307"),
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
    imageUrl: u("photo-1488477181946-6428a0291777"),
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
    imageUrl: u("photo-1544145945-f90425340c7e"),
    isVegetarian: true,
    allergens: ["lait"],
  },
];

const SERVICE_TIMES = ["12:00", "12:30", "13:00", "13:30", "19:00", "19:30", "20:00", "20:30", "21:00"];

async function main() {
  await prisma.reservation.deleteMany();
  await prisma.timeSlot.deleteMany();
  await prisma.dish.deleteMany();

  await prisma.dish.createMany({ data: dishes });

  // Créneaux sur 30 jours (fermé le lundi), capacité 20 couverts par créneau
  const slots: { date: Date; time: string; capacity: number; remainingCapacity: number }[] = [];
  const today = new Date();
  for (let d = 0; d < 30; d++) {
    const date = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate() + d));
    if (date.getUTCDay() === 1) continue; // fermé le lundi
    for (const time of SERVICE_TIMES) {
      // quelques créneaux déjà bien remplis pour le réalisme
      const taken = Math.floor(Math.random() * 8);
      slots.push({ date, time, capacity: 20, remainingCapacity: 20 - taken });
    }
  }
  await prisma.timeSlot.createMany({ data: slots });

  console.log(`Seed OK — ${dishes.length} plats, ${slots.length} créneaux`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
