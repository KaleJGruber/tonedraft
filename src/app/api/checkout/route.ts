import Stripe from "stripe";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST() {
  try {
    console.log("ENV CHECK", {
      secret: !!process.env.STRIPE_SECRET_KEY,
      price: process.env.STRIPE_PRICE_ID,
      url: process.env.NEXT_PUBLIC_URL,
    });

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",

      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID!,
          quantity: 1,
        },
      ],

      success_url: `${process.env.NEXT_PUBLIC_URL}/success?email={CHECKOUT_SESSION:EMAIL}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/cancel`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


