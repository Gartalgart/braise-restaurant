import { Glow } from "./Glow";
import { SplitText } from "./SplitText";
import { Reveal } from "./Reveal";

/**
 * En-tête de page unifié : halo de braise, kicker mono, titre affiche révélé
 * mot par mot. Même respiration sur les six pages.
 */
export function PageHeader({
  kicker,
  title,
  children,
}: {
  kicker: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="relative isolate overflow-hidden border-b border-white/8">
      <Glow className="-top-72 left-1/2 -translate-x-1/2" size={820} intensity={0.55} />
      <div className="gridlines absolute inset-0 -z-10" aria-hidden="true" />

      <div className="mx-auto max-w-6xl px-5 pb-12 pt-24 md:px-8 md:pb-16 md:pt-32">
        <Reveal>
          <p className="meta flex items-center gap-3 text-braise">
            <span className="inline-block h-px w-8 bg-braise" aria-hidden="true" />
            {kicker}
          </p>
        </Reveal>
        <h1 className="mt-5 font-display text-hero font-bold uppercase tracking-tight">
          <SplitText text={title} animateOnMount delay={0.1} />
        </h1>
        {children}
      </div>
    </header>
  );
}
