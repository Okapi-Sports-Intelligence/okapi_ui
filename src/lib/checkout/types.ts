import type { QuoteInputItem } from "@/lib/pricing/calculate-quote";

export type CreateCheckoutSessionInput = {
  items: QuoteInputItem[];
  customerEmail?: string;
};

export type CreateCheckoutSessionResult = {
  orderId: string;
  checkoutUrl: string;
};
