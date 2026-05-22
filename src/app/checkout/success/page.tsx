import { getOrder } from "@/lib/orders/get-order";
import { requestExportForOrder } from "@/lib/okapi-export/request-export";
import { formatMoney } from "@/lib/utils/format-money";

export const runtime = "nodejs";

type CheckoutSuccessPageProps = {
  searchParams: Promise<{
    orderId?: string;
  }>;
};

export default async function CheckoutSuccessPage({
  searchParams,
}: CheckoutSuccessPageProps) {
  const { orderId } = await searchParams;
  const order = orderId ? await getOrder(orderId) : undefined;
  const delivery =
    order?.status === "paid"
      ? await requestExportForOrder(order.id).catch((error: unknown) => ({
          status: "failed" as const,
          orderId: order.id,
          deliveryEnabled: false,
          lineItems: order.quote.lineItems,
          message:
            error instanceof Error
              ? error.message
              : "Unable to prepare delivery status.",
        }))
      : undefined;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-6 py-16">
      <div>
        <p className="text-sm font-medium text-emerald-700">Checkout</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          {order?.status === "paid" ? "Payment received" : "Checkout submitted"}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
          {order?.status === "paid"
            ? "Your payment is confirmed. Delivery status for the purchased intelligence products is shown below."
            : "Stripe may still be confirming the payment. Refresh this page after the webhook is delivered."}
        </p>
      </div>

      {order ? (
        <section className="rounded-md border border-zinc-200 bg-white p-5">
          <dl className="grid gap-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-zinc-500">Order</dt>
              <dd className="font-mono">{order.id}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-zinc-500">Status</dt>
              <dd>{order.status}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-zinc-500">Total</dt>
              <dd>{formatMoney(order.quote.totalCents)}</dd>
            </div>
          </dl>
        </section>
      ) : (
        <p className="text-zinc-600">
          The order is not available yet. Stripe may still be sending the
          payment confirmation.
        </p>
      )}

      {order ? (
        <section className="rounded-md border border-zinc-200 bg-white p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-zinc-950">
                Purchased intelligence
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                {order.quote.lineItems.length}{" "}
                {order.quote.lineItems.length === 1 ? "item" : "items"}
              </p>
            </div>
            <p className="font-mono text-lg font-semibold text-zinc-950">
              {formatMoney(order.quote.totalCents)}
            </p>
          </div>
          <ul className="mt-4 divide-y divide-zinc-100">
            {order.quote.lineItems.map((item) => (
              <li
                key={`${item.itemType}:${item.leagueKey ?? item.bundleKey}:${item.productKey}`}
                className="grid gap-2 py-3 text-sm sm:grid-cols-[minmax(0,1fr)_auto]"
              >
                <div>
                  <p className="font-medium text-zinc-950">
                    {item.displayName}
                  </p>
                  <p className="mt-1 text-zinc-500">{item.productName}</p>
                  {item.itemType === "bundle" ? (
                    <p className="mt-1 text-xs text-zinc-500">
                      {item.coverageCount} competitions covered
                    </p>
                  ) : item.groupLabel ? (
                    <p className="mt-1 text-xs text-zinc-500">
                      {item.groupLabel}
                    </p>
                  ) : null}
                </div>
                <p className="font-mono font-semibold tabular-nums text-zinc-950">
                  {formatMoney(item.unitAmountCents)}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {delivery ? (
        <section className="rounded-md border border-amber-200 bg-amber-50 p-5">
          <p className="text-sm font-semibold uppercase tracking-wide text-amber-900">
            Delivery {delivery.status}
          </p>
          <h2 className="mt-2 text-lg font-semibold text-zinc-950">
            Download page is waiting on export mapping
          </h2>
          <p className="mt-2 text-sm leading-6 text-amber-950">
            {delivery.message}
          </p>
          <button
            type="button"
            disabled
            className="mt-4 inline-flex h-10 items-center justify-center rounded-md bg-zinc-300 px-4 text-sm font-medium text-zinc-600"
          >
            Downloads pending
          </button>
        </section>
      ) : null}
    </main>
  );
}
