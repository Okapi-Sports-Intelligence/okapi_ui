import "server-only";

import { getProductCatalog } from "@/lib/product-catalog/get-product-catalog";
import type { ProductKey } from "@/lib/product-catalog/types";

export type QuoteInput = {
  items: QuoteInputItem[];
};

export type LeagueQuoteInputItem = {
  itemType?: "league";
  leagueKey: string;
  productKey: ProductKey;
};

export type BundleQuoteInputItem = {
  itemType: "bundle";
  bundleKey: string;
  productKey: ProductKey;
};

export type QuoteInputItem = LeagueQuoteInputItem | BundleQuoteInputItem;

export type QuoteLineItem = {
  itemType: "league" | "bundle";
  leagueKey?: string;
  bundleKey?: string;
  displayName: string;
  productKey: ProductKey;
  productName: string;
  groupKey?: string;
  groupLabel?: string;
  coverageLeagueKeys?: string[];
  coverageCount?: number;
  unresolvedCoverageCount?: number;
  reviewFlag?: string;
  unitAmountCents: number;
};

export type Quote = {
  currency: "usd";
  selectedCount: number;
  subtotalCents: number;
  totalCents: number;
  lineItems: QuoteLineItem[];
};

export function getProductName(productKey: ProductKey): string {
  if (productKey === "workbook") {
    return "Competition Intelligence Workbook";
  }

  if (productKey === "teamAnalysis") {
    return "Team Analysis Package";
  }

  return "Intelligence Pack";
}

function getInputItemIdentity(item: QuoteInputItem): string {
  if (item.itemType === "bundle") {
    return `bundle:${item.bundleKey}:${item.productKey}`;
  }

  return `league:${item.leagueKey}:${item.productKey}`;
}

export function calculateQuote(input: QuoteInput): Quote {
  const catalog = getProductCatalog();

  const uniqueItems = Array.from(
    new Map(
      input.items.map((item) => [getInputItemIdentity(item), item]),
    ).values(),
  );
  const seenLeagueKeys = new Set<string>();
  const selectedBundleKeys = new Set<string>();
  const bundleCoveredLeagueKeys = new Map<string, string>();

  for (const item of uniqueItems) {
    if (item.itemType !== "bundle") {
      continue;
    }

    if (selectedBundleKeys.has(item.bundleKey)) {
      throw new Error(
        `Choose only one product tier for bundle key: ${item.bundleKey}`,
      );
    }

    selectedBundleKeys.add(item.bundleKey);

    const bundle = catalog.bundleByKey.get(item.bundleKey);

    if (!bundle) {
      throw new Error(`Unknown bundle key: ${item.bundleKey}`);
    }

    for (const leagueKey of bundle.leagueKeys) {
      bundleCoveredLeagueKeys.set(leagueKey, item.bundleKey);
    }
  }

  const lineItems = uniqueItems.map((item) => {
    if (item.itemType === "bundle") {
      const { bundleKey, productKey } = item;
      const bundle = catalog.bundleByKey.get(bundleKey);

      if (!bundle) {
        throw new Error(`Unknown bundle key: ${bundleKey}`);
      }

      const product = bundle.products[productKey];

      if (!product) {
        throw new Error(
          `No product "${productKey}" configured for bundle key: ${bundleKey}`,
        );
      }

      return {
        itemType: "bundle" as const,
        bundleKey,
        displayName: bundle.name,
        productKey,
        productName: getProductName(productKey),
        coverageLeagueKeys: bundle.leagueKeys,
        coverageCount: bundle.competitionCount,
        unresolvedCoverageCount: bundle.unresolvedComponents.length,
        reviewFlag: bundle.reviewFlag,
        unitAmountCents: product.priceCents,
      };
    }

    const { leagueKey, productKey } = item;

    if (seenLeagueKeys.has(leagueKey)) {
      throw new Error(
        `Choose only one product tier for league key: ${leagueKey}`,
      );
    }

    seenLeagueKeys.add(leagueKey);

    const coveringBundleKey = bundleCoveredLeagueKeys.get(leagueKey);

    if (coveringBundleKey) {
      throw new Error(
        `League key "${leagueKey}" is already covered by bundle key: ${coveringBundleKey}`,
      );
    }

    const league = catalog.leagueByKey.get(leagueKey);

    if (!league) {
      throw new Error(`Unknown league key: ${leagueKey}`);
    }

    const pricing = catalog.pricingByLeagueKey.get(leagueKey);

    if (!pricing) {
      throw new Error(`No price configured for league key: ${leagueKey}`);
    }

    const product = pricing.products[productKey];

    if (!product) {
      throw new Error(
        `No product "${productKey}" configured for league key: ${leagueKey}`,
      );
    }

    const group = catalog.groupByKey.get(pricing.groupKey);

    if (!group) {
      throw new Error(
        `Unknown group key "${pricing.groupKey}" for league key: ${leagueKey}`,
      );
    }

    return {
      itemType: "league" as const,
      leagueKey,
      displayName: league.label,
      productKey,
      productName: getProductName(productKey),
      groupKey: group.key,
      groupLabel: group.label,
      unitAmountCents: product.priceCents,
    };
  });

  const subtotalCents = lineItems.reduce(
    (sum, item) => sum + item.unitAmountCents,
    0,
  );

  return {
    currency: "usd",
    selectedCount: lineItems.length,
    subtotalCents,
    totalCents: subtotalCents,
    lineItems,
  };
}
