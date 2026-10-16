"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { fadeUp, VIEWPORT } from "@/lib/motion";
import { GlassCard } from "@/components/ui/GlassCard";

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

/** Pastille de régime / allergène. */
function Tag({ children, accent = false }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <li
      className={`meta rounded-pill border px-2.5 py-1 text-[0.6rem] ${
        accent ? "border-ember/40 bg-ember/10 text-ember" : "border-white/10 text-ash"
      }`}
    >
      {children}
    </li>
  );
}

export function DishCard({ dish, index = 0 }: { dish: DishData; index?: number }) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
      transition={{ delay: (index % 3) * 0.08 }}
      className="h-full"
    >
      <GlassCard as="article" className="flex h-full flex-col">
        <div className="relative aspect-[4/3] overflow-hidden">
          {/* L'image se dézoome au survol : l'assiette « s'approche » */}
          <Image
            src={dish.imageUrl}
            alt={`${dish.name} — plat servi chez Braise`}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="scale-105 object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-100"
          />
          {/* Fondu vers la carte : l'image ne se coupe jamais net */}
          <div className="absolute inset-0 bg-gradient-to-t from-coal via-coal/25 to-transparent" />

          {dish.isSignature && (
            <span className="meta absolute left-4 top-4 rounded-pill bg-braise px-3 py-1.5 text-[0.6rem] text-night shadow-ember">
              ✳ Signature
            </span>
          )}

          <p className="absolute bottom-4 right-4 rounded-pill border border-white/12 bg-night/70 px-3 py-1.5 font-mono text-sm backdrop-blur-md">
            {dish.price} €
          </p>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <h3 className="font-display text-2xl font-bold uppercase leading-none">{dish.name}</h3>
          <p className="mt-3 flex-1 text-sm leading-relaxed text-ash">{dish.description}</p>
          <ul className="mt-5 flex flex-wrap gap-1.5" aria-label="Régimes et allergènes">
            {dish.isVegan ? (
              <Tag accent>Vegan</Tag>
            ) : dish.isVegetarian ? (
              <Tag accent>Végétarien</Tag>
            ) : null}
            {dish.allergens.map((a) => (
              <Tag key={a}>{a}</Tag>
            ))}
          </ul>
        </div>
      </GlassCard>
    </motion.div>
  );
}
