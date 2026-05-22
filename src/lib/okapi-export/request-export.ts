import "server-only";

import { getOrder } from "@/lib/orders/get-order";
import type { QuoteLineItem } from "@/lib/pricing/calculate-quote";

export type DeliveryStatus = "pending" | "processing" | "ready" | "failed";

export type DeliveryRequestResult = {
  status: DeliveryStatus;
  orderId: string;
  deliveryEnabled: boolean;
  lineItems: QuoteLineItem[];
  message: string;
};

export async function requestExportForOrder(
  orderId: string,
): Promise<DeliveryRequestResult> {
  const order = await getOrder(orderId);

  if (!order) {
    throw new Error(`Unknown order id: ${orderId}`);
  }

  if (order.status !== "paid") {
    throw new Error(`Order ${orderId} is not paid.`);
  }

  return {
    status: "pending",
    orderId,
    deliveryEnabled: false,
    lineItems: order.quote.lineItems,
    message:
      "Payment is confirmed. Download delivery is pending because product-to-export mapping is not implemented yet.",
  };
}
