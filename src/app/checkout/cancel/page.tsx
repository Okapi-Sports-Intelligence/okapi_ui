import Link from "next/link";

import { toPublicOrder, updateOrderStatus } from "@/lib/orders/create-order";
import { getOrder } from "@/lib/orders/get-order";

export const runtime = "nodejs";

type CheckoutCancelPageProps = {
  searchParams: Promise<{
    orderId?: string;
  }>;
};

export default async function CheckoutCancelPage({
  searchParams,
}: CheckoutCancelPageProps) {
  const { orderId } = await searchParams;
  const order = orderId ? await getOrder(orderId) : undefined;
  const displayOrder =
    order && order.status !== "paid"
      ? toPublicOrder(await updateOrderStatus(order.id, "cancelled"))
      : order
        ? toPublicOrder(order)
        : undefined;
  const returnHref =
    displayOrder?.items.some((item) => item.itemType !== "bundle" && item.productKey === "teamAnalysis")
      ? "/team-analysis"
      : "/player-analysis";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-16">
      <div>
        <p className="text-sm font-medium text-zinc-500">Checkout</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Checkout cancelled
        </h1>
      </div>

      {displayOrder ? (
        <section className="rounded border border-zinc-200 p-5">
          <dl className="grid gap-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-zinc-500">Order</dt>
              <dd className="font-mono">{displayOrder.id}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-zinc-500">Status</dt>
              <dd>{displayOrder.status}</dd>
            </div>
          </dl>
        </section>
      ) : (
        <p className="text-zinc-600">No checkout order was found.</p>
      )}

      <div className="flex flex-wrap gap-3">
        <Link
          href={returnHref}
          className="inline-flex h-10 items-center justify-center rounded-md bg-emerald-950 px-4 text-sm font-medium text-white"
        >
          Return to selection
        </Link>
        <Link
          href="/"
          className="inline-flex h-10 items-center justify-center rounded-md border border-zinc-300 px-4 text-sm font-medium text-zinc-950"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
