export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const preferredRegion = "auto";

import Stripe from "stripe";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { supabase } from "@/utils/supabase/client";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const body = await req.text(); // RAW BODY
  const sig = headers().get("stripe-signature"); // RAW SIGNATURE

  if (!sig) {
    return new NextResponse("Missing Stripe signature", { status: 400 });
  }

  let event;

  // DEBUG: Is webhook secret loading?
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

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    console.log("Checkout session completed:", session.id);

    // ⭐ DEBUG: What email did Stripe send?
    console.log("SESSION EMAIL:", session.customer_details?.email);

    // ⭐ DEBUG: Are Supabase env vars loading?
    console.log("SUPABASE URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log("SERVICE ROLE LOADED:", !!process.env.SUPABASE_SERVICE_ROLE_KEY);

    const email = session.customer_details?.email;

    if (email) {
      const { data, error } = await supabase
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
