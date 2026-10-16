/**
 * Halo de braise posé derrière une section. Purement décoratif : il donne la
 * profondeur et la chaleur qui empêchent le fond sombre d'être plat.
 * Le parent doit être `relative` + `overflow-hidden`.
 */
export function Glow({
  className = "",
  size = 640,
  intensity = 1,
  breathe = true,
}: {
  className?: string;
  size?: number;
  /** 0 → invisible, 1 → nominal, >1 → foyer principal */
  intensity?: number;
  breathe?: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      className={`halo -z-10 ${breathe ? "breathe" : ""} ${className}`}
      style={{ width: size, height: size, opacity: intensity }}
    />
  );
}
