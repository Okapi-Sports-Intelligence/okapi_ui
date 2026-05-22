import { Check, ChevronDown, Package } from "lucide-react";
import { useMemo, useState } from "react";

import type {
  ProductKey,
  PurchasableBundle,
} from "@/components/league-checkout/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";
import { formatMoney } from "@/lib/utils/format-money";

type BundleShowcaseProps = {
  bundles: PurchasableBundle[];
  expandedBundleKey?: string;
  marketLeagueKeys?: Set<string>;
  requireMarketMatch?: boolean;
  searchQuery?: string;
  selectedProductsByBundleKey: Map<string, ProductKey>;
  onToggleExpanded: (bundleKey: string) => void;
  onSelectProduct: (bundleKey: string, productKey: ProductKey) => void;
};

export function BundleShowcase({
  bundles,
  expandedBundleKey,
  marketLeagueKeys,
  requireMarketMatch = false,
  searchQuery,
  selectedProductsByBundleKey,
  onToggleExpanded,
  onSelectProduct,
}: BundleShowcaseProps) {
  const [showAllBundles, setShowAllBundles] = useState(false);
  const sortedBundles = useMemo(() => {
    return bundles
      .map((bundle) => ({
        bundle,
        marketScore: getMarketBundleScore(bundle, marketLeagueKeys),
      }))
      .filter(({ marketScore }) => !requireMarketMatch || marketScore > 0)
      .sort(
        (a, b) =>
          b.marketScore - a.marketScore ||
          a.bundle.products.workbook.priceCents -
            b.bundle.products.workbook.priceCents ||
          a.bundle.products.intelligencePack.priceCents -
            b.bundle.products.intelligencePack.priceCents ||
          a.bundle.name.localeCompare(b.bundle.name),
      )
      .map(({ bundle }) => bundle);
  }, [bundles, marketLeagueKeys, requireMarketMatch]);
  const visibleBundles = showAllBundles
    ? sortedBundles
    : sortedBundles.slice(0, 2);

  if (sortedBundles.length === 0 && requireMarketMatch && searchQuery) {
    return (
      <section className="mb-4 rounded-md border border-dashed border-slate-300 bg-white p-4">
        <h2 className="text-sm font-semibold text-zinc-950">
          Recommended bundles
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          No curated bundles found for &ldquo;{searchQuery}&rdquo;. You can
          select individual competitions below.
        </p>
      </section>
    );
  }

  return (
    <section className="mb-4 rounded-md border border-slate-200 bg-white p-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-zinc-950">
            {marketLeagueKeys ? "Recommended bundles for this market" : "Recommended bundles"}
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Curated multi-competition packages built around scouting objectives
            and market fit.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-xs text-slate-500">
            Showing {visibleBundles.length} of {sortedBundles.length}
          </p>
          <button
            type="button"
            onClick={() => setShowAllBundles((current) => !current)}
            className="inline-flex h-8 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition-colors hover:border-emerald-900 hover:text-emerald-950"
          >
            {showAllBundles ? "Show fewer" : "Show all"}
            <ChevronDown
              aria-hidden="true"
              className={showAllBundles ? "size-4 rotate-180" : "size-4"}
            />
          </button>
        </div>
      </div>

      <div className="mt-3 grid gap-2">
        {visibleBundles.map((bundle) => (
          <BundleCard
            key={bundle.key}
            bundle={bundle}
            expanded={expandedBundleKey === bundle.key}
            selectedProductKey={selectedProductsByBundleKey.get(bundle.key)}
            onToggleExpanded={onToggleExpanded}
            onSelectProduct={onSelectProduct}
          />
        ))}
      </div>
    </section>
  );
}

function getMarketBundleScore(
  bundle: PurchasableBundle,
  marketLeagueKeys?: Set<string>,
): number {
  if (!marketLeagueKeys || marketLeagueKeys.size === 0) {
    return 0;
  }

  return bundle.leagueKeys.reduce(
    (score, leagueKey) => score + (marketLeagueKeys.has(leagueKey) ? 1 : 0),
    0,
  );
}

type BundleCardProps = {
  bundle: PurchasableBundle;
  expanded: boolean;
  selectedProductKey?: ProductKey;
  onToggleExpanded: (bundleKey: string) => void;
  onSelectProduct: (bundleKey: string, productKey: ProductKey) => void;
};

