export type League = {
  key: string;
  label: string;
};

export type CompetitionGroup = {
  key: string;
  label: string;
  leagues: string[];
};

export type ProductKey = "workbook" | "intelligencePack" | "teamAnalysis";

export type ProductPricing = {
  priceCents: number;
};

export type LeaguePricing = {
  groupKey: string;
  products: Record<ProductKey, ProductPricing> & {
    fullTeamReport?: ProductPricing;
    playerScoutingReport?: ProductPricing;
  };
};

export type PricingConfig = Record<string, LeaguePricing>;

export type BundleComponent = {
  sourceSheet: string;
  wyscoutId: string;
  competition: string;
  label: string;
  priceMatch: string;
  inclusionRule: string;
  notes: string;
};

export type Bundle = {
  key: string;
  name: string;
  productType: string;
  buyerFit: string;
  commercialNote: string;
  pricingTier: string;
  reviewFlag: string;
  competitionCount: number;
  pricedCompetitionCount: number;
  unpricedCompetitionCount: number;
  products: Record<ProductKey, ProductPricing>;
  leagueKeys: string[];
  unresolvedComponents: BundleComponent[];
};

export type ProductCatalog = {
  leagues: League[];
  groups: CompetitionGroup[];
  bundles: Bundle[];
  pricing: PricingConfig;
  leagueByKey: Map<string, League>;
  groupByKey: Map<string, CompetitionGroup>;
  bundleByKey: Map<string, Bundle>;
  pricingByLeagueKey: Map<string, LeaguePricing>;
};
