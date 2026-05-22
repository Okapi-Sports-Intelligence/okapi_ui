"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import { BundleShowcase } from "@/components/league-checkout/bundle-showcase";
import { CompetitionGroupSidebar } from "@/components/league-checkout/competition-group-sidebar";
import { CompetitionList } from "@/components/league-checkout/competition-list";
import { CompetitionSearch } from "@/components/league-checkout/competition-search";
import { OrderSummary } from "@/components/league-checkout/order-summary";
import type {
  ProductKey,
  PurchasableBundle,
  PurchasableGroup,
  PurchasableLeague,
  SelectedIntelligenceItem,
} from "@/components/league-checkout/types";

type LeagueCheckoutAppProps = {
  bundles: PurchasableBundle[];
  groups: PurchasableGroup[];
  leagues: PurchasableLeague[];
  selectionMode?: "multi" | "singleLeague";
  title?: string;
  description?: string;
  supportingText?: string;
  showBundles?: boolean;
  catalogCardTitle?: string;
  catalogCardDescription?: string;
  includedOutputs?: string[];
  visibleProductKeys?: ProductKey[];
  primaryPriceProductKey?: ProductKey;
  secondaryPriceProductKey?: ProductKey;
  sidebarTitle?: string;
  searchPlaceholder?: string;
  workflowSteps?: {
    title: string;
    description: string;
  }[];
  reportLevels?: {
    title: string;
    description: string;
    badge?: string;
  }[];
  catalogSearchTitle?: string;
  catalogSearchDescription?: string;
  sortLabel?: string;
  summaryStats?: {
    label: string;
    value: string | number;
  }[];
  allCatalogTitle?: string;
  catalogCountNoun?: string;
  catalogCountSuffix?: string;
  individualSectionTitle?: string;
  rowValueCopy?: string;
  rowActionLabel?: string;
  rowSelectedLabel?: string;
  rowExpandedLabel?: string;
  productChooseLabel?: string;
  orderSummaryTitle?: string;
  orderSummaryEmptyTitle?: string;
  orderSummaryEmptyDescription?: string;
  orderSummaryIncludedItems?: string[];
  orderSummarySelectedExplainer?: string;
  orderSummarySelectedNounSingular?: string;
  orderSummarySelectedNounPlural?: string;
  orderSummaryLeagueDescription?: string;
  orderSummaryCheckoutLabel?: string;
};

type CheckoutSessionResponse = {
  orderId: string;
  checkoutUrl: string;
  error?: string;
};

