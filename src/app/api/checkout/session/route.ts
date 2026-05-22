import { z } from "zod";

import { createCheckoutSession } from "@/lib/checkout/create-checkout-session";
import { toPublicOrder, updateOrderStatus } from "@/lib/orders/create-order";
import { getOrder } from "@/lib/orders/get-order";
import { productKeySchema } from "@/lib/product-catalog/schemas";

export const runtime = "nodejs";

const leagueCheckoutItemSchema = z.object({
  itemType: z.literal("league").optional(),
  leagueKey: z.string().min(1),
  productKey: productKeySchema,
});

const bundleCheckoutItemSchema = z.object({
  itemType: z.literal("bundle"),
  bundleKey: z.string().min(1),
  productKey: productKeySchema,
});

const createCheckoutRequestSchema = z.object({
  items: z.array(z.union([leagueCheckoutItemSchema, bundleCheckoutItemSchema])),
  customerEmail: z.string().email().optional(),
});

function jsonError(message: string, status: number): Response {
  return Response.json({ error: message }, { status });
}

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const orderId = url.searchParams.get("orderId");

  if (!orderId) {
    return jsonError("Missing orderId.", 400);
  }

  const order = await getOrder(orderId);

  if (!order) {
    return jsonError(`Unknown order id: ${orderId}`, 404);
  }

  return Response.json({ order: toPublicOrder(order) });
}

export async function POST(request: Request): Promise<Response> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON request body.", 400);
  }

  const parsed = createCheckoutRequestSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError(
      "Expected request body with league or bundle items, a valid productKey, and optional customerEmail.",
      400,
    );
  }

  try {
    return Response.json(await createCheckoutSession(parsed.data));
  } catch (error) {
    if (error instanceof Error) {
      return jsonError(error.message, 400);
    }

    return jsonError("Unable to create checkout session.", 400);
  }
}

export async function PATCH(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const orderId = url.searchParams.get("orderId");
  const status = url.searchParams.get("status");

  if (!orderId || status !== "cancelled") {
    return jsonError("Expected orderId and status=cancelled.", 400);
  }

  try {
    const order = await getOrder(orderId);

    if (!order) {
      return jsonError(`Unknown order id: ${orderId}`, 404);
    }

    if (order.status === "paid") {
      return Response.json({ order: toPublicOrder(order) });
    }

    const updatedOrder = await updateOrderStatus(orderId, "cancelled");
    return Response.json({ order: toPublicOrder(updatedOrder) });
  } catch (error) {
    if (error instanceof Error) {
      return jsonError(error.message, 400);
    }

    return jsonError("Unable to update checkout session.", 400);
  }
}
