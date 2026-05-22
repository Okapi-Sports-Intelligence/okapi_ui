export type PurchasableLeague = {
  key: string;
  label: string;
  groupKey: string;
  groupLabel: string;
  metadata: string;
  badges: string[];
  products: {
    workbook: PurchasableProduct;
    intelligencePack: PurchasableProduct;
    teamAnalysis?: PurchasableProduct;
  };
  comingSoonProducts?: ComingSoonProduct[];
  rowDescription?: string;
};

export type PurchasableBundle = {
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
  leagueKeys: string[];
  previewLeagues: {
    key: string;
    label: string;
  }[];
  unresolvedCoverageCount: number;
  products: {
    workbook: PurchasableProduct;
    intelligencePack: PurchasableProduct;
    teamAnalysis?: PurchasableProduct;
  };
  comingSoonProducts?: ComingSoonProduct[];
};

export type PurchasableGroup = {
  key: string;
  label: string;
  count: number;
};

export type ProductKey = "workbook" | "intelligencePack" | "teamAnalysis";

export type PurchasableProduct = {
  key: ProductKey;
  name: string;
  shortName: string;
  description: string;
  priceCents: number;
};

export type ComingSoonProduct = {
  key: string;
  name: string;
  shortName: string;
  description: string;
  priceCents: number;
};

export type SelectedLeagueItem = {
  itemType: "league";
  leagueKey: string;
  productKey: ProductKey;
};

export type SelectedBundleItem = {
  itemType: "bundle";
  bundleKey: string;
  productKey: ProductKey;
};

export type SelectedIntelligenceItem = SelectedLeagueItem | SelectedBundleItem;