function normalizeSearchValue(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function getSearchTokens(value: string): string[] {
  return normalizeSearchValue(value).split(/\s+/).filter(Boolean);
}

function getSearchQueryVariants(query: string): string[] {
  const normalizedQuery = normalizeSearchValue(query);

  if (!normalizedQuery) {
    return [];
  }

  const variants = new Set([normalizedQuery]);
  variants.add(normalizedQuery.replace(/\bmajor league soccer\b/g, "mls"));

  return Array.from(variants).filter(Boolean);
}

function getEditDistance(left: string, right: string): number {
  const distances = Array.from({ length: left.length + 1 }, (_, index) => [
    index,
  ]);

  for (let column = 1; column <= right.length; column += 1) {
    distances[0][column] = column;
  }

  for (let row = 1; row <= left.length; row += 1) {
    for (let column = 1; column <= right.length; column += 1) {
      const substitutionCost = left[row - 1] === right[column - 1] ? 0 : 1;

      distances[row][column] = Math.min(
        distances[row - 1][column] + 1,
        distances[row][column - 1] + 1,
        distances[row - 1][column - 1] + substitutionCost,
      );
    }
  }

  return distances[left.length][right.length];
}

function tokenMatchesQuery(token: string, candidate: string): boolean {
  if (candidate === token || candidate.startsWith(token)) {
    return true;
  }

  return token.length >= 3 && getEditDistance(token, candidate) <= 1;
}

function getLeagueSearchScoreForVariant(
  league: PurchasableLeague,
  normalizedQuery: string,
): number {
  const label = normalizeSearchValue(league.label);
  const key = normalizeSearchValue(league.key);
  const candidates = [
    league.label,
    league.key,
    league.groupLabel,
    league.metadata,
    ...league.badges,
  ];
  const candidateTokens = candidates.flatMap(getSearchTokens);
  const queryTokens = getSearchTokens(normalizedQuery);

  if (!normalizedQuery) {
    return 1;
  }

  if (label === normalizedQuery || key === normalizedQuery) {
    return 100;
  }

  if (label.startsWith(normalizedQuery) || key.startsWith(normalizedQuery)) {
    return 90;
  }

  if (label.includes(` ${normalizedQuery} `)) {
    return 80;
  }

  if (
    queryTokens.every((token) =>
      candidateTokens.some((candidate) => tokenMatchesQuery(token, candidate)),
    )
  ) {
    return 70;
  }

  return 0;
}

function getLeagueSearchScore(
  league: PurchasableLeague,
  query: string,
): number {
  const variants = getSearchQueryVariants(query);

  if (variants.length === 0) {
    return 1;
  }

  return Math.max(
    ...variants.map((variant) => getLeagueSearchScoreForVariant(league, variant)),
  );
}

export function LeagueCheckoutApp({
  bundles,
  groups,
  leagues,
  selectionMode = "multi",
  title = "Browse Competition Intelligence",
  description = "Ready-to-use scouting workbooks and visual reports for leagues, conferences, and tournaments around the world. Select the competitions you care about and get player ratings, rankings, archetypes, team profiles, and competition context built for recruitment and market analysis.",
  supportingText = "Built for recruitment, scouting, roster planning, and market analysis.",
  showBundles = true,
  catalogCardTitle = "Competition Intelligence Workbook",
  catalogCardDescription = "Choose a workbook for scouting intelligence, or upgrade to an Intelligence Pack with player visualization files to help judge potential recruits.",
  includedOutputs = [
    "Player ratings",
    "Rankings",
    "Archetypes",
    "Team profiles",
    "Player visuals",
  ],
  visibleProductKeys = ["workbook", "intelligencePack"],
  primaryPriceProductKey = "workbook",
  secondaryPriceProductKey = "intelligencePack",
  sidebarTitle = "Browse by market",
  searchPlaceholder = "Search competitions, countries, or regions",
  workflowSteps,
  reportLevels,
  catalogSearchTitle = "Find competition intelligence",
  catalogSearchDescription = "Search individual competitions, countries, or markets.",
  sortLabel = "Sorted by workbook price",
  summaryStats,
  allCatalogTitle = "All competitions",
  catalogCountNoun = "intelligence products",
  catalogCountSuffix,
  individualSectionTitle = "Individual competitions",
  rowValueCopy,
  rowActionLabel,
  rowSelectedLabel,
  rowExpandedLabel,
  productChooseLabel,
  orderSummaryTitle = "Selected intelligence",
  orderSummaryEmptyTitle,
  orderSummaryEmptyDescription,
  orderSummaryIncludedItems,
  orderSummarySelectedExplainer,
  orderSummarySelectedNounSingular,
  orderSummarySelectedNounPlural,
  orderSummaryLeagueDescription,
  orderSummaryCheckoutLabel,
}: LeagueCheckoutAppProps) {
  const [activeGroupKey, setActiveGroupKey] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedLeagueKey, setExpandedLeagueKey] = useState<string>();
  const [expandedBundleKey, setExpandedBundleKey] = useState<string>();
  const [selectedItems, setSelectedItems] = useState<SelectedIntelligenceItem[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  const leaguesByKey = useMemo(
    () => new Map(leagues.map((league) => [league.key, league])),
    [leagues],
  );
  const bundlesByKey = useMemo(
    () => new Map(bundles.map((bundle) => [bundle.key, bundle])),
    [bundles],
  );
  const selectedProductsByLeagueKey = useMemo(
    () =>
      new Map(
        selectedItems.flatMap((item) =>
          item.itemType === "league"
            ? [[item.leagueKey, item.productKey] as const]
            : [],
        ),
      ),
    [selectedItems],
  );
  const selectedProductsByBundleKey = useMemo(
    () =>
      new Map(
        selectedItems.flatMap((item) =>
          item.itemType === "bundle"
            ? [[item.bundleKey, item.productKey] as const]
            : [],
        ),
      ),
    [selectedItems],
  );
  const coveredLeagueKeys = useMemo(() => {
    const covered = new Map<string, string>();

    for (const item of selectedItems) {
      if (item.itemType !== "bundle") {
        continue;
      }

      const bundle = bundlesByKey.get(item.bundleKey);

      if (!bundle) {
        continue;
      }

      for (const leagueKey of bundle.leagueKeys) {
        covered.set(leagueKey, bundle.name);
      }
    }

    return covered;
  }, [bundlesByKey, selectedItems]);
  const activeMarketLeagueKeys = useMemo(() => {
    if (activeGroupKey === "all") {
      return undefined;
    }

    return new Set(
      leagues
        .filter((league) => league.groupKey === activeGroupKey)
        .map((league) => league.key),
    );
  }, [activeGroupKey, leagues]);

  const visibleLeagues = useMemo(() => {
    return leagues
      .map((league) => ({
        league,
        searchScore: getLeagueSearchScore(league, searchQuery),
      }))
      .filter(({ league, searchScore }) => {
        const matchesGroup =
          activeGroupKey === "all" || league.groupKey === activeGroupKey;

        return matchesGroup && searchScore > 0;
      })
      .sort(
        (a, b) =>
          b.searchScore - a.searchScore ||
          (b.league.products[primaryPriceProductKey]?.priceCents ?? 0) -
            (a.league.products[primaryPriceProductKey]?.priceCents ?? 0) ||
          a.league.label.localeCompare(b.league.label),
      )
      .map(({ league }) => league);
  }, [activeGroupKey, leagues, primaryPriceProductKey, searchQuery]);
  const visibleLeagueKey = visibleLeagues.map((league) => league.key).join("|");
  const visibleLeagueKeys = useMemo(
    () => new Set(visibleLeagues.map((league) => league.key)),
    [visibleLeagues],
  );
  const searchActive = searchQuery.trim().length > 0;
  const bundleLeagueKeys = searchActive ? visibleLeagueKeys : activeMarketLeagueKeys;
  const activeGroupLabel =
    groups.find((group) => group.key === activeGroupKey)?.label ??
    allCatalogTitle;
  const catalogHeading = searchActive
    ? `Search results for "${searchQuery.trim()}"`
    : activeGroupKey === "all"
      ? allCatalogTitle
      : activeGroupLabel;
  const relevantBundleCount =
    !searchActive && activeGroupKey === "all"
      ? bundles.length
      : bundles.filter((bundle) => {
          if (!bundleLeagueKeys || bundleLeagueKeys.size === 0) {
            return false;
          }

          return bundle.leagueKeys.some((leagueKey) =>
            bundleLeagueKeys.has(leagueKey),
          );
        }).length;
  const catalogSubtext = searchActive
    ? `${visibleLeagues.length} ${visibleLeagues.length === 1 ? "competition" : "competitions"} found`
    : showBundles
      ? `${visibleLeagues.length} competitions · ${relevantBundleCount} recommended bundles`
      : `${visibleLeagues.length} ${catalogCountNoun}${catalogCountSuffix ? ` ${catalogCountSuffix}` : ""}`;
  const visibleSummaryStats =
    summaryStats ??
    [
      {
        label: showBundles ? "Bundles" : "Packages",
        value: showBundles ? bundles.length : visibleProductKeys.length,
      },
      {
        label: "Competitions",
        value: leagues.length,
      },
      {
        label: "Markets",
        value: groups.length,
      },
    ];

  function toggleExpandedLeague(leagueKey: string) {
    setExpandedLeagueKey((current) =>
      current === leagueKey ? undefined : leagueKey,
    );
  }

  function toggleExpandedBundle(bundleKey: string) {
    setExpandedBundleKey((current) =>
      current === bundleKey ? undefined : bundleKey,
    );
  }

  function selectGroup(groupKey: string) {
    setActiveGroupKey(groupKey);
    setSearchQuery("");
    setExpandedLeagueKey(undefined);
  }

  function updateSearchQuery(value: string) {
    setSearchQuery(value);
    setActiveGroupKey("all");
    setExpandedLeagueKey(undefined);
  }

  function selectProduct(leagueKey: string, productKey: ProductKey) {
    setError(undefined);
    const coveringBundleName = coveredLeagueKeys.get(leagueKey);

    if (coveringBundleName) {
      setError(
        `${leaguesByKey.get(leagueKey)?.label ?? leagueKey} is already covered by ${coveringBundleName}.`,
      );
      return;
    }

    if (selectionMode === "singleLeague") {
      setSelectedItems([{ itemType: "league", leagueKey, productKey }]);
      return;
    }

    setSelectedItems((current) => [
      ...current.filter(
        (item) => item.itemType !== "league" || item.leagueKey !== leagueKey,
      ),
      { itemType: "league", leagueKey, productKey },
    ]);
  }

  function removeLeague(leagueKey: string) {
    setSelectedItems((current) =>
      current.filter(
        (item) => item.itemType !== "league" || item.leagueKey !== leagueKey,
      ),
    );
  }

  function selectBundleProduct(bundleKey: string, productKey: ProductKey) {
    setError(undefined);
    const bundle = bundlesByKey.get(bundleKey);

    if (!bundle) {
      setError(`Unknown bundle: ${bundleKey}`);
      return;
    }

    const bundleLeagueKeys = new Set(bundle.leagueKeys);

    setSelectedItems((current) => [
      ...current.filter((item) => {
        if (item.itemType === "bundle") {
          return item.bundleKey !== bundleKey;
        }

        return !bundleLeagueKeys.has(item.leagueKey);
      }),
      { itemType: "bundle", bundleKey, productKey },
    ]);
  }

  function removeBundle(bundleKey: string) {
    setSelectedItems((current) =>
      current.filter(
        (item) => item.itemType !== "bundle" || item.bundleKey !== bundleKey,
      ),
    );
  }

  async function startCheckout() {
    setLoading(true);
    setError(undefined);

    try {
      const response = await fetch("/api/checkout/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: selectedItems,
        }),
      });
      const payload = (await response.json()) as CheckoutSessionResponse;

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to create checkout session.");
      }

      window.location.assign(payload.checkoutUrl);
    } catch (checkoutError) {
      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : "Unable to create checkout session.",
      );
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f8f5]">
      <header className="border-b border-slate-200 bg-white">
        <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="absolute right-6 top-6 hidden flex-col items-center gap-2 md:flex">
            <Link href="/" aria-label="Return to Okapi home">
              <Image
                src="/okapi-logo.png"
                alt="Okapi Sports Intelligence"
                width={180}
                height={69}
                priority
                className="h-auto w-40 opacity-90 lg:w-44"
              />
            </Link>
          </div>
          <div>
            <p className="text-sm font-medium text-emerald-900">Okapi Data</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-zinc-950">
              {title}
            </h1>
            <p className="mt-4 max-w-3xl pr-0 text-[15px] leading-7 text-slate-600 md:pr-44 lg:pr-0">
              {description}
            </p>
            <p className="mt-3 text-sm font-medium text-slate-700">
              {supportingText}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-sm">
            {visibleSummaryStats.slice(0, 3).map((stat) => (
              <div
                key={stat.label}
                className="rounded-md border border-slate-200 bg-[#f7f8f5] px-3 py-2"
              >
                <p className="text-slate-500">{stat.label}</p>
                <p className="mt-1 font-mono font-semibold tabular-nums text-zinc-950">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-7xl gap-6 px-6 py-6 lg:grid-cols-[240px_minmax(0,1fr)_360px]">
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <CompetitionGroupSidebar
            groups={groups}
            activeGroupKey={activeGroupKey}
            totalCount={leagues.length}
            title={sidebarTitle}
            onSelectGroup={selectGroup}
          />
        </aside>

        <section className="min-w-0">
          <div className="mb-4 rounded-md border border-slate-200 bg-white p-4">
            <div className="mb-3 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-zinc-950">
                  {catalogSearchTitle}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {catalogSearchDescription}
                </p>
              </div>
              <p className="hidden text-sm text-slate-500 sm:block">
                {sortLabel}
              </p>
            </div>
            <CompetitionSearch
              value={searchQuery}
              onChange={updateSearchQuery}
              placeholder={searchPlaceholder}
            />
          </div>
          {workflowSteps ? (
            <div className="mb-4 rounded-md border border-slate-200 bg-white p-4">
              <h2 className="text-base font-semibold text-zinc-950">
                How this works
              </h2>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {workflowSteps.map((step, index) => (
                  <div key={step.title} className="rounded-md bg-slate-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-900">
                      {index + 1}. {step.title}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          {reportLevels ? (
            <div className="mb-4 rounded-md border border-slate-200 bg-white p-4">
              <div>
                <h2 className="text-base font-semibold text-zinc-950">
                  Player Intelligence Report Levels
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Choose the amount of detail you need after selecting a
                  competition or bundle.
                </p>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {reportLevels.map((level) => (
                  <div key={level.title} className="rounded-md bg-slate-50 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-semibold text-zinc-950">
                        {level.title}
                      </p>
                      {level.badge ? (
                        <span className="rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-900">
                          {level.badge}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 text-xs leading-5 text-slate-600">
                      {level.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
          <div className="mb-4 rounded-md border border-slate-200 bg-white p-4">
            <div>
              <h2 className="text-base font-semibold text-zinc-950">
                {catalogCardTitle}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {catalogCardDescription}
              </p>
            </div>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Included outputs
            </p>
            <div className="mt-2 flex flex-wrap items-start gap-2">
              {includedOutputs.map((item) => (
                <span
                  key={item}
                  className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-950"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
          )}
          <div className="mb-3 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-zinc-950">
                {catalogHeading}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {catalogSubtext}
              </p>
            </div>
          </div>
          {showBundles ? (
            <BundleShowcase
              bundles={bundles}
              expandedBundleKey={expandedBundleKey}
              marketLeagueKeys={bundleLeagueKeys}
              requireMarketMatch={searchActive}
              searchQuery={searchQuery.trim()}
              selectedProductsByBundleKey={selectedProductsByBundleKey}
              onToggleExpanded={toggleExpandedBundle}
              onSelectProduct={selectBundleProduct}
            />
          ) : null}
          <div className="mb-3">
            <h2 className="text-base font-semibold text-zinc-950">
              {individualSectionTitle}
            </h2>
          </div>
          <CompetitionList
            key={visibleLeagueKey}
            leagues={visibleLeagues}
            expandedLeagueKey={expandedLeagueKey}
            selectedProductsByLeagueKey={selectedProductsByLeagueKey}
            coveredLeagueKeys={coveredLeagueKeys}
            visibleProductKeys={visibleProductKeys}
            primaryPriceProductKey={primaryPriceProductKey}
            secondaryPriceProductKey={secondaryPriceProductKey}
            rowValueCopy={rowValueCopy}
            rowActionLabel={rowActionLabel}
            rowSelectedLabel={rowSelectedLabel}
            rowExpandedLabel={rowExpandedLabel}
            productChooseLabel={productChooseLabel}
            onToggleExpanded={toggleExpandedLeague}
            onSelectProduct={selectProduct}
          />
        </section>

        <OrderSummary
          selectedItems={selectedItems}
          bundlesByKey={bundlesByKey}
          leaguesByKey={leaguesByKey}
          loading={loading}
          error={error}
          title={orderSummaryTitle}
          emptyTitle={orderSummaryEmptyTitle}
          emptyDescription={orderSummaryEmptyDescription}
          includedItems={orderSummaryIncludedItems}
          selectedExplainer={orderSummarySelectedExplainer}
          selectedNounSingular={orderSummarySelectedNounSingular}
          selectedNounPlural={orderSummarySelectedNounPlural}
          leagueDescription={orderSummaryLeagueDescription}
          checkoutLabel={orderSummaryCheckoutLabel}
          onRemoveBundle={removeBundle}
          onRemoveLeague={removeLeague}
          onCheckout={startCheckout}
        />
      </main>
    </div>
  );
}
