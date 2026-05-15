export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const preferredRegion = "auto";

import Stripe from "stripe";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { supabaseServer } from "@/utils/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const body = await req.text(); // RAW BODY
  const sig = headers().get("stripe-signature"); // RAW SIGNATURE

  if (!sig) {
    return new NextResponse("Missing Stripe signature", { status: 400 });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const email = session.customer_details?.email;

    if (email) {
      const { data, error } = await supabaseServer
        .from("users")
        .upsert({
          email,
          plan: "premium",
          stripeSubscriptionId: session.subscription,
          stripeCustomerId: session.customer,
        });

      console.log("SUPABASE UPSERT RESULT:", { data, error });
    }
  }

  return NextResponse.json({ received: true });
}
