import { RESTAURANT } from "./restaurant";

/** Index du jour dans `RESTAURANT.hours` (la semaine y commence le lundi). */
export const dayIndex = (d = new Date()) => (d.getDay() + 6) % 7;

/** Phrase courte sur l'ouverture du jour, à calculer côté client (fuseau du visiteur). */
export function todayLine(d = new Date()) {
  const h = RESTAURANT.hours[dayIndex(d)];
  const services = [h.lunch, h.dinner].filter(Boolean) as string[];
  if (services.length === 0) return { open: false, text: "Fermé aujourd'hui" };
  return { open: true, text: `Ouvert aujourd'hui · ${services.join(" et ")}` };
}
