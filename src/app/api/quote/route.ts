import { z } from "zod";

import { calculateQuote } from "@/lib/pricing/calculate-quote";
import { productKeySchema } from "@/lib/product-catalog/schemas";

const leagueQuoteItemSchema = z.object({
  itemType: z.literal("league").optional(),
  leagueKey: z.string().min(1),
  productKey: productKeySchema,
});

const bundleQuoteItemSchema = z.object({
  itemType: z.literal("bundle"),
  bundleKey: z.string().min(1),
  productKey: productKeySchema,
});

const quoteRequestSchema = z.object({
  items: z.array(z.union([leagueQuoteItemSchema, bundleQuoteItemSchema])),
});

function jsonError(message: string, status: number): Response {
  return Response.json({ error: message }, { status });
}

export async function POST(request: Request): Promise<Response> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON request body.", 400);
  }

  const parsed = quoteRequestSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError(
      "Expected request body with items containing league or bundle products and a valid productKey.",
      400,
    );
  }

  try {
    return Response.json(calculateQuote(parsed.data));
  } catch (error) {
    if (error instanceof Error) {
      return jsonError(error.message, 400);
    }

    return jsonError("Unable to calculate quote.", 400);
  }
}
