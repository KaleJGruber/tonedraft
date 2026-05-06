export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const preferredRegion = "auto";

import Stripe from "stripe";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// SERVICE ROLE CLIENT (required for updating user rows)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const body = await req.text(); // RAW BODY
  const sig = headers().get("stripe-signature"); // RAW SIGNATURE

  if (!sig) {
    return new NextResponse("Missing Stripe signature", { status: 400 });
  }

  let event;

  // DEBUG LINE
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

    //  GET USER EMAIL FROM CHECKOUT SESSION
    const email = session.customer_details?.email;

    if (email) {
      //  UPDATE SUPABASE USER TO PREMIUM
      const { data, error } = await supabase
        .from("profiles")
        .update({ is_premium: true })
        .eq("email", email);

      console.log("Updated user:", email, { data, error });
    }
  }

  return NextResponse.json({ received: true });
}
