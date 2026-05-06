export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const preferredRegion = "auto";

import Stripe from "stripe";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const body = await req.text(); // RAW BODY
  const sig = headers().get("stripe-signature"); // RAW SIGNATURE

  if (!sig) {
    return new NextResponse("Missing Stripe signature", { status: 400 });
  }

  let event;

console.log("WEBHOOK SECRET:", process.env.STRIPE_WEBHOOK_SECRET);

try {
  event = stripe.webhooks.constructEvent(
    body,
    sig,
    process.env.STRIPE_WEBHOOK_SECRET!
  );
} catch (err: any) {
  return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
}

