import type {
  Bundle,
  CompetitionGroup,
  League,
  PricingConfig,
} from "@/lib/product-catalog/types";

export type ProductCatalogConfig = {
  leagues: League[];
  groups: CompetitionGroup[];
  bundles: Bundle[];
  pricing: PricingConfig;
};

function findDuplicateKeys(items: { key: string }[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const item of items) {
    if (seen.has(item.key)) {
      duplicates.add(item.key);
    }

    seen.add(item.key);
  }

  return Array.from(duplicates).sort();
}

export function validateProductCatalogConfig(config: ProductCatalogConfig): void {
  const duplicateLeagueKeys = findDuplicateKeys(config.leagues);

  if (duplicateLeagueKeys.length > 0) {
    throw new Error(
      `Duplicate league keys configured: ${duplicateLeagueKeys.join(", ")}`,
    );
  }

  const duplicateGroupKeys = findDuplicateKeys(config.groups);

  if (duplicateGroupKeys.length > 0) {
    throw new Error(
      `Duplicate competition group keys configured: ${duplicateGroupKeys.join(
        ", ",
      )}`,
    );
  }

  const duplicateBundleKeys = findDuplicateKeys(config.bundles);

  if (duplicateBundleKeys.length > 0) {
    throw new Error(
      `Duplicate bundle keys configured: ${duplicateBundleKeys.join(", ")}`,
    );
  }

  const leagueKeys = new Set(config.leagues.map((league) => league.key));
  const groupKeys = new Set(config.groups.map((group) => group.key));

  for (const group of config.groups) {
    for (const leagueKey of group.leagues) {
      if (!leagueKeys.has(leagueKey)) {
        throw new Error(
          `Competition group "${group.key}" references unknown league key: ${leagueKey}`,
        );
      }
    }
  }

  for (const bundle of config.bundles) {
    const seenBundleLeagueKeys = new Set<string>();

    for (const leagueKey of bundle.leagueKeys) {
      if (!leagueKeys.has(leagueKey)) {
        throw new Error(
          `Bundle "${bundle.key}" references unknown league key: ${leagueKey}`,
        );
      }

      if (seenBundleLeagueKeys.has(leagueKey)) {
        throw new Error(
          `Bundle "${bundle.key}" contains duplicate league key: ${leagueKey}`,
        );
      }

      seenBundleLeagueKeys.add(leagueKey);
    }

    const workbookPrice = bundle.products.workbook.priceCents;
    const intelligencePackPrice = bundle.products.intelligencePack.priceCents;
    const teamAnalysisPrice = bundle.products.teamAnalysis.priceCents;

    if (intelligencePackPrice < workbookPrice) {
      throw new Error(
        `Intelligence Pack price for bundle "${bundle.key}" must be greater than or equal to workbook price.`,
      );
    }

    if (teamAnalysisPrice <= 0) {
      throw new Error(
        `Team Analysis price for bundle "${bundle.key}" must be positive.`,
      );
    }
  }

  for (const [leagueKey, pricing] of Object.entries(config.pricing)) {
    if (!leagueKeys.has(leagueKey)) {
      throw new Error(`Price configured for unknown league key: ${leagueKey}`);
    }

    if (!groupKeys.has(pricing.groupKey)) {
      throw new Error(
        `Price for league key "${leagueKey}" references unknown group key: ${pricing.groupKey}`,
      );
    }

    const workbookPrice = pricing.products.workbook.priceCents;
    const intelligencePackPrice = pricing.products.intelligencePack.priceCents;
    const teamAnalysisPrice = pricing.products.teamAnalysis.priceCents;
    const fullTeamReportPrice = pricing.products.fullTeamReport?.priceCents;
    const playerScoutingReportPrice =
      pricing.products.playerScoutingReport?.priceCents;

    if (intelligencePackPrice < workbookPrice) {
      throw new Error(
        `Intelligence Pack price for league key "${leagueKey}" must be greater than or equal to workbook price.`,
      );
    }

    if (teamAnalysisPrice <= 0) {
      throw new Error(
        `Team Analysis price for league key "${leagueKey}" must be positive.`,
      );
    }

    if (fullTeamReportPrice !== undefined) {
      if (fullTeamReportPrice <= 0) {
        throw new Error(
          `Full Team Report price for league key "${leagueKey}" must be positive.`,
        );
      }

      if (fullTeamReportPrice < teamAnalysisPrice) {
        throw new Error(
          `Full Team Report price for league key "${leagueKey}" must be greater than or equal to Team Analysis price.`,
        );
      }
    }

    if (playerScoutingReportPrice !== undefined) {
      if (playerScoutingReportPrice <= 0) {
        throw new Error(
          `Player Scouting Report price for league key "${leagueKey}" must be positive.`,
        );
      }

      if (playerScoutingReportPrice < intelligencePackPrice) {
        throw new Error(
          `Player Scouting Report price for league key "${leagueKey}" must be greater than or equal to Intelligence Pack price.`,
        );
      }
    }
  }
}
