import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { clientIp, rateLimit } from "@/lib/rate-limit";

// Anti-abus : la réservation est anonyme, donc on borne ce qu'un script peut bloquer.
const IP_LIMIT = 5; // tentatives par IP…
const IP_WINDOW_MS = 10 * 60 * 1000; // …sur 10 minutes
const MAX_UPCOMING_PER_CONTACT = 2; // réservations à venir par e-mail ou par téléphone

// POST /api/reservations
// Décrément atomique de la capacité : pas de double-booking possible,
// même avec des requêtes concurrentes.
export async function POST(req: NextRequest) {
  if (!rateLimit(clientIp(req), IP_LIMIT, IP_WINDOW_MS)) {
    return NextResponse.json(
      { error: "Trop de tentatives. Réessayez dans quelques minutes ou appelez-nous." },
      { status: 429 },
    );
  }

  let body: {
    timeSlotId?: unknown;
    partySize?: unknown;
    customerName?: unknown;
    customerEmail?: unknown;
    customerPhone?: unknown;
    website?: unknown; // champ piège, invisible pour les humains
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
  }

  const { timeSlotId, partySize, website } = body;
  const customerName = typeof body.customerName === "string" ? body.customerName.trim() : "";
  const customerEmail = typeof body.customerEmail === "string" ? body.customerEmail.trim().toLowerCase() : "";
  // Téléphone normalisé (sans espaces ni séparateurs) pour que le plafond par numéro tienne
  const customerPhone = typeof body.customerPhone === "string" ? body.customerPhone.replace(/[\s.\-()]/g, "") : "";

  if (
    (typeof website === "string" && website !== "") ||
    typeof timeSlotId !== "string" ||
    !timeSlotId ||
    typeof partySize !== "number" ||
    !Number.isInteger(partySize) ||
    partySize < 1 ||
    partySize > 12 ||
    !customerName ||
    customerName.length > 100 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail) ||
    customerEmail.length > 254 ||
    !/^\+?\d{6,20}$/.test(customerPhone)
  ) {
    return NextResponse.json({ error: "Champs manquants ou invalides" }, { status: 400 });
  }

  const today = new Date(new Date().toISOString().slice(0, 10));
  const upcoming = await prisma.reservation.count({
    where: {
      status: { not: "CANCELLED" },
      timeSlot: { date: { gte: today } },
      OR: [{ customerEmail }, { customerPhone }],
    },
  });
  if (upcoming >= MAX_UPCOMING_PER_CONTACT) {
    return NextResponse.json(
      { error: "Vous avez déjà plusieurs réservations à venir. Appelez-nous pour en ajouter une." },
      { status: 429 },
    );
  }

  try {
    const reservation = await prisma.$transaction(async (tx) => {
      // updateMany conditionnel = verrou optimiste : 0 ligne touchée si plus de place
      const updated = await tx.timeSlot.updateMany({
        where: { id: timeSlotId, remainingCapacity: { gte: partySize } },
        data: { remainingCapacity: { decrement: partySize } },
      });
      if (updated.count === 0) {
        throw new Error("SLOT_FULL");
      }
      return tx.reservation.create({
        data: {
          timeSlotId,
          partySize,
          customerName,
          customerEmail,
          customerPhone,
        },
        include: { timeSlot: true },
      });
    });

    // TODO production : envoi email/SMS de confirmation (Resend, Twilio…)
    // TODO production : si partySize >= 7, créer un PaymentIntent Stripe
    // et ne confirmer la réservation qu'au webhook payment_intent.succeeded.

    return NextResponse.json(
      {
        id: reservation.id,
        date: reservation.timeSlot.date.toISOString().slice(0, 10),
        time: reservation.timeSlot.time,
        partySize: reservation.partySize,
      },
      { status: 201 },
    );
  } catch (e) {
    if (e instanceof Error && e.message === "SLOT_FULL") {
      return NextResponse.json(
        { error: "Ce créneau vient de se remplir — choisissez-en un autre." },
        { status: 409 },
      );
    }
    console.error(e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
