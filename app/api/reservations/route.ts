import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// POST /api/reservations
// Décrément atomique de la capacité : pas de double-booking possible,
// même avec des requêtes concurrentes.
export async function POST(req: NextRequest) {
  let body: {
    timeSlotId?: string;
    partySize?: number;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
  }

  const { timeSlotId, partySize, customerName, customerEmail, customerPhone } = body;

  if (
    !timeSlotId ||
    !partySize ||
    partySize < 1 ||
    partySize > 12 ||
    !customerName?.trim() ||
    !customerEmail?.includes("@") ||
    !customerPhone?.trim()
  ) {
    return NextResponse.json({ error: "Champs manquants ou invalides" }, { status: 400 });
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
          customerName: customerName.trim(),
          customerEmail: customerEmail.trim(),
          customerPhone: customerPhone.trim(),
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
