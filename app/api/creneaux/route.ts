import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { BOOKING_DAYS, daysBetween, nowInRestaurant, slotsFor } from "@/lib/slots";

// GET /api/creneaux?date=2026-07-04&partySize=2
// Renvoie les créneaux du jour avec leur disponibilité réelle.
export async function GET(req: NextRequest) {
  const dateParam = req.nextUrl.searchParams.get("date");
  const partySize = Number(req.nextUrl.searchParams.get("partySize") ?? 2);

  if (!dateParam || !/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
    return NextResponse.json({ error: "Paramètre date invalide (YYYY-MM-DD)" }, { status: 400 });
  }

  const now = nowInRestaurant();
  const offset = daysBetween(now.date, dateParam);
  // Hors de la fenêtre réservable (passé ou trop loin) : aucun créneau
  if (offset < 0 || offset >= BOOKING_DAYS) {
    return NextResponse.json({ slots: [] });
  }

  const date = new Date(dateParam);
  // Première consultation de ce jour : on crée ses créneaux d'après les horaires.
  // `skipDuplicates` s'appuie sur l'unicité (date, time) : sans risque en concurrence.
  if ((await prisma.timeSlot.count({ where: { date } })) === 0) {
    await prisma.timeSlot.createMany({ data: slotsFor(dateParam), skipDuplicates: true });
  }

  const slots = await prisma.timeSlot.findMany({
    where: { date },
    orderBy: { time: "asc" },
    select: { id: true, time: true, remainingCapacity: true },
  });

  return NextResponse.json({
    slots: slots
      // Aujourd'hui : les créneaux déjà passés ne sont plus proposés
      .filter((s) => offset > 0 || s.time > now.time)
      .map((s) => ({
        id: s.id,
        time: s.time,
        available: s.remainingCapacity >= partySize,
        remaining: s.remainingCapacity,
      })),
  });
}
