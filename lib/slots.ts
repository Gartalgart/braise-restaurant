import { RESTAURANT } from "./restaurant";

/**
 * Créneaux de réservation, partagés par le seed et par `/api/creneaux`.
 *
 * Le site de démo ne doit pas « expirer » : au lieu de dépendre d'un seed
 * relancé à la main, les créneaux d'un jour sont créés à la première
 * consultation de ce jour (voir `ensureSlots`). L'heure de référence est
 * celle du restaurant, pas celle du serveur (Vercel tourne en UTC).
 */

export const TIMEZONE = "Europe/Paris";
export const BOOKING_DAYS = 30; // fenêtre réservable, aujourd'hui compris
export const CAPACITY = 20;

const LUNCH_TIMES = ["12:00", "12:30", "13:00", "13:30"];
const DINNER_TIMES = ["19:00", "19:30", "20:00", "20:30", "21:00"];

/** Date (AAAA-MM-JJ) et heure (HH:MM) actuelles à Lille. */
export function nowInRestaurant(d = new Date()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: TIMEZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(d)
      .map((p) => [p.type, p.value]),
  );
  return { date: `${parts.year}-${parts.month}-${parts.day}`, time: `${parts.hour}:${parts.minute}` };
}

/** Écart en jours entre deux dates AAAA-MM-JJ. */
export const daysBetween = (from: string, to: string) =>
  Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000);

/** Horaires de service d'un jour, d'après `RESTAURANT.hours` (lundi fermé, dimanche midi seulement). */
export function serviceTimes(isoDate: string) {
  const weekday = new Date(`${isoDate}T12:00:00Z`).getUTCDay(); // 0 = dimanche
  const hours = RESTAURANT.hours[(weekday + 6) % 7]; // hours[] commence lundi
  return [...(hours.lunch ? LUNCH_TIMES : []), ...(hours.dinner ? DINNER_TIMES : [])];
}

/**
 * Places déjà prises au départ, pour une démo qui a l'air vivante.
 * Déterministe (dérivé de la date et de l'heure) : même résultat à chaque génération.
 */
export function initialTaken(isoDate: string, time: string) {
  let h = 2166136261;
  for (const c of `${isoDate}${time}`) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return (h >>> 0) % 8;
}

/** Lignes `TimeSlot` à créer pour un jour donné. */
export function slotsFor(isoDate: string) {
  return serviceTimes(isoDate).map((time) => ({
    date: new Date(`${isoDate}T00:00:00Z`),
    time,
    capacity: CAPACITY,
    remainingCapacity: CAPACITY - initialTaken(isoDate, time),
  }));
}
