import { Ticker } from "./Ticker";

/**
 * Bandeau de mots-clés entre les sections, défilant de droite à gauche.
 * La liste complète est lue une seule fois par les lecteurs d'écran.
 */
export function Marquee({
  items,
  speed = 80,
  className = "",
}: {
  items: string[];
  speed?: number;
  className?: string;
}) {
  const line = items.map((item) => item.toUpperCase());

  return (
    <Ticker
      speed={speed}
      label={line.join(" — ")}
      className={`border-y border-white/8 bg-coal/60 py-4 ${className}`}
    >
      {line.map((item, i) => (
        <span key={i} className="flex items-center">
          <span className="px-6 font-display text-2xl font-semibold uppercase tracking-wide text-cream/85 md:text-3xl">
            {item}
          </span>
          <span className="text-lg text-braise">✳</span>
        </span>
      ))}
    </Ticker>
  );
}
