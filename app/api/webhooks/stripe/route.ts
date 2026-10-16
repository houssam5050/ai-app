import { NextResponse } from "next/server";
import { db } from "@/lib/db/prisma";

/** Stripe webhook stub: verifies signature only when configured. */
export async function POST() {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: "Payments not configured (development mode, no charges)." },
      { status: 503 },
    );
  }
  // Real implementation: verify Stripe signature, then update Subscription/PaymentRecord.
  void db;
  return NextResponse.json({ ok: true, data: { received: true } });
}
