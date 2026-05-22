import { LeagueCheckoutApp } from "@/components/league-checkout/league-checkout-app";
import type {
  PurchasableBundle,
  PurchasableGroup,
  PurchasableLeague,
} from "@/components/league-checkout/types";
import { getProductCatalog } from "@/lib/product-catalog/get-product-catalog";

function normalizeGroupLabel(label: string): string {
  if (label === "NCAA (Men)") {
    return "NCAA Men";
  }

  if (label === "NCAA (Women)") {
    return "NCAA Women";
  }

  return label;
}

function getLeagueMetadata(label: string, groupLabel: string): string {
  const parentheticalMatches = Array.from(label.matchAll(/\(([^)]+)\)/g)).map(
    (match) => match[1],
  );
  const context = parentheticalMatches
    .slice()
    .reverse()
    .find((value) => !/^level\s+\d+/i.test(value) && value !== "W");
  const level = parentheticalMatches.find((value) => /^level\s+\d+/i.test(value));
  const parts = [context, level, groupLabel].filter(Boolean);

  return parts.join(" · ");
}

function getLeagueBadges(label: string, groupLabel: string): string[] {
  const badges = ["Workbook"];

  if (
    /\b(level 1|premier|serie a|bundesliga|la liga|champions league)\b/i.test(
      label,
    )
  ) {
    badges.push("Top tier");
  }

  if (
    /\b(women|women's|\(w\)|femenina|feminin)\b/i.test(label) ||
    groupLabel === "Women's"
  ) {
    badges.push("Women's");
  }

  if (
    /\b(u17|u18|u19|u20|u21|u23|youth|junior|primavera)\b/i.test(label) ||
    groupLabel === "Youth"
  ) {
    badges.push("Youth");
  }

  if (groupLabel.startsWith("NCAA")) {
    badges.push("College");
  }

  if (
    /\b(cup|tournament|championship|play-offs|qualifier|league cup)\b/i.test(
      label,
    )
  ) {
    badges.push("Tournament");
  }

  return badges.slice(0, 3);
}

export default function PlayerAnalysisPage() {
  const catalog = getProductCatalog();
  const leagues: PurchasableLeague[] = [];

  for (const group of catalog.groups) {
    const groupLeagues: PurchasableLeague[] = [];

    for (const leagueKey of group.leagues) {
      const league = catalog.leagueByKey.get(leagueKey);
      const pricing = catalog.pricingByLeagueKey.get(leagueKey);

      if (!league || !pricing || pricing.groupKey !== group.key) {
        continue;
      }

      const groupLabel = normalizeGroupLabel(group.label);

      groupLeagues.push({
        key: league.key,
        label: league.label,
        groupKey: group.key,
        groupLabel,
        metadata: getLeagueMetadata(league.label, groupLabel),
        badges: getLeagueBadges(league.label, groupLabel),
        products: {
          workbook: {
            key: "workbook",
            name: "Workbook",
            shortName: "Workbook",
            description:
              "Best for data tables, player ratings, rankings, archetypes, and competition context.",
            priceCents: pricing.products.workbook.priceCents,
          },
          intelligencePack: {
            key: "intelligencePack",
            name: "Intelligence Pack",
            shortName: "Pack",
            description:
              "Best for visual player evaluation. Includes the Workbook plus player visualization files.",
            priceCents: pricing.products.intelligencePack.priceCents,
          },
        },
        comingSoonProducts: pricing.products.playerScoutingReport
          ? [
              {
                key: "playerScoutingReport",
                name: "Player Scouting Report",
                shortName: "Report",
            description:
                  "Written scout-style reports on every player in the selected competition. Plain-English interpretation of role, tendencies, strengths, limitations, and fit.",
                priceCents: pricing.products.playerScoutingReport.priceCents,
              },
            ]
          : undefined,
      });
    }

    leagues.push(
      ...groupLeagues.sort(
        (a, b) =>
          b.products.workbook.priceCents - a.products.workbook.priceCents ||
          a.label.localeCompare(b.label),
      ),
    );
  }

  const groups: PurchasableGroup[] = catalog.groups
    .map((group) => ({
      key: group.key,
      label: normalizeGroupLabel(group.label),
      count: leagues.filter((league) => league.groupKey === group.key).length,
    }))
    .filter((group) => group.count > 0);

  const bundles: PurchasableBundle[] = catalog.bundles.map((bundle) => ({
    key: bundle.key,
    name: bundle.name,
    productType: bundle.productType,
    buyerFit: bundle.buyerFit,
    commercialNote: bundle.commercialNote,
    pricingTier: bundle.pricingTier,
    reviewFlag: bundle.reviewFlag,
    competitionCount: bundle.competitionCount,
    pricedCompetitionCount: bundle.pricedCompetitionCount,
    unpricedCompetitionCount: bundle.unpricedCompetitionCount,
    leagueKeys: bundle.leagueKeys,
    previewLeagues: bundle.leagueKeys
      .slice(0, 12)
      .flatMap((leagueKey) => {
        const league = catalog.leagueByKey.get(leagueKey);

        if (!league) {
          return [];
        }

        return [{ key: league.key, label: league.label }];
      }),
    unresolvedCoverageCount: bundle.unresolvedComponents.length,
    products: {
      workbook: {
        key: "workbook",
        name: "Workbook",
        shortName: "Workbook",
        description:
          "Ratings, rankings, archetypes, tables, and competition context for the bundle's competitions.",
        priceCents: bundle.products.workbook.priceCents,
      },
      intelligencePack: {
        key: "intelligencePack",
        name: "Intelligence Pack",
        shortName: "Pack",
        description:
          "Bundle workbooks plus player visualization files. Best for visual player evaluation.",
        priceCents: bundle.products.intelligencePack.priceCents,
      },
    },
  }));

  return (
    <LeagueCheckoutApp
      bundles={bundles}
      groups={groups}
      leagues={leagues}
      title="Browse Player Intelligence"
      description="Buy player intelligence for the leagues, tournaments, conferences, and scouting markets you care about. Choose a single competition or a curated bundle, then select the reporting level that matches your workflow."
      supportingText="Built for recruitment, scouting, roster planning, and market analysis."
      sidebarTitle="Browse catalog"
      searchPlaceholder="Search MLS, Poland, Brazil, NCAA, Belgium..."
      catalogSearchTitle="Find player intelligence"
      catalogSearchDescription="Search by competition, country, region, conference, or market."
      workflowSteps={[
        {
          title: "Choose coverage",
          description:
            "Select an individual competition or a curated scouting bundle.",
        },
        {
          title: "Choose report level",
          description:
            "Pick Workbook, Intelligence Pack, or request Player Scouting Report access.",
        },
        {
          title: "Checkout",
          description:
            "Receive ready-to-use scouting outputs for the selected coverage.",
        },
      ]}
      reportLevels={[
        {
          title: "Workbook",
          description:
            "Player ratings, rankings, archetypes, tables, and competition context.",
        },
        {
          title: "Intelligence Pack",
          description:
            "Everything in Workbook, plus player visualization files and profile-ready scouting outputs.",
          badge: "Most popular",
        },
        {
          title: "Player Scouting Report",
          description:
            "Written scout-style reports on every player in the selected competition or bundle. Coming soon.",
          badge: "Request access",
        },
      ]}
      individualSectionTitle="Individual competitions"
      orderSummaryTitle="Selected Player Intelligence"
      orderSummaryEmptyTitle="No products selected yet."
      orderSummaryEmptyDescription="Choose a competition or bundle, then select a report level to add it to your order."
      orderSummaryIncludedItems={[
        "Player ratings, rankings, archetypes, and competition context",
        "Intelligence Packs add player visuals",
        "Bundle selections include every competition in the bundle preview",
        "Player Scouting Reports add written scout-style analysis when available",
      ]}
      orderSummarySelectedExplainer="Workbooks include player ratings, rankings, archetypes, and competition context. Intelligence Packs add player visualization files. Player Scouting Reports provide written scout-style analysis when available."
    />
  );
}
