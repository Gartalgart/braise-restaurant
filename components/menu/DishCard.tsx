import Image from "next/image";

export type DishData = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  isVegetarian: boolean;
  isVegan: boolean;
  isSignature: boolean;
  allergens: string[];
};

/** Régime et allergènes en toutes lettres : une information de sécurité, lisible. */
export function DishFacts({ dish, className = "" }: { dish: DishData; className?: string }) {
  const diet = dish.isVegan ? "Vegan" : dish.isVegetarian ? "Végétarien" : null;
  const allergens = dish.allergens.length > 0 ? `Contient : ${dish.allergens.join(", ")}` : "Sans allergène majeur";

  return (
    <p className={`text-sm text-muted ${className}`}>
      {diet && <span className="text-cream">{diet} · </span>}
      {allergens}
    </p>
  );
}

/**
 * Plat signature : photo 4:3, nom en serif, prix à droite.
 * `wide` : la carte occupe toute la ligne, photo à gauche et texte à droite.
 */
export function DishCard({ dish, wide = false }: { dish: DishData; wide?: boolean }) {
  return (
    <article className={`group ${wide ? "md:grid md:grid-cols-2 md:items-center md:gap-12" : ""}`}>
      <div className="relative aspect-[4/3] overflow-hidden rounded-[2px] bg-surface">
        <Image
          src={dish.imageUrl}
          alt={dish.name}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.2,0,0,1)] group-hover:scale-[1.03]"
        />
      </div>
      <div className={wide ? "mt-5 md:mt-0" : "mt-5"}>
        <div className="flex items-baseline justify-between gap-6">
          <h3 className="text-2xl leading-tight">{dish.name}</h3>
          <p className="shrink-0 text-lg">{dish.price} €</p>
        </div>
        <p className="mt-2 max-w-[60ch] text-[0.9375rem] text-muted">{dish.description}</p>
        <DishFacts dish={dish} className="mt-3" />
      </div>
    </article>
  );
}
