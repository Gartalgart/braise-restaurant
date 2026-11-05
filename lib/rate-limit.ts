import type { NextRequest } from "next/server";

// Limiteur en mémoire, fenêtre glissante, par clé (IP).
// Best effort : sur Vercel chaque instance a sa propre mémoire, donc la limite réelle
// est « N requêtes par instance ». La vraie barrière en production est une règle de
// rate limiting Vercel WAF sur /api/reservations ; ceci couvre l'auto-hébergement
// (une seule instance) et freine les scripts naïfs partout.
const hits = new Map<string, number[]>();
const MAX_KEYS = 10_000;

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  // Évite une croissance illimitée de la Map sous attaque (IP usurpées)
  if (hits.size > MAX_KEYS) {
    const oldest = hits.keys().next().value;
    if (oldest !== undefined) hits.delete(oldest);
  }
  return true;
}

export function clientIp(req: NextRequest): string {
  return (
    req.headers.get("x-real-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}
