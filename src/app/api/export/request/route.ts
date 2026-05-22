import { z } from "zod";

import type { DeliveryStatus } from "@/lib/okapi-export/request-export";
import { requestExportForOrder } from "@/lib/okapi-export/request-export";

export const runtime = "nodejs";

const exportRequestSchema = z.object({
  orderId: z.string().min(1),
});

function jsonError(message: string, status: number): Response {
  return Response.json({ error: message }, { status });
}

function getDeliveryHttpStatus(status: DeliveryStatus): number {
  if (status === "ready") {
    return 200;
  }

  if (status === "failed") {
    return 500;
  }

  return 202;
}

export async function POST(request: Request): Promise<Response> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON request body.", 400);
  }

  const parsed = exportRequestSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError("Expected request body with orderId.", 400);
  }

  try {
    const delivery = await requestExportForOrder(parsed.data.orderId);

    return Response.json(delivery, {
      status: getDeliveryHttpStatus(delivery.status),
    });
  } catch (error) {
    if (error instanceof Error) {
      return jsonError(error.message, 400);
    }

    return jsonError("Unable to request export.", 400);
  }
}
