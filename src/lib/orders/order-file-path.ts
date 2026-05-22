import "server-only";

import { tmpdir } from "node:os";
import { join } from "node:path";

export function getOrdersFilePath(): string {
  if (process.env.ORDER_FILE_PATH) {
    return process.env.ORDER_FILE_PATH;
  }

  if (process.env.VERCEL) {
    return join(tmpdir(), "okapi-ui", "orders.json");
  }

  return join(process.cwd(), ".data", "orders.json");
}
