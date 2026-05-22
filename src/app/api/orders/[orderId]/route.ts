import { toPublicOrder } from "@/lib/orders/create-order";
import { getOrder } from "@/lib/orders/get-order";

export const runtime = "nodejs";

function jsonError(message: string, status: number): Response {
  return Response.json({ error: message }, { status });
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ orderId: string }> },
): Promise<Response> {
  const { orderId } = await context.params;
  const order = await getOrder(orderId);

  if (!order) {
    return jsonError(`Unknown order id: ${orderId}`, 404);
  }

  return Response.json({ order: toPublicOrder(order) });
}
