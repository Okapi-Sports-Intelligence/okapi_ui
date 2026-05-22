import "server-only";

export type CheckoutReadiness = {
  stripeMode: "missing" | "test" | "live" | "unknown";
  orderStore: "file" | "database" | "unknown";
  exportDeliveryEnabled: boolean;
  liveCheckoutEnabled: boolean;
  canCreateCheckout: boolean;
  blockers: string[];
};

function getStripeMode(): CheckoutReadiness["stripeMode"] {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    return "missing";
  }

  if (secretKey.startsWith("sk_test_")) {
    return "test";
  }

  if (secretKey.startsWith("sk_live_")) {
    return "live";
  }

  return "unknown";
}

function getOrderStore(): CheckoutReadiness["orderStore"] {
  const configuredStore = process.env.ORDER_STORE;

  if (!configuredStore || configuredStore === "file") {
    return "file";
  }

  if (configuredStore === "database") {
    return "database";
  }

  return "unknown";
}

export function getCheckoutReadiness(): CheckoutReadiness {
  const stripeMode = getStripeMode();
  const orderStore = getOrderStore();
  const exportDeliveryEnabled = process.env.EXPORT_DELIVERY_ENABLED === "true";
  const liveCheckoutEnabled = process.env.OKAPI_ENABLE_LIVE_CHECKOUT === "true";
  const blockers: string[] = [];

  if (stripeMode === "missing") {
    blockers.push("Missing STRIPE_SECRET_KEY.");
  }

  if (stripeMode === "unknown") {
    blockers.push("STRIPE_SECRET_KEY must be a Stripe test or live secret key.");
  }

  if (stripeMode === "live") {
    if (!liveCheckoutEnabled) {
      blockers.push("Live checkout is disabled by OKAPI_ENABLE_LIVE_CHECKOUT.");
    }

    if (orderStore !== "database") {
      blockers.push("Live checkout requires ORDER_STORE=database.");
    }

    if (!exportDeliveryEnabled) {
      blockers.push("Live checkout requires EXPORT_DELIVERY_ENABLED=true.");
    }
  }

  return {
    stripeMode,
    orderStore,
    exportDeliveryEnabled,
    liveCheckoutEnabled,
    canCreateCheckout: blockers.length === 0,
    blockers,
  };
}

export function assertCheckoutReadiness(): void {
  const readiness = getCheckoutReadiness();

  if (readiness.canCreateCheckout) {
    return;
  }

  throw new Error(
    `Checkout is not ready: ${readiness.blockers.join(" ")}`,
  );
}