function BundleCard({
  bundle,
  expanded,
  selectedProductKey,
  onToggleExpanded,
  onSelectProduct,
}: BundleCardProps) {
  const selected = selectedProductKey !== undefined;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-md border bg-[#fbfcfa]",
        selected ? "border-emerald-900 ring-1 ring-emerald-900/15" : "border-slate-200",
      )}
    >
      <button
        type="button"
        onClick={() => onToggleExpanded(bundle.key)}
        className="grid w-full gap-3 px-3 py-3 text-left transition-colors hover:bg-emerald-50/40"
      >
        <span className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center">
          <span className="flex min-w-0 gap-2">
            <span
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-md",
                selected ? "bg-emerald-900 text-white" : "bg-emerald-50 text-emerald-900",
              )}
            >
              {selected ? (
                <Check aria-hidden="true" className="size-4" />
              ) : (
                <Package aria-hidden="true" className="size-4" />
              )}
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-zinc-950">
                {bundle.name}
              </span>
              <span className="mt-1 block truncate text-xs text-slate-600">
                {bundle.buyerFit || bundle.commercialNote}
              </span>
            </span>
          </span>
          <span className="flex flex-wrap items-center gap-1.5">
            <Badge>{bundle.competitionCount} comps</Badge>
            {bundle.reviewFlag !== "Ready" ? (
              <Badge className="bg-amber-50 text-amber-800">
                Review
              </Badge>
            ) : null}
          </span>
          <span className="flex items-center justify-between gap-3 sm:justify-end">
            <span className="font-mono text-sm font-semibold tabular-nums text-zinc-950">
              Starts at {formatMoney(bundle.products.workbook.priceCents)}
            </span>
            <span className="font-mono text-xs tabular-nums text-emerald-900">
              Pack {formatMoney(bundle.products.intelligencePack.priceCents)}
            </span>
            <ChevronDown
              aria-hidden="true"
              className={cn(
                "size-4 shrink-0 text-slate-400 transition-transform",
                expanded && "rotate-180",
              )}
            />
          </span>
        </span>
      </button>

      {expanded ? (
        <div className="border-t border-slate-200 bg-white px-4 py-4">
          <div className="grid gap-2 sm:grid-cols-2">
            {Object.values(bundle.products).map((product) => (
              <button
                key={product.key}
                type="button"
                onClick={() => onSelectProduct(bundle.key, product.key)}
                className={cn(
                  "rounded-md border p-3 text-left transition-colors hover:border-emerald-900",
                  selectedProductKey === product.key
                    ? "border-emerald-900 bg-emerald-50"
                    : "border-slate-200 bg-white",
                )}
              >
                <span className="flex items-start justify-between gap-3">
                  <span>
                    <span className="block text-sm font-semibold text-zinc-950">
                      {product.name}
                      {product.key === "intelligencePack" ? (
                        <span className="ml-2 rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-900">
                          Most popular
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-slate-600">
                      {product.description}
                    </span>
                  </span>
                  <span className="font-mono text-sm font-semibold tabular-nums text-zinc-950">
                    {formatMoney(product.priceCents)}
                  </span>
                </span>
                <span
                  className={cn(
                    "mt-3 inline-flex h-8 w-full items-center justify-center rounded-md border px-3 text-sm font-medium",
                    selectedProductKey === product.key
                      ? "border-emerald-950 bg-emerald-950 text-white"
                      : "border-slate-300 bg-white text-slate-950",
                  )}
                >
                  {selectedProductKey === product.key ? "Selected" : "Choose"}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-4 rounded-md bg-slate-50 p-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Coverage preview
              </p>
              <p className="text-xs text-slate-500">
                {bundle.competitionCount} competitions
              </p>
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-600">
              {bundle.commercialNote}
            </p>
            <ul className="mt-3 grid gap-1 text-xs text-slate-600 sm:grid-cols-2">
              {bundle.previewLeagues.map((league) => (
                <li key={league.key} className="truncate">
                  {league.label}
                </li>
              ))}
            </ul>
            {bundle.competitionCount > bundle.previewLeagues.length ? (
              <p className="mt-2 text-xs text-slate-500">
                +{bundle.competitionCount - bundle.previewLeagues.length} more
                competitions in this bundle
              </p>
            ) : null}
            {bundle.unresolvedCoverageCount > 0 ? (
              <p className="mt-2 text-xs text-amber-700">
                Full visual coverage varies by competition.
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
