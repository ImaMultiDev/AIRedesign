import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getStripe } from "@/lib/stripe-client";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "USER") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const priceId = process.env.STRIPE_PLUS_PRICE_ID?.trim();
  if (!priceId) {
    return NextResponse.json(
      { error: "Stripe no está configurado (STRIPE_PLUS_PRICE_ID)" },
      { status: 503 },
    );
  }

  const base =
    process.env.NEXTAUTH_URL?.replace(/\/$/, "") || "http://localhost:3000";

  let user;
  try {
    user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });
  } catch {
    return NextResponse.json({ error: "Base de datos no disponible" }, { status: 500 });
  }
  if (!user?.email) {
    return NextResponse.json({ error: "Usuario sin email" }, { status: 400 });
  }

  try {
    const stripe = getStripe();
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      ...(user.stripeCustomerId
        ? { customer: user.stripeCustomerId }
        : { customer_email: user.email }),
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${base}/cuenta?suscrito=1`,
      cancel_url: `${base}/pricing`,
      metadata: { userId: user.id },
      subscription_data: {
        metadata: { userId: user.id },
      },
      allow_promotion_codes: true,
    });
    if (!checkoutSession.url) {
      return NextResponse.json(
        { error: "Stripe no devolvió URL de checkout" },
        { status: 502 },
      );
    }
    return NextResponse.json({ url: checkoutSession.url });
  } catch (e) {
    console.error("[stripe checkout]", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error de Stripe" },
      { status: 502 },
    );
  }
}
