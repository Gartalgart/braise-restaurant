import Link from "next/link";

type Variant = "primary" | "secondary" | "link";

const BASE =
  "inline-flex shrink-0 items-center justify-center gap-2.5 whitespace-nowrap rounded-[2px] font-sans text-sm font-semibold uppercase tracking-[0.14em] transition-colors duration-200 ease-[cubic-bezier(0.2,0,0,1)] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50";

const VARIANTS: Record<Variant, string> = {
  primary: `${BASE} h-[52px] px-7 bg-brass text-night hover:bg-brass-strong`,
  secondary: `${BASE} h-[52px] px-7 border border-cream text-cream hover:bg-surface`,
  link: "inline-flex items-center gap-2 text-cream underline decoration-brass decoration-1 underline-offset-[6px] transition-colors hover:text-brass-strong",
};

type Props = {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
} & (
  | { href: string; type?: never; onClick?: never; disabled?: never }
  | { href?: never; type?: "button" | "submit"; onClick?: () => void; disabled?: boolean }
);

/** Bouton du système : laiton plein (action), contour crème (secondaire), lien souligné. */
export function Button({ children, variant = "primary", className = "", ...rest }: Props) {
  const cls = `${VARIANTS[variant]} ${className}`;

  if (rest.href !== undefined) {
    return (
      <Link href={rest.href} className={cls}>
        {children}
      </Link>
    );
  }

  return (
    <button type={rest.type ?? "button"} onClick={rest.onClick} disabled={rest.disabled} className={cls}>
      {children}
    </button>
  );
}
