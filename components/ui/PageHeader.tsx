/**
 * En-tête des pages intérieures : titre serif, filet laiton, une ligne
 * d'introduction. Même respiration sur toutes les pages, sans surtitre.
 */
export function PageHeader({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <header className="border-b border-line">
      <div className="mx-auto max-w-[1200px] px-6 pb-12 pt-32 md:px-12 md:pb-16 md:pt-40">
        <h1 className="text-display">{title}</h1>
        <span className="rule mt-8" aria-hidden="true" />
        {children && <div className="mt-8 max-w-[60ch] text-lead text-muted">{children}</div>}
      </div>
    </header>
  );
}
