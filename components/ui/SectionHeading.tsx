import { Reveal } from "./Reveal";
import { SplitText } from "./SplitText";

/**
 * Titre de section : numéro mono, kicker, titre affiche révélé au scroll.
 * Un seul composant pour que le rythme éditorial reste identique partout.
 */
export function SectionHeading({
  num,
  kicker,
  title,
  align = "left",
  children,
}: {
  num: string;
  kicker: string;
  title: string;
  align?: "left" | "center";
  children?: React.ReactNode;
}) {
  const centered = align === "center";

  return (
    <Reveal className={centered ? "flex flex-col items-center text-center" : ""}>
      <p className={`meta flex items-center gap-3 text-braise ${centered ? "justify-center" : ""}`}>
        <span className="inline-block h-px w-8 bg-braise/60" aria-hidden="true" />
        <span className="text-ash">({num})</span>
        {kicker}
      </p>
      <h2 className="mt-4 max-w-4xl font-display text-display font-bold uppercase tracking-tight">
        <SplitText text={title} />
      </h2>
      {children}
    </Reveal>
  );
}
