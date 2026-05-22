import { LeagueCheckoutApp } from "@/components/league-checkout/league-checkout-app";
import type {
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
  const badges = ["Team package"];

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

  if (groupLabel.startsWith("NCAA")) {
    badges.push("College");
  }

  return badges.slice(0, 3);
}

export default function TeamAnalysisPage() {
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
            name: "Competition Intelligence Workbook",
            shortName: "Workbook",
            description: "Scouting workbook for a single competition.",
            priceCents: pricing.products.workbook.priceCents,
          },
          intelligencePack: {
            key: "intelligencePack",
            name: "Intelligence Pack",
            shortName: "Pack",
            description:
              "Workbook plus player visualization files to help judge potential recruits.",
            priceCents: pricing.products.intelligencePack.priceCents,
          },
          teamAnalysis: {
            key: "teamAnalysis",
            name: "Team Intelligence Package",
            shortName: "Team",
            description:
              "Team profiles, rankings, tactical benchmarks, playstyle visuals, and comparison tools for every team in this competition.",
            priceCents: pricing.products.teamAnalysis.priceCents,
          },
        },
        comingSoonProducts: pricing.products.fullTeamReport
          ? [
              {
                key: "fullTeamReport",
                name: "Full Team Report",
                shortName: "Report",
                description:
                  "A written tactical report with scout-style analysis of team structure, tendencies, strengths, weaknesses, and player-role patterns.",
                priceCents: pricing.products.fullTeamReport.priceCents,
              },
            ]
          : undefined,
      });
    }

    leagues.push(
      ...groupLeagues.sort(
        (a, b) =>
          b.products.teamAnalysis!.priceCents -
            a.products.teamAnalysis!.priceCents ||
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

  return (
    <LeagueCheckoutApp
      bundles={[]}
      groups={groups}
      leagues={leagues}
      selectionMode="singleLeague"
      title="Browse Team Intelligence"
      description="Choose one league or competition and receive team-level intelligence for every team in it. Compare tactical style, performance, strengths, weaknesses, and competitive context across the full competition."
      supportingText="Built for coaches, analysts, opposition scouts, sporting departments, and market evaluators."
      showBundles={false}
      catalogCardTitle="Team Intelligence Package"
      catalogCardDescription="One active package per competition. Select a league and receive team profiles, rankings, tactical benchmarks, playstyle visuals, and comparison tools for every team in that competition."
      includedOutputs={[
        "Team profiles",
        "Team rankings",
        "Tactical benchmarks",
        "Playstyle visuals",
        "Comparison tools",
        "Full reports coming soon",
      ]}
      visibleProductKeys={["teamAnalysis"]}
      primaryPriceProductKey="teamAnalysis"
      secondaryPriceProductKey={undefined}
      sidebarTitle="Browse catalog"
      searchPlaceholder="Search MLS, Bundesliga, Poland, Brazil, NCAA..."
      catalogSearchTitle="Find a league or competition"
      catalogSearchDescription="Search by league, country, region, or market."
      sortLabel="Sorted by Team Intelligence price"
      summaryStats={[
        { label: "Package type", value: 1 },
        { label: "Competitions", value: leagues.length },
        { label: "Markets", value: groups.length },
      ]}
      allCatalogTitle="Available leagues"
      catalogCountNoun="competitions"
      catalogCountSuffix="available"
      individualSectionTitle="Available competitions"
      rowValueCopy="Team profiles · playstyle rankings · tactical benchmarks · comparison tools"
      rowActionLabel="Select league"
      rowExpandedLabel="Hide details"
      productChooseLabel="Select this league"
      workflowSteps={[
        {
          title: "Choose a competition",
          description: "Search or browse the league you want to analyze.",
        },
        {
          title: "Review the package",
          description: "Each competition has one active Team Intelligence package.",
        },
        {
          title: "Checkout",
          description:
            "Receive team profiles, rankings, tactical benchmarks, and comparison tools.",
        },
      ]}
      orderSummaryTitle="Selected Team Intelligence"
      orderSummaryEmptyTitle="No league selected yet."
      orderSummaryEmptyDescription="Choose one league or competition to add Team Intelligence to your order."
      orderSummaryIncludedItems={[
        "Team profiles",
        "Team rankings",
        "Tactical benchmarks",
        "Playstyle visuals",
        "Comparison tools for every team",
      ]}
      orderSummarySelectedExplainer="Includes team profiles, tactical benchmarks, playstyle rankings, and comparison tools. Full written team reports are planned as a premium upgrade."
      orderSummarySelectedNounSingular="league"
      orderSummarySelectedNounPlural="leagues"
      orderSummaryLeagueDescription="Every team in this competition"
      orderSummaryCheckoutLabel="Continue with selected league"
    />
  );
}
