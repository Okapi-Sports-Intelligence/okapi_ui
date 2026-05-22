import "server-only";

import Stripe from "stripe";

let stripe: Stripe | undefined;

export function getStripe(): Stripe {
  if (stripe) {
    return stripe;
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY.");
  }

  stripe = new Stripe(secretKey);
  return stripe;
}

export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}
