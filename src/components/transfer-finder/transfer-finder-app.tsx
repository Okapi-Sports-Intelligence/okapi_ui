"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Search, SlidersHorizontal, Star } from "lucide-react";
import { useMemo, useState } from "react";

import type {
  TransferFinderPlayer,
  TransferFinderTier,
} from "@/components/transfer-finder/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";

type TransferFinderAppProps = {
  players: TransferFinderPlayer[];
};

type ProfileMetric = [label: string, value: number];
type BillingPeriod = "monthly" | "annual";

const tierCopy: Record<
  TransferFinderTier,
  {
    name: string;
    monthlyPrice: string;
    annualPrice: string;
    effectiveMonthly: string;
    positioning: string;
    question: string;
    workflow: string;
    output: string;
    bestFor: string;
    description: string;
    cta: string;
    badge?: string;
    includes: string[];
    exclusions: string;
  }
> = {
  search: {
    name: "Player Search",
    monthlyPrice: "$149/mo",
    annualPrice: "$1,490/yr",
    effectiveMonthly: "$124/mo",
    positioning: "Known-player lookup",
    question: "What do you know about this player?",
    workflow: "Search by name",
    output: "Player profile",
    bestFor: "Checking players you already know.",
    description:
      "Search any player by name and view their ratings, metrics, visual summaries, and profile context.",
    cta: "Choose Player Search",
    includes: [
      "Search any player by name",
      "Player ratings and metrics",
      "Visual profile pages",
      "1 user included",
    ],
    exclusions: "No advanced querying, shortlist generation, or team-fit logic.",
  },
  advanced: {
    name: "Advanced Filters",
    monthlyPrice: "$399/mo",
    annualPrice: "$3,990/yr",
    effectiveMonthly: "$333/mo",
    positioning: "Global shortlist builder",
    question: "Who matches this profile?",
    workflow: "Advanced query",
    output: "Ranked shortlist",
    bestFor: "Finding players who match a specific recruitment profile.",
    description:
      "Describe the type of player you need and build ranked shortlists using age, value, position, archetype, league, and market filters.",
    cta: "Choose Advanced Filters",
    badge: "Most popular",
    includes: [
      "Everything in Player Search",
      "Natural-language search",
      "Structured filters and archetypes",
      "Saved searches and shortlists",
    ],
    exclusions: "No fit-to-my-team ranking, roster gap diagnosis, or chemistry model.",
  },
  teamReport: {
    name: "Team Transfer Report",
    monthlyPrice: "$1,499/mo",
    annualPrice: "$14,990/yr",
    effectiveMonthly: "$1,249/mo",
    positioning: "Team-fit target generation",
    question: "Who should our team sign?",
    workflow: "Configure team profile",
    output: "Team-specific target board",
    bestFor: "Clubs that want target recommendations specific to their squad.",
    description:
      "Configure your team and generate transfer targets ranked by roster fit, playstyle fit, chemistry, role need, and budget suitability.",
    cta: "Choose Team Transfer Report",
    includes: [
      "Everything in Advanced Filters",
      "One configured team profile",
      "Roster needs model",
      "Monthly team model refresh",
      "3 users included",
    ],
    exclusions:
      "Additional teams, custom analyst-written reports, and private-data integrations are priced separately.",
  },
};

const attackerPositions = new Set(["CA", "AM", "WA"]);
const defenderPositions = new Set(["DM", "CD", "WD"]);

function formatValue(value: number): string {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }

  return `$${Math.round(value / 1_000)}K`;
}

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function getRosterFit(player: TransferFinderPlayer): number {
  return Math.min(
    99,
    Math.max(
      62,
      Math.round(
        player.rating * 0.58 +
          player.metrics.offensiveIndex * 18 +
          player.metrics.defensiveIndex * 12 +
          (player.age <= 26 ? 10 : player.age <= 30 ? 6 : 2),
      ),
    ),
  );
}

