import type { Metadata } from "next";
import { GALLERY } from "@/lib/gallery";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Galerie — Braise",
  description: "Le feu, la salle, les assiettes : la galerie photo du restaurant Braise à Lille.",
};

export default function GaleriePage() {
  return (
    <div>
      <PageHeader title="Galerie">
        <p>
          Le feu, la salle et quelques assiettes de la carte. Touchez une photo
          pour l&apos;ouvrir en grand ; au clavier, les flèches passent d&apos;une
          photo à l&apos;autre.
        </p>
      </PageHeader>

      <div className="mx-auto max-w-[1200px] px-6 py-12 md:px-12 md:py-16">
        <GalleryGrid photos={[...GALLERY]} />

        <div className="mt-16 flex flex-col items-start justify-between gap-6 border-t border-line pt-10 md:mt-24 md:flex-row md:items-center">
          <p className="font-display text-[2rem] leading-tight">Envie de voir le feu de plus près ?</p>
          <Button href="/reservation">Réserver une table</Button>
        </div>
      </div>
    </div>
  );
}
