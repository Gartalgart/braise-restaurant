/** Étoiles de notation, demi-étoiles comprises. Le texte accessible porte la note. */
export function Stars({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-1" role="img" aria-label={`Note : ${String(rating).replace(".", ",")} sur 5`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = Math.max(0, Math.min(1, rating - (i - 1)));
        const id = `star-${i}-${String(rating).replace(".", "")}`;
        return (
          <svg key={i} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
            <defs>
              <linearGradient id={id}>
                <stop offset={`${fill * 100}%`} stopColor="var(--color-brass)" />
                <stop offset={`${fill * 100}%`} stopColor="var(--color-line)" />
              </linearGradient>
            </defs>
            <path
              d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.2l-6.1 3.4 1.4-6.8L2.2 9.1l6.9-.8L12 2z"
              fill={`url(#${id})`}
            />
          </svg>
        );
      })}
    </div>
  );
}