function getFitBreakdown(player: TransferFinderPlayer) {
  const rosterFit = getRosterFit(player);

  return [
    ["Playstyle fit", Math.min(99, rosterFit + 1)],
    ["Role fit", Math.min(99, Math.round(player.rating * 0.8 + 18))],
    ["Chemistry fit", Math.min(96, 72 + Math.round(player.metrics.offensiveIndex * 22))],
    ["Roster need", Math.min(98, rosterFit + (["AM", "WA", "CA"].includes(player.position) ? 2 : -1))],
    ["Budget fit", Math.max(54, 96 - Math.round(player.marketValueUsd / 2_500_000))],
    ["Risk", Math.max(18, Math.min(82, 100 - rosterFit + (player.age > 30 ? 18 : 6)))],
  ] as const;
}

export function TransferFinderApp({ players }: TransferFinderAppProps) {
  const [tier, setTier] = useState<TransferFinderTier>("search");
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("monthly");
  const [searchQuery, setSearchQuery] = useState("");
  const [position, setPosition] = useState("all");
  const [archetype, setArchetype] = useState("all");
  const [maxAge, setMaxAge] = useState(27);
  const [maxValue, setMaxValue] = useState(120_000_000);
  const [selectedPlayerId, setSelectedPlayerId] = useState(players[0]?.id);

  const positions = useMemo(
    () =>
      Array.from(new Set(players.map((player) => player.position))).sort(
        (a, b) => a.localeCompare(b),
      ),
    [players],
  );
  const archetypes = useMemo(
    () =>
      Array.from(new Set(players.map((player) => player.archetype))).sort(
        (a, b) => a.localeCompare(b),
      ),
    [players],
  );
  const visiblePlayers = useMemo(() => {
    const query = normalize(searchQuery);

    return players
      .filter((player) => {
        const matchesSearch =
          !query ||
          normalize(
            `${player.name} ${player.club} ${player.league} ${player.positionLabel} ${player.archetype}`,
          ).includes(query);

        if (!matchesSearch) {
          return false;
        }

        if (tier === "search" || tier === "teamReport") {
          return true;
        }

        return (
          (position === "all" || player.position === position) &&
          (archetype === "all" || player.archetype === archetype) &&
          player.age <= maxAge &&
          player.marketValueUsd <= maxValue
        );
      })
      .sort((a, b) =>
        tier === "teamReport"
          ? getRosterFit(b) - getRosterFit(a) || b.rating - a.rating
          : b.rating - a.rating,
      )
      .slice(0, 60);
  }, [archetype, maxAge, maxValue, players, position, searchQuery, tier]);
  const selectedPlayer =
    visiblePlayers.find((player) => player.id === selectedPlayerId) ??
    visiblePlayers[0] ??
    players[0];

  return (
    <main className="min-h-screen bg-[#f7f8f5]">
      <header className="border-b border-slate-200 bg-white">
        <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-5 px-6 py-8 lg:flex-row lg:items-end lg:justify-between">
          <Link href="/" aria-label="Return to Okapi home" className="absolute right-6 top-6 hidden md:block">
            <Image
              src="/okapi-logo.png"
              alt="Okapi Sports Intelligence"
              width={180}
              height={69}
              priority
              className="h-auto w-40 opacity-90 lg:w-44"
            />
          </Link>
          <div>
            <p className="text-sm font-medium text-emerald-900">Okapi Data</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-zinc-950">
              Transfer Finder
            </h1>
            <p className="mt-4 max-w-3xl pr-0 text-[15px] leading-7 text-slate-600 md:pr-44 lg:pr-0">
              Search known players, build global shortlists, or generate
              team-specific transfer targets. Choose the workflow that matches
              your recruitment question: look up a player, find players by
              criteria, or rank targets by roster fit.
            </p>
            <p className="mt-3 text-sm font-semibold text-slate-700">
              Three subscription tiers. Each tier unlocks a deeper transfer
              workflow.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="rounded-md border border-slate-200 bg-[#f7f8f5] px-3 py-2">
              <p className="text-slate-500">Lookup</p>
              <p className="mt-1 font-semibold text-zinc-950">Player search</p>
            </div>
            <div className="rounded-md border border-slate-200 bg-[#f7f8f5] px-3 py-2">
              <p className="text-slate-500">Discovery</p>
              <p className="mt-1 font-semibold text-zinc-950">Filters</p>
            </div>
            <div className="rounded-md border border-slate-200 bg-[#f7f8f5] px-3 py-2">
              <p className="text-slate-500">Club mode</p>
              <p className="mt-1 font-semibold text-zinc-950">Roster fit</p>
            </div>
          </div>
        </div>
      </header>

      <section className="mx-auto grid w-full max-w-7xl gap-6 px-6 py-6 lg:grid-cols-[280px_minmax(0,1fr)_360px]">
        <aside className="grid gap-4 lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-md border border-slate-200 bg-white p-3">
            <div className="grid grid-cols-2 rounded-md bg-slate-100 p-1 text-sm">
              {(["monthly", "annual"] as BillingPeriod[]).map((period) => (
                <button
                  key={period}
                  type="button"
                  onClick={() => setBillingPeriod(period)}
                  className={cn(
                    "h-9 rounded px-3 font-medium capitalize",
                    billingPeriod === period
                      ? "bg-white text-emerald-950 shadow-sm"
                      : "text-slate-600",
                  )}
                >
                  {period}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              Annual plans are priced as 10 months for 12.
            </p>
          </div>
          {(Object.keys(tierCopy) as TransferFinderTier[]).map((tierKey) => (
            <button
              key={tierKey}
              type="button"
              onClick={() => {
                setTier(tierKey);
                setSearchQuery("");
              }}
              className={cn(
                "rounded-md border bg-white p-4 text-left transition-colors",
                tier === tierKey
                  ? "border-emerald-900 ring-1 ring-emerald-900/15"
                  : "border-slate-200 hover:border-emerald-900",
              )}
            >
              <span className="block">
                <span className="flex items-start justify-between gap-3">
                  <span>
                    <span className="block text-sm font-semibold text-zinc-950">
                      {tierCopy[tierKey].name}
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-slate-600">
                      {tierCopy[tierKey].positioning}
                    </span>
                  </span>
                  {tierCopy[tierKey].badge ? (
                    <span className="rounded bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-900">
                      {tierCopy[tierKey].badge}
                    </span>
                  ) : null}
                </span>
                <span className="mt-3 grid gap-1 border-t border-slate-100 pt-3">
                  <span className="font-mono text-lg font-semibold text-emerald-950">
                    {billingPeriod === "monthly"
                      ? tierCopy[tierKey].monthlyPrice
                      : tierCopy[tierKey].annualPrice}
                  </span>
                  {billingPeriod === "annual" ? (
                    <span className="text-[11px] text-slate-500">
                      {tierCopy[tierKey].effectiveMonthly} effective monthly
                    </span>
                  ) : null}
                  <span className="text-xs leading-5 text-slate-600">
                    {tierCopy[tierKey].description}
                  </span>
                  <span className="grid gap-1 text-[11px] leading-5 text-slate-500">
                    {tierCopy[tierKey].includes.slice(0, 4).map((item) => (
                      <span key={item}>{item}</span>
                    ))}
                  </span>
                  <span className="text-xs font-medium text-slate-700">
                    Best for: {tierCopy[tierKey].bestFor}
                  </span>
                  <span className="mt-1 rounded-md bg-slate-50 px-3 py-2 text-center text-xs font-semibold text-emerald-950">
                    {tierCopy[tierKey].cta}
                  </span>
                </span>
              </span>
            </button>
          ))}
          <div className="rounded-md border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-zinc-950">
              Plan limits
            </p>
            <div className="mt-2 grid gap-2 text-xs leading-5 text-slate-600">
              <p>Player Search: 1 user included.</p>
              <p>Advanced Filters: extra seats at $99/month.</p>
              <p>Team Transfer Report: 1 configured team, 3 users included.</p>
              <p>Additional team profile: $499/month or $4,990/year.</p>
            </div>
          </div>
        </aside>

        <section className="min-w-0">
          <div className="rounded-md border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2">
              {tier === "search" ? (
                <Search aria-hidden="true" className="size-5 text-emerald-900" />
              ) : (
                <SlidersHorizontal aria-hidden="true" className="size-5 text-emerald-900" />
              )}
              <h2 className="text-lg font-semibold text-zinc-950">
                {tier === "teamReport"
                  ? "Generate a team-fit target board"
                  : tier === "advanced"
                    ? "Build a global shortlist"
                    : "Look up a known player"}
              </h2>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {tier === "teamReport"
                ? "Configure your team and recruitment needs. Targets are ranked by roster fit rather than overall rating."
                : tier === "advanced"
                  ? "Search by role, archetype, age, value, position, league, and market. Results are sorted by overall rating."
                  : "Search by name to view player ratings, metrics, visual summaries, and profile context."}
            </p>

            {tier === "teamReport" ? (
              <div className="mt-4 grid gap-3">
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="grid gap-1 text-sm">
                    <span className="font-medium text-slate-700">Club</span>
                    <Input value="Al Hilal" readOnly />
                  </label>
                  <label className="grid gap-1 text-sm">
                    <span className="font-medium text-slate-700">
                      Roster need
                    </span>
                    <select className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm">
                      <option>Creative attacking midfielder</option>
                      <option>Wide creator</option>
                      <option>Ball-progressing fullback</option>
                      <option>Defensive midfielder</option>
                    </select>
                  </label>
                  <label className="grid gap-1 text-sm">
                    <span className="font-medium text-slate-700">
                      Transfer budget
                    </span>
                    <select className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm">
                      <option>$10M to $80M</option>
                      <option>Under $5M</option>
                      <option>$5M to $20M</option>
                      <option>$20M+</option>
                    </select>
                  </label>
                  <label className="grid gap-1 text-sm">
                    <span className="font-medium text-slate-700">
                      Target markets
                    </span>
                    <Input value="Europe, South America, Saudi Pro League" readOnly />
                  </label>
                </div>
                <div className="rounded-md border border-emerald-100 bg-emerald-50 p-3">
                  <p className="text-sm font-semibold text-emerald-950">
                    Configured team profile
                  </p>
                  <p className="mt-1 text-sm leading-6 text-emerald-950/80">
                    Ranks players by roster gap, playstyle fit, chemistry/role
                    fit, and transfer target relevance rather than overall
                    rating alone.
                  </p>
                  <Button className="mt-3">
                    Generate target board
                    <ArrowRight aria-hidden="true" className="size-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mt-4">
                <Input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder={
                    tier === "advanced"
                      ? "U25 orchestrator midfielder, under $5m, Belgium or Portugal"
                      : "Search Bruno Fernandes, Rayan Cherki, Alex Scott..."
                  }
                />
              </div>
            )}

            {tier === "advanced" ? (
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <label className="grid gap-1 text-sm">
                  <span className="font-medium text-slate-700">Position</span>
                  <select
                    value={position}
                    onChange={(event) => setPosition(event.target.value)}
                    className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm"
                  >
                    <option value="all">Any position</option>
                    {positions.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-1 text-sm">
                  <span className="font-medium text-slate-700">Archetype</span>
                  <select
                    value={archetype}
                    onChange={(event) => setArchetype(event.target.value)}
                    className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm"
                  >
                    <option value="all">Any archetype</option>
                    {archetypes.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-1 text-sm">
                  <span className="font-medium text-slate-700">
                    Max age: {maxAge}
                  </span>
                  <input
                    type="range"
                    min="18"
                    max="35"
                    value={maxAge}
                    onChange={(event) => setMaxAge(Number(event.target.value))}
                  />
                </label>
                <label className="grid gap-1 text-sm">
                  <span className="font-medium text-slate-700">
                    Max value: {formatValue(maxValue)}
                  </span>
                  <input
                    type="range"
                    min="1000000"
                    max="80000000"
                    step="1000000"
                    value={maxValue}
                    onChange={(event) => setMaxValue(Number(event.target.value))}
                  />
                </label>
              </div>
            ) : null}
          </div>

          <div className="mt-4 overflow-hidden rounded-md border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-zinc-950">
                  {tier === "teamReport"
                    ? `${visiblePlayers.length} transfer targets`
                    : `${visiblePlayers.length} players found`}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {tier === "teamReport"
                    ? "Transfer targets sorted by roster fit."
                    : tier === "advanced"
                      ? "Matching players sorted by overall rating."
                      : "Matching players sorted by rating."}
                </p>
              </div>
              <p className="text-xs text-slate-500">
                {tier === "teamReport" ? "Sorted by roster fit" : "Sorted by rating"}
              </p>
            </div>
            <div className="max-h-[680px] overflow-auto">
              {visiblePlayers.map((player) => (
                <button
                  key={player.id}
                  type="button"
                  onClick={() => setSelectedPlayerId(player.id)}
                  className={cn(
                    "grid w-full grid-cols-[minmax(0,1fr)_auto] gap-4 border-b border-slate-100 px-4 py-3 text-left last:border-b-0 hover:bg-slate-50",
                    selectedPlayer?.id === player.id && "bg-emerald-50",
                  )}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-zinc-950">
                      {player.name}
                    </span>
                    <span className="mt-1 block truncate text-xs text-slate-500">
                      {player.club} · {player.positionLabel} · {player.age}
                    </span>
                    <span className="mt-2 flex flex-wrap gap-1.5">
                      <Badge>{player.archetype}</Badge>
                      <Badge>{formatValue(player.marketValueUsd)}</Badge>
                    </span>
                  </span>
                  <span className="text-right">
                    <span className="font-mono text-base font-semibold text-zinc-950">
                      {tier === "teamReport"
                        ? getRosterFit(player)
                        : player.rating.toFixed(1)}
                    </span>
                    <span className="block text-xs text-slate-500">
                      {tier === "teamReport" ? "Fit" : "Rating"}
                    </span>
                    {tier === "teamReport" ? (
                      <span className="mt-2 block text-[11px] text-emerald-900">
                        {player.rating.toFixed(1)} rating
                      </span>
                    ) : null}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          {selectedPlayer ? (
            <PlayerProfile player={selectedPlayer} tier={tier} />
          ) : null}
        </aside>
      </section>
    </main>
  );
}

function PlayerProfile({
  player,
  tier,
}: {
  player: TransferFinderPlayer;
  tier: TransferFinderTier;
}) {
  const isTeamReport = tier === "teamReport";
  const isAttacker = attackerPositions.has(player.position);
  const isDefender = defenderPositions.has(player.position);
  const bars = [
    ["g+", toBarScore(player.metrics.gPlusPer90, 0.2)],
    ["VAEP", toBarScore(player.metrics.vaepPer90, 0.5)],
    ["JDI", toIndexScore(player.metrics.defensiveIndex)],
    ["xT", toBarScore(player.metrics.xtPer90, 0.35)],
    ["JOI", toIndexScore(player.metrics.offensiveIndex)],
  ] as const;
  const visualMetrics: ProfileMetric[] = isAttacker
    ? [
        ["VAEP", player.metrics.vaepPer90],
        ["g+", player.metrics.gPlusPer90],
        ["xT", player.metrics.xtPer90],
      ]
    : isDefender
      ? [
          ["JDI", player.metrics.defensiveIndex],
          ["VAEP", player.metrics.vaepPer90],
          ["g+", player.metrics.gPlusPer90],
        ]
      : [
          ["VAEP", player.metrics.vaepPer90],
          ["g+", player.metrics.gPlusPer90],
          ["xT", player.metrics.xtPer90],
        ];
  const fitBreakdown = getFitBreakdown(player);
  const rosterFit = getRosterFit(player);

  return (
    <div className="rounded-md border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-900">
            {isTeamReport ? "Target fit profile" : "Player profile"}
          </p>
          <h2 className="mt-2 text-xl font-semibold text-zinc-950">
            {player.name}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {player.club} · {player.league}
          </p>
        </div>
        <div className="rounded-md bg-emerald-50 px-3 py-2 text-right">
          <p className="font-mono text-xl font-semibold text-emerald-950">
            {isTeamReport ? rosterFit : player.rating.toFixed(1)}
          </p>
          <p className="text-xs text-emerald-900">
            {isTeamReport ? "Roster Fit" : "Rating"}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <Metric label="Age" value={String(player.age)} />
        <Metric label="Market value" value={formatValue(player.marketValueUsd)} />
        <Metric label="Position" value={player.position} />
        <Metric label="Archetype" value={player.archetype} />
      </div>

      <div className="mt-4 grid gap-3">
        {(isTeamReport ? fitBreakdown : bars).map(([label, value]) => (
          <div key={label}>
            <div className="flex justify-between text-xs">
              <span className="font-medium text-slate-700">{label}</span>
              <span className="font-mono text-slate-500">
                {Math.round(value)}
              </span>
            </div>
            <div className="mt-1 h-2 rounded-full bg-slate-100">
              <div
                className="h-2 rounded-full bg-emerald-800"
                style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {isTeamReport ? (
        <div className="mt-5 rounded-md bg-emerald-50 p-3">
          <p className="text-sm font-semibold text-emerald-950">
            Why he fits
          </p>
          <p className="mt-2 text-sm leading-6 text-emerald-950/80">
            Profiles as a high-fit {player.positionLabel.toLowerCase()} for
            teams needing role clarity, possession value, and stronger
            contribution in the player&apos;s core zones.
          </p>
          <div className="mt-3 grid gap-2 text-xs text-emerald-950">
            <span>Possession role · {player.archetype}</span>
            <span>Chance creation · {Math.round(toIndexScore(player.metrics.offensiveIndex))}</span>
            <span>Defensive contribution · {Math.round(toIndexScore(player.metrics.defensiveIndex))}</span>
          </div>
        </div>
      ) : null}

      <div className="mt-5 rounded-md bg-slate-50 p-3">
        <p className="flex items-center gap-2 text-sm font-semibold text-zinc-950">
          <Star aria-hidden="true" className="size-4 text-emerald-900" />
          Visual summary
        </p>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
          {visualMetrics.map(([label, value]) => (
            <Metric key={label} label={label} value={value.toFixed(2)} />
          ))}
        </div>
      </div>

      <PlayerGraphics player={player} />

      {isTeamReport ? (
        <Button className="mt-4 w-full">
          Add to target board
          <ArrowRight aria-hidden="true" className="size-4" />
        </Button>
      ) : tier === "advanced" ? (
        <Button className="mt-4 w-full">
          Add to shortlist
          <ArrowRight aria-hidden="true" className="size-4" />
        </Button>
      ) : (
        <p className="mt-4 rounded-md bg-emerald-50 p-3 text-sm text-emerald-950">
          Upgrade to Advanced Filters to run multi-criteria searches and build
          shortlists.
        </p>
      )}
    </div>
  );
}

function PlayerGraphics({ player }: { player: TransferFinderPlayer }) {
  const heatmapUrl = player.graphics?.heatmapUrl;
  const inferredGraphics = [
    {
      name: "Shot Map",
      description: "Finishing locations, shot quality, and chance volume.",
    },
    {
      name: "Passing Map",
      description: "Progression lanes, receiving zones, and combination habits.",
    },
    {
      name: "Role Radar",
      description: "Profile shape across attacking, creative, and defensive signals.",
    },
  ];

  return (
    <div className="mt-5 rounded-md border border-slate-200 bg-white p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-zinc-950">Graphics</h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Visual outputs for transfer planning and player comparison.
          </p>
        </div>
        <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-900">
          Preview
        </span>
      </div>

      <div className="mt-3 overflow-hidden rounded-md border border-slate-200 bg-slate-50">
        {heatmapUrl ? (
          <div>
            <div className="relative aspect-[4/3] bg-white">
              <Image
                src={heatmapUrl}
                alt={`${player.name} heatmap`}
                fill
                sizes="360px"
                className="object-contain"
              />
            </div>
            <div className="border-t border-slate-200 bg-white px-3 py-2">
              <p className="text-xs font-semibold text-zinc-950">Heatmap</p>
              <p className="mt-1 text-xs text-slate-500">
                Touch and involvement density by pitch zone.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid aspect-[4/3] place-items-center px-4 text-center">
            <div>
              <p className="text-sm font-semibold text-zinc-950">
                Visualization preview coming soon
              </p>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                Pitch-location tendencies and activity zones will appear here
                when source files are connected.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 grid gap-2">
        {inferredGraphics.map((graphic) => (
          <div
            key={graphic.name}
            className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-3 py-2"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-zinc-950">
                  {graphic.name}
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {graphic.description}
                </p>
              </div>
              <span className="shrink-0 rounded bg-white px-2 py-1 text-[11px] font-medium text-slate-500">
                Model-derived
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function toBarScore(value: number, scale: number): number {
  return Math.min(100, Math.max(0, 50 + (value / scale) * 50));
}

function toIndexScore(value: number): number {
  return Math.min(100, Math.max(0, value * 100));
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-white px-3 py-2">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 truncate font-medium text-zinc-950">{value}</p>
    </div>
  );
}
