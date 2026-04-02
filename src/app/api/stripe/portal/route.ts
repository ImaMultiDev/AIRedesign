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

  const base =
    process.env.NEXTAUTH_URL?.replace(/\/$/, "") || "http://localhost:3000";

  let user;
  try {
    user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { stripeCustomerId: true },
    });
  } catch {
    return NextResponse.json({ error: "Base de datos no disponible" }, { status: 500 });
  }

  if (!user?.stripeCustomerId) {
    return NextResponse.json(
      { error: "No hay cliente de facturación asociado" },
      { status: 400 },
    );
  }

  try {
    const stripe = getStripe();
    const portal = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${base}/cuenta`,
    });
    return NextResponse.json({ url: portal.url });
  } catch (e) {
    console.error("[stripe portal]", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error de Stripe" },
      { status: 502 },
    );
  }
}
