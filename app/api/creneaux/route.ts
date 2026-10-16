import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/creneaux?date=2026-07-04&partySize=2
// Renvoie les créneaux du jour avec leur disponibilité réelle.
export async function GET(req: NextRequest) {
  const dateParam = req.nextUrl.searchParams.get("date");
  const partySize = Number(req.nextUrl.searchParams.get("partySize") ?? 2);

  if (!dateParam || !/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
    return NextResponse.json({ error: "Paramètre date invalide (YYYY-MM-DD)" }, { status: 400 });
  }

  const slots = await prisma.timeSlot.findMany({
    where: { date: new Date(dateParam) },
    orderBy: { time: "asc" },
    select: { id: true, time: true, remainingCapacity: true },
  });

  return NextResponse.json({
    slots: slots.map((s) => ({
      id: s.id,
      time: s.time,
      available: s.remainingCapacity >= partySize,
      remaining: s.remainingCapacity,
    })),
  });
}
