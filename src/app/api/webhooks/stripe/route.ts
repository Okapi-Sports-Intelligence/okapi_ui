import type Stripe from "stripe";

import { getStripe } from "@/lib/checkout/stripe";
import { markOrderPaid } from "@/lib/orders/create-order";

export const runtime = "nodejs";

function jsonError(message: string, status: number): Response {
  return Response.json({ error: message }, { status });
}

export async function POST(request: Request): Promise<Response> {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature) {
    return jsonError("Missing Stripe-Signature header.", 400);
  }

  if (!webhookSecret) {
    return jsonError("Missing STRIPE_WEBHOOK_SECRET.", 500);
  }

  const body = await request.text();
  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Invalid Stripe webhook.";
    return jsonError(message, 400);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId ?? session.client_reference_id;

    if (!orderId) {
      return jsonError("Completed session is missing orderId metadata.", 400);
    }

    await markOrderPaid({
      orderId,
      stripeSessionId: session.id,
      stripePaymentIntentId:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id,
    });
  }

  return Response.json({ received: true });
}
