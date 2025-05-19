import { NextRequest } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16"
});

export async function POST(req: NextRequest) {
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price: process.env.STRIPE_PRICE_ID || "",
        quantity: 1
      }
    ],
    mode: "payment",
    success_url: process.env.STRIPE_SUCCESS_URL || "",
    cancel_url: process.env.STRIPE_CANCEL_URL || ""
  });

  return new Response(JSON.stringify({ url: session.url }), {
    headers: { "Content-Type": "application/json" }
  });
}
