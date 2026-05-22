import "server-only";

import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

import type {
  CreateOrderInput,
  Order,
  OrderStatus,
  PublicOrder,
} from "@/lib/orders/types";

const ordersFilePath = join(process.cwd(), ".data", "orders.json");

let writeQueue = Promise.resolve();

async function readOrders(): Promise<Order[]> {
  try {
    const file = await readFile(ordersFilePath, "utf8");
    return JSON.parse(file) as Order[];
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      return [];
    }

    throw error;
  }
}

async function writeOrders(orders: Order[]): Promise<void> {
  await mkdir(dirname(ordersFilePath), { recursive: true });
  await writeFile(ordersFilePath, `${JSON.stringify(orders, null, 2)}\n`);
}

function enqueueWrite<T>(operation: () => Promise<T>): Promise<T> {
  const next = writeQueue.then(operation, operation);
  writeQueue = next.then(
    () => undefined,
    () => undefined,
  );
  return next;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function toPublicOrder(order: Order): PublicOrder {
  return {
    id: order.id,
    status: order.status,
    items: order.items,
    quote: order.quote,
    customerEmail: order.customerEmail,
    stripeSessionId: order.stripeSessionId,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    paidAt: order.paidAt,
  };
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  return enqueueWrite(async () => {
    const timestamp = nowIso();
    const order: Order = {
      id: `ord_${randomUUID()}`,
      status: "created",
      items: input.items,
      quote: input.quote,
      customerEmail: input.customerEmail,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    const orders = await readOrders();

    orders.push(order);
    await writeOrders(orders);

    return order;
  });
}

export async function updateOrderCheckoutStarted(input: {
  orderId: string;
  stripeSessionId: string;
}): Promise<Order> {
  return updateOrder(input.orderId, {
    status: "checkout_started",
    stripeSessionId: input.stripeSessionId,
  });
}

export async function markOrderPaid(input: {
  orderId: string;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
}): Promise<Order> {
  return enqueueWrite(async () => {
    const orders = await readOrders();
    const order = orders.find((candidate) => candidate.id === input.orderId);

    if (!order) {
      throw new Error(`Unknown order id: ${input.orderId}`);
    }

    if (order.status === "paid") {
      return order;
    }

    const timestamp = nowIso();
    order.status = "paid";
    order.updatedAt = timestamp;
    order.paidAt = timestamp;
    order.stripeSessionId = input.stripeSessionId ?? order.stripeSessionId;
    order.stripePaymentIntentId =
      input.stripePaymentIntentId ?? order.stripePaymentIntentId;

    await writeOrders(orders);
    return order;
  });
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
): Promise<Order> {
  return updateOrder(orderId, { status });
}

async function updateOrder(
  orderId: string,
  patch: Partial<Order>,
): Promise<Order> {
  return enqueueWrite(async () => {
    const orders = await readOrders();
    const order = orders.find((candidate) => candidate.id === orderId);

    if (!order) {
      throw new Error(`Unknown order id: ${orderId}`);
    }

    Object.assign(order, patch, { updatedAt: nowIso() });
    await writeOrders(orders);

    return order;
  });
}
