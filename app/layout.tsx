import type { Metadata, Viewport } from "next";
import { Archivo, Big_Shoulders, EB_Garamond, Spline_Sans_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FloatingCTA } from "@/components/layout/FloatingCTA";
import { PageTransition } from "@/components/layout/PageTransition";
import { SmoothScroll } from "@/components/ui/SmoothScroll";
import { ScrollProgress } from "@/components/ui/ScrollProgress";
import { Cursor } from "@/components/ui/Cursor";
import { RESTAURANT } from "@/lib/restaurant";

// Display condensée héritée des affiches industrielles — l'affiche de boucherie moderne
const bigShoulders = Big_Shoulders({
  subsets: ["latin"],
  variable: "--font-big-shoulders",
});

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
});

// Mono pour les prix, horaires et métadonnées — l'esthétique du ticket
const splineMono = Spline_Sans_Mono({
  subsets: ["latin"],
  variable: "--font-spline-mono",
});

// Serif italique, réservé aux rares mots accentués
const garamond = EB_Garamond({
  subsets: ["latin"],
  style: ["italic"],
  variable: "--font-garamond",
});

export const metadata: Metadata = {
  title: `${RESTAURANT.name} — ${RESTAURANT.tagline}`,
  description:
    "Braise, restaurant de cuisine de saison au feu de bois à Lille. Réservez votre table en ligne en 30 secondes.",
};

// La barre d'adresse mobile prend la couleur du fond : plus de liseré blanc
export const viewport: Viewport = {
  themeColor: "#0b0a09",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="fr"
      className={`${bigShoulders.variable} ${archivo.variable} ${splineMono.variable} ${garamond.variable}`}
    >
      <body className="bg-night text-cream">
        <a
          href="#contenu"
          className="meta sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[110] focus:rounded-pill focus:bg-braise focus:px-5 focus:py-3 focus:text-night"
        >
          Aller au contenu
        </a>

        <SmoothScroll />
        <ScrollProgress />
        <Cursor />

        <Header />
        <main id="contenu">
          <PageTransition>{children}</PageTransition>
        </main>
        <Footer />
        <FloatingCTA />
      </body>
    </html>
  );
}
