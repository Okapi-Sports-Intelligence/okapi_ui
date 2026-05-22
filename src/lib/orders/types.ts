import type { Quote, QuoteInputItem } from "@/lib/pricing/calculate-quote";

export type OrderStatus =
  | "created"
  | "checkout_started"
  | "paid"
  | "failed"
  | "cancelled";

export type Order = {
  id: string;
  status: OrderStatus;
  items: QuoteInputItem[];
  quote: Quote;
  customerEmail?: string;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
};

export type PublicOrder = Pick<
  Order,
  | "id"
  | "status"
  | "items"
  | "quote"
  | "customerEmail"
  | "stripeSessionId"
  | "createdAt"
  | "updatedAt"
  | "paidAt"
>;

export type CreateOrderInput = {
  items: QuoteInputItem[];
  quote: Quote;
  customerEmail?: string;
};
