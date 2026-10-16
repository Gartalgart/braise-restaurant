import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { MenuExplorer } from "@/components/menu/MenuExplorer";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = {
  title: "Menu — Braise",
  description:
    "La carte de saison de Braise : entrées, plats au feu de bois, desserts et boissons. Filtrable par régime et allergènes.",
};

// Rendu à la requête : évite d'exiger la base de données pendant `next build`
export const dynamic = "force-dynamic";

export default async function MenuPage() {
  const dishes = await prisma.dish.findMany({
    orderBy: [{ category: "asc" }, { isSignature: "desc" }, { name: "asc" }],
  });

  return (
    <div>
      <PageHeader kicker="La carte du moment" title="La carte">
        <p className="mt-7 max-w-xl text-lead text-ash">
          Une carte courte qui change avec le marché. Filtrez par catégorie,
          régime ou allergène — tout est indiqué, il suffit de demander pour le
          reste.
        </p>
      </PageHeader>
      <MenuExplorer dishes={dishes} />
    </div>
  );
}
