import type {
  ProductKey,
  PurchasableLeague,
} from "@/components/league-checkout/types";
import { CompetitionRow } from "@/components/league-checkout/competition-row";

type CompetitionListProps = {
  leagues: PurchasableLeague[];
  expandedLeagueKey?: string;
  selectedProductsByLeagueKey: Map<string, ProductKey>;
  coveredLeagueKeys: Map<string, string>;
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

export function CompetitionList({
  leagues,
  expandedLeagueKey,
  selectedProductsByLeagueKey,
  coveredLeagueKeys,
  visibleProductKeys,
  primaryPriceProductKey,
  secondaryPriceProductKey,
  rowValueCopy,
  rowActionLabel,
  rowSelectedLabel,
  rowExpandedLabel,
  productChooseLabel,
  onToggleExpanded,
  onSelectProduct,
}: CompetitionListProps) {
  if (leagues.length === 0) {
    return (
      <div className="flex min-h-48 items-center justify-center rounded-md border border-dashed border-zinc-300 px-6 text-center text-sm text-zinc-500">
        No competition intelligence products match this view.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border border-zinc-200 bg-white">
      {leagues.map((league) => (
        <CompetitionRow
          key={league.key}
          league={league}
          expanded={expandedLeagueKey === league.key}
          selectedProductKey={selectedProductsByLeagueKey.get(league.key)}
          coveringBundleName={coveredLeagueKeys.get(league.key)}
          visibleProductKeys={visibleProductKeys}
          primaryPriceProductKey={primaryPriceProductKey}
          secondaryPriceProductKey={secondaryPriceProductKey}
          rowValueCopy={rowValueCopy}
          rowActionLabel={rowActionLabel}
          rowSelectedLabel={rowSelectedLabel}
          rowExpandedLabel={rowExpandedLabel}
          productChooseLabel={productChooseLabel}
          onToggleExpanded={onToggleExpanded}
          onSelectProduct={onSelectProduct}
        />
      ))}
    </div>
  );
}
