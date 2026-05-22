import { CreditCard, Loader2, X } from "lucide-react";

import type {
  ProductKey,
  PurchasableBundle,
  PurchasableLeague,
  SelectedIntelligenceItem,
} from "@/components/league-checkout/types";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/utils/format-money";

type OrderSummaryProps = {
  selectedItems: SelectedIntelligenceItem[];
  bundlesByKey: Map<string, PurchasableBundle>;
  leaguesByKey: Map<string, PurchasableLeague>;
  loading: boolean;
  error?: string;
  title?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  includedTitle?: string;
  includedItems?: string[];
  selectedExplainer?: string;
  selectedNounSingular?: string;
  selectedNounPlural?: string;
  leagueDescription?: string;
  checkoutLabel?: string;
  onRemoveBundle: (bundleKey: string) => void;
  onRemoveLeague: (leagueKey: string) => void;
  onCheckout: () => void;
};

type SelectedSummaryProduct = {
  itemType: "bundle" | "league";
  key: string;
  label: string;
  description: string;
  product: {
    name: string;
    priceCents: number;
  };
  productKey: ProductKey;
};

export function OrderSummary({
  selectedItems,
  bundlesByKey,
  leaguesByKey,
  loading,
  error,
  title = "Selected intelligence",
  emptyTitle = "No competitions selected yet.",
  emptyDescription = "Choose bundles or individual competitions to add intelligence products to your order.",
  includedTitle = "Each selection includes",
  includedItems = [
    "Workbook tier for scouting intelligence",
    "Pack tier with player visualization files",
  ],
  selectedExplainer = "Workbook products include scouting workbooks. Intelligence Packs add player visualization files for judging potential recruits. Team Analysis packages include team profiles and tactical benchmarks.",
  selectedNounSingular = "product",
  selectedNounPlural = "products",
  leagueDescription = "Competition",
  checkoutLabel = "Continue to checkout",
  onRemoveBundle,
  onRemoveLeague,
  onCheckout,
}: OrderSummaryProps) {
  const selectedProducts = selectedItems.reduce<SelectedSummaryProduct[]>(
    (products, item) => {
    if (item.itemType === "bundle") {
      const bundle = bundlesByKey.get(item.bundleKey);

      if (!bundle) {
        return products;
      }

      const product = bundle.products[item.productKey];

      if (!product) {
        return products;
      }

      products.push({
        itemType: "bundle",
        key: bundle.key,
        label: bundle.name,
        description:
          item.productKey === "intelligencePack"
            ? `${bundle.competitionCount} competitions · Player visuals included`
            : `${bundle.competitionCount} competitions · ${bundle.productType}`,
        product,
        productKey: item.productKey,
      });
      return products;
    }

    const league = leaguesByKey.get(item.leagueKey);

    if (!league) {
      return products;
    }

    const product = league.products[item.productKey];

    if (!product) {
      return products;
    }

    products.push({
      itemType: "league",
      key: league.key,
      label: league.label,
      description: leagueDescription,
      product,
      productKey: item.productKey,
    });
    return products;
  }, []);
  const totalCents = selectedProducts.reduce(
    (sum, item) => sum + item.product.priceCents,
    0,
  );
  const selectedNoun =
    selectedProducts.length === 1
      ? selectedNounSingular
      : selectedNounPlural;

  return (
    <aside className="sticky top-6 rounded-md border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-zinc-950">
            {title}
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            {selectedProducts.length} {selectedNoun} selected
          </p>
        </div>
        <p className="font-mono text-xl font-semibold tabular-nums text-zinc-950">
          {formatMoney(totalCents)}
        </p>
      </div>

      <div className="mt-4 max-h-72 overflow-auto border-y border-slate-100 py-2">
        {selectedProducts.length === 0 ? (
          <div className="py-4 text-sm text-slate-600">
            <p>{emptyTitle}</p>
            <p className="mt-2">{emptyDescription}</p>
            <div className="mt-4 rounded-md bg-slate-50 p-3">
              <p className="font-medium text-slate-900">{includedTitle}</p>
              <ul className="mt-2 grid gap-1 text-xs text-slate-600">
                {includedItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <ul className="grid gap-2">
            {selectedProducts.map((item) => (
              <li
                key={`${item.itemType}:${item.key}`}
                className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 text-sm"
              >
                <span className="min-w-0">
                  <span className="block truncate font-medium text-zinc-800">
                    {item.label}
                  </span>
                  <span className="text-xs text-slate-500">
                    {item.product.name}
                  </span>
                  <span className="block text-xs text-slate-400">
                    {item.description}
                  </span>
                </span>
                <span className="font-mono text-sm font-medium tabular-nums text-zinc-950">
                  {formatMoney(item.product.priceCents)}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    item.itemType === "bundle"
                      ? onRemoveBundle(item.key)
                      : onRemoveLeague(item.key)
                  }
                  className="flex size-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  aria-label={`Remove ${item.label} ${getProductLabel(item.productKey)}`}
                >
                  <X aria-hidden="true" className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {error ? (
        <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {selectedProducts.length > 0 ? (
        <div className="mt-4 grid gap-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-slate-600">Subtotal</span>
            <span className="font-mono font-semibold tabular-nums text-zinc-950">
              {formatMoney(totalCents)}
            </span>
          </div>
          <p className="rounded-md bg-emerald-50 px-3 py-3 text-sm text-emerald-950">
            {selectedExplainer}
          </p>
        </div>
      ) : null}

      <Button
        onClick={onCheckout}
        disabled={selectedProducts.length === 0 || loading}
        className="mt-4 w-full"
      >
        {loading ? (
          <Loader2 aria-hidden="true" className="size-4 animate-spin" />
        ) : (
          <CreditCard aria-hidden="true" className="size-4" />
        )}
        {checkoutLabel}
      </Button>
    </aside>
  );
}

function getProductLabel(productKey: ProductKey): string {
  if (productKey === "workbook") {
    return "workbook";
  }

  if (productKey === "teamAnalysis") {
    return "team analysis";
  }

  return "intelligence pack";
}
