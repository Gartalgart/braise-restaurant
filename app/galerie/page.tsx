import type { Metadata } from "next";
import { GALLERY } from "@/lib/gallery";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = {
  title: "Galerie — Braise",
  description: "Le lieu, les plats, la braise : la galerie photo du restaurant Braise à Lille.",
};

export default function GaleriePage() {
  return (
    <div>
      <PageHeader kicker="Le lieu, les assiettes" title="Galerie">
        <p className="mt-7 max-w-xl text-lead text-ash">
          Le lieu, les assiettes, la braise. Cliquez sur une photo pour
          l&apos;ouvrir en grand — flèches et échap fonctionnent au clavier.
        </p>
      </PageHeader>
      <GalleryGrid photos={[...GALLERY]} />
    </div>
  );
}
