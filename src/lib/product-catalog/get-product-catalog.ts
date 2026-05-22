import "server-only";

import bundlesConfig from "@/config/product/bundles.json";
import groupsConfig from "@/config/product/competition-groups.json";
import leaguesConfig from "@/config/product/leagues.json";
import pricingConfig from "@/config/product/pricing.json";
import {
  bundlesConfigSchema,
  competitionGroupsConfigSchema,
  leaguesConfigSchema,
  pricingConfigSchema,
} from "@/lib/product-catalog/schemas";
import type { ProductCatalog } from "@/lib/product-catalog/types";
import { validateProductCatalogConfig } from "@/lib/product-catalog/validate-product-catalog";

let catalog: ProductCatalog | undefined;

export function getProductCatalog(): ProductCatalog {
  if (catalog) {
    return catalog;
  }

  const leagues = leaguesConfigSchema.parse(leaguesConfig);
  const groups = competitionGroupsConfigSchema.parse(groupsConfig);
  const bundles = bundlesConfigSchema.parse(bundlesConfig);
  const pricing = pricingConfigSchema.parse(pricingConfig);

  validateProductCatalogConfig({ leagues, groups, bundles, pricing });

  catalog = {
    leagues,
    groups,
    bundles,
    pricing,
    leagueByKey: new Map(leagues.map((league) => [league.key, league])),
    groupByKey: new Map(groups.map((group) => [group.key, group])),
    bundleByKey: new Map(bundles.map((bundle) => [bundle.key, bundle])),
    pricingByLeagueKey: new Map(Object.entries(pricing)),
  };

  return catalog;
}
