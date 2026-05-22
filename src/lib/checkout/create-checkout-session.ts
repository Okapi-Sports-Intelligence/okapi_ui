import "server-only";

import { createOrder, updateOrderCheckoutStarted } from "@/lib/orders/create-order";
import { assertCheckoutReadiness } from "@/lib/deployment/readiness";
import { calculateQuote } from "@/lib/pricing/calculate-quote";
import {
  getAppUrl,
  getStripe,
} from "@/lib/checkout/stripe";
import type {
  CreateCheckoutSessionInput,
  CreateCheckoutSessionResult,
} from "@/lib/checkout/types";

export async function createCheckoutSession(
  input: CreateCheckoutSessionInput,
): Promise<CreateCheckoutSessionResult> {
  if (input.items.length === 0) {
    throw new Error("Select at least one competition product before checkout.");
  }

  const quote = calculateQuote({ items: input.items });
  assertCheckoutReadiness();

  const order = await createOrder({
    items: quote.lineItems.map((item) => {
      if (item.itemType === "bundle") {
        return {
          itemType: "bundle" as const,
          bundleKey: item.bundleKey ?? "",
          productKey: item.productKey,
        };
      }

      return {
        itemType: "league" as const,
        leagueKey: item.leagueKey ?? "",
        productKey: item.productKey,
      };
    }),
    quote,
    customerEmail: input.customerEmail,
  });
  const appUrl = getAppUrl();
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: input.customerEmail,
    client_reference_id: order.id,
    success_url: `${appUrl}/checkout/success?orderId=${order.id}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/checkout/cancel?orderId=${order.id}`,
    metadata: {
      orderId: order.id,
      selectedCount: String(quote.selectedCount),
      items: order.items
        .slice(0, 25)
        .map((item) =>
          item.itemType === "bundle"
            ? `bundle:${item.bundleKey}:${item.productKey}`
            : `league:${item.leagueKey}:${item.productKey}`,
        )
        .join(","),
    },
    line_items: quote.lineItems.map((item) => ({
      quantity: 1,
      price_data: {
        currency: quote.currency,
        unit_amount: item.unitAmountCents,
        product_data: {
          name: `${item.displayName} - ${item.productName}`,
          metadata: {
            itemType: item.itemType,
            leagueKey: item.leagueKey ?? "",
            bundleKey: item.bundleKey ?? "",
            productKey: item.productKey,
            groupKey: item.groupKey ?? "",
          },
        },
      },
    })),
  });

  if (!session.url) {
    throw new Error("Stripe did not return a checkout URL.");
  }

  await updateOrderCheckoutStarted({
    orderId: order.id,
    stripeSessionId: session.id,
  });

  return {
    orderId: order.id,
    checkoutUrl: session.url,
  };
}
