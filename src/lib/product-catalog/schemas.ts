import { z } from "zod";

export const leagueSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
});

export const competitionGroupSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  leagues: z.array(z.string().min(1)),
});

export const productKeySchema = z.enum([
  "workbook",
  "intelligencePack",
  "teamAnalysis",
]);

export const productPricingSchema = z.object({
  priceCents: z.number().int().positive(),
});

export const leaguePricingSchema = z.object({
  groupKey: z.string().min(1),
  products: z.object({
    workbook: productPricingSchema,
    intelligencePack: productPricingSchema,
    teamAnalysis: productPricingSchema,
    fullTeamReport: productPricingSchema.optional(),
    playerScoutingReport: productPricingSchema.optional(),
  }),
});

export const bundleComponentSchema = z.object({
  sourceSheet: z.string(),
  wyscoutId: z.string(),
  competition: z.string(),
  label: z.string().min(1),
  priceMatch: z.string(),
  inclusionRule: z.string(),
  notes: z.string(),
});

export const bundleSchema = z.object({
  key: z.string().min(1),
  name: z.string().min(1),
  productType: z.string().min(1),
  buyerFit: z.string(),
  commercialNote: z.string(),
  pricingTier: z.string().min(1),
  reviewFlag: z.string(),
  competitionCount: z.number().int().positive(),
  pricedCompetitionCount: z.number().int().nonnegative(),
  unpricedCompetitionCount: z.number().int().nonnegative(),
  products: z.object({
    workbook: productPricingSchema,
    intelligencePack: productPricingSchema,
    teamAnalysis: productPricingSchema,
  }),
  leagueKeys: z.array(z.string().min(1)),
  unresolvedComponents: z.array(bundleComponentSchema),
});

export const leaguesConfigSchema = z.array(leagueSchema);
export const competitionGroupsConfigSchema = z.array(competitionGroupSchema);
export const bundlesConfigSchema = z.array(bundleSchema);
export const pricingConfigSchema = z.record(z.string().min(1), leaguePricingSchema);
