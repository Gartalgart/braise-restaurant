import type { Metadata, Viewport } from "next";
import { Gilda_Display, Hanken_Grotesk } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FloatingCTA } from "@/components/layout/FloatingCTA";
import { RESTAURANT } from "@/lib/restaurant";

// Titres : un serif à un seul poids, la hiérarchie vient de la taille
const gilda = Gilda_Display({
  subsets: ["latin", "latin-ext"],
  weight: "400",
  variable: "--font-gilda",
});

// Texte, libellés et interface
const hanken = Hanken_Grotesk({
  subsets: ["latin", "latin-ext"],
  variable: "--font-hanken",
});

export const metadata: Metadata = {
  title: `${RESTAURANT.name} — ${RESTAURANT.tagline}`,
  description:
    "Braise, restaurant de cuisine de saison au feu de bois à Lille. Réservez votre table en ligne en 30 secondes.",
};

export const viewport: Viewport = {
  themeColor: "#14110f",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${gilda.variable} ${hanken.variable}`}>
      <body className="bg-night text-cream">
        <a
          href="#contenu"
          className="label sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:bg-brass focus:px-5 focus:py-3 focus:text-night"
        >
          Aller au contenu
        </a>

        <Header />
        <main id="contenu">{children}</main>
        <Footer />
        <FloatingCTA />
      </body>
    </html>
  );
}
