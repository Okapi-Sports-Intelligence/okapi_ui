import "server-only";

import { readFile } from "node:fs/promises";
import { join } from "node:path";

import type { Order } from "@/lib/orders/types";

const ordersFilePath = join(process.cwd(), ".data", "orders.json");

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

export async function getOrder(orderId: string): Promise<Order | undefined> {
  const orders = await readOrders();
  return orders.find((order) => order.id === orderId);
}

export async function getOrderByStripeSessionId(
  stripeSessionId: string,
): Promise<Order | undefined> {
  const orders = await readOrders();
  return orders.find((order) => order.stripeSessionId === stripeSessionId);
}
