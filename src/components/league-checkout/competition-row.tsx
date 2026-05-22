import type { PurchasableLeague } from "@/components/league-checkout/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";
import { formatMoney } from "@/lib/utils/format-money";
import type { ProductKey } from "@/components/league-checkout/types";

type CompetitionRowProps = {
  league: PurchasableLeague;
  expanded: boolean;
  selectedProductKey?: ProductKey;
  coveringBundleName?: string;
  visibleProductKeys: ProductKey[];
  primaryPriceProductKey: ProductKey;
  secondaryPriceProductKey?: ProductKey;
  rowValueCopy?: string;
  rowActionLabel?: string;
  rowSelectedLabel?: string;
  rowExpandedLabel?: string;
  productChooseLabel?: string;
  onToggleExpanded: (leagueKey: string) => void;
  onSelectProduct: (leagueKey: string, productKey: ProductKey) => void;
};

function getCompetitionDisplayName(label: string): string {
  return label.replace(/\s+\(Level\s+\d+,\s*[^)]+\)$/i, "");
}

export function CompetitionRow({
  league,
  expanded,
  selectedProductKey,
  coveringBundleName,
  visibleProductKeys,
  primaryPriceProductKey,
  secondaryPriceProductKey,
  rowValueCopy = "Player ratings · rankings · archetypes · team context",
  rowActionLabel = "Choose report level",
  rowSelectedLabel = "Selected",
  rowExpandedLabel = "Hide options",
  productChooseLabel = "Choose",
  onToggleExpanded,
  onSelectProduct,
}: CompetitionRowProps) {
  const selected = selectedProductKey !== undefined;
  const covered = coveringBundleName !== undefined;
  const visibleProducts = visibleProductKeys.flatMap((productKey) => {
    const product = league.products[productKey];

    return product ? [product] : [];
  });
  const primaryPriceProduct = league.products[primaryPriceProductKey];
  const secondaryPriceProduct = secondaryPriceProductKey
    ? league.products[secondaryPriceProductKey]
    : undefined;

  return (
    <div
      className={cn(
        "border-b border-slate-100 border-l-2 last:border-b-0",
        selected
          ? "border-l-emerald-900 bg-emerald-50"
          : "border-l-transparent",
      )}
    >
      <button
        type="button"
        onClick={() => onToggleExpanded(league.key)}
        className={cn(
          "grid min-h-[86px] w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-4 text-left transition-colors hover:bg-slate-50",
          covered && "bg-slate-50",
        )}
      >
        <span className="flex min-w-0 items-center gap-3">
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium text-zinc-950">
              {getCompetitionDisplayName(league.label)}
            </span>
            <span className="mt-1 block truncate text-xs text-slate-500">
              {league.metadata || league.groupLabel}
            </span>
            <span className="mt-2 flex min-w-0 flex-wrap items-center gap-1.5">
              {league.badges.map((badge) => (
                <Badge
                  key={badge}
                  className={
                    badge === "Workbook"
                      ? "bg-emerald-50 text-emerald-900"
                      : undefined
                  }
                >
                  {badge}
                </Badge>
              ))}
            </span>
            <span className="mt-2 block truncate text-xs text-slate-500">
              {covered
                ? `Covered by ${coveringBundleName}`
                : rowValueCopy}
            </span>
          </span>
        </span>
        <span className="grid gap-1 text-right">
          {primaryPriceProduct ? (
            <span className="font-mono text-sm font-semibold tabular-nums text-zinc-950">
              {formatMoney(primaryPriceProduct.priceCents)}
            </span>
          ) : null}
          {secondaryPriceProduct ? (
            <span className="font-mono text-xs tabular-nums text-emerald-900">
              {secondaryPriceProduct.shortName}{" "}
              {formatMoney(secondaryPriceProduct.priceCents)}
            </span>
          ) : null}
          <span className="mt-1 inline-flex h-8 items-center justify-center rounded-md border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700">
            {selected ? rowSelectedLabel : expanded ? rowExpandedLabel : rowActionLabel}
          </span>
        </span>
      </button>

      {expanded ? (
        <div className="grid gap-2 px-4 pb-4 pl-12 sm:grid-cols-2">
          {visibleProducts.map((product) => (
            <button
              key={product.key}
              type="button"
              disabled={covered}
              onClick={() => onSelectProduct(league.key, product.key)}
              className={cn(
                "rounded-md border bg-white p-3 text-left transition-colors hover:border-emerald-900 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:border-slate-200",
                selectedProductKey === product.key
                  ? "border-emerald-900 bg-emerald-50"
                  : "border-slate-200",
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
                {covered
                  ? "Included in bundle"
                  : selectedProductKey === product.key
                    ? "Selected"
                    : productChooseLabel}
              </span>
            </button>
          ))}
          {league.comingSoonProducts?.map((product) => (
            <div
              key={product.key}
              className="rounded-md border border-slate-200 bg-slate-50 p-3 text-left"
            >
              <span className="flex items-start justify-between gap-3">
                <span>
                  <span className="block text-sm font-semibold text-zinc-950">
                    {product.name}
                    <span className="ml-2 rounded bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                      Coming soon
                    </span>
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-slate-600">
                    {product.description}
                  </span>
                </span>
                <span className="text-right">
                  <span className="font-mono text-sm font-semibold tabular-nums text-zinc-950">
                    {formatMoney(product.priceCents)}
                  </span>
                  <span className="mt-1 block text-xs font-medium text-slate-500">
                    Request access
                  </span>
                </span>
              </span>
              <span className="mt-3 inline-flex h-8 w-full items-center justify-center rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-500">
                Request access
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
