import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowLeftRight, ArrowRight, Search, User, Users } from "lucide-react";

type Workflow = {
  key: string;
  badge: string;
  question: string;
  title: string;
  description: string;
  howItWorks: string;
  includes: string[];
  note: string;
  cta: string;
  href: string;
  icon: LucideIcon;
};

const workflows: Workflow[] = [
  {
    key: "player-intelligence",
    badge: "Buy by competition or bundle",
    question: "Who are the best players in this league or market?",
    title: "Player Intelligence",
    description:
      "Buy ready-to-use player intelligence for individual competitions or curated scouting bundles.",
    howItWorks:
      "Choose competitions or bundles, then select the reporting level you need.",
    includes: [
      "Player ratings",
      "Rankings",
      "Archetypes",
      "Player visuals",
      "Competition context",
      "Full reports coming soon",
    ],
    note:
      "Best for recruitment teams, agents, scouts, and analysts who already know which leagues or markets they want to evaluate.",
    cta: "Browse player competitions",
    href: "/player-analysis",
    icon: User,
  },
  {
    key: "team-intelligence",
    badge: "Buy one league",
    question: "How do teams in this league actually play?",
    title: "Team Intelligence",
    description:
      "Get tactical and performance intelligence on every team in a selected league.",
    howItWorks:
      "Choose one league and receive team profiles, rankings, playstyle benchmarks, and comparison tools.",
    includes: [
      "Team profiles",
      "Team rankings",
      "Tactical benchmarks",
      "Playstyle visuals",
      "Comparison tools",
      "Full reports coming soon",
    ],
    note:
      "Best for coaches, analysts, opposition scouts, and clubs evaluating tactical context inside a specific league.",
    cta: "Browse team leagues",
    href: "/team-analysis",
    icon: Users,
  },
  {
    key: "transfer-finder",
    badge: "Subscription",
    question: "Who should we recruit?",
    title: "Transfer Finder",
    description:
      "Search the global player database or generate transfer targets for your club.",
    howItWorks:
      "Choose a subscription plan: Player Search, Advanced Filters, or Team Transfer Report.",
    includes: [
      "Player lookup",
      "Advanced query tools",
      "Global shortlists",
      "Market filters",
      "Team-fit recommendations",
    ],
    note:
      "Best when you want to search across the global database instead of buying intelligence for one league or competition.",
    cta: "View Transfer Finder plans",
    href: "/transfer-finder",
    icon: ArrowLeftRight,
  },
];

const comparisonRows = [
  {
    product: "Player Intelligence",
    want:
      "Evaluate players within specific leagues, conferences, tournaments, or scouting bundles",
    purchaseType: "Per competition or bundle",
  },
  {
    product: "Team Intelligence",
    want: "Understand team style, tactics, strengths, and weaknesses within one league",
    purchaseType: "Per league",
  },
  {
    product: "Transfer Finder",
    want: "Search globally and generate transfer targets based on criteria or team fit",
    purchaseType: "Monthly or annual subscription",
  },
];

function WorkflowCard({ workflow }: { workflow: Workflow }) {
  const Icon = workflow.icon;

  return (
    <article className="flex h-full flex-col rounded-md border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-emerald-900">
      <div className="flex items-start justify-between gap-4">
        <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-950">
          {workflow.badge}
        </span>
        <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-slate-50 text-emerald-900">
          <Icon aria-hidden="true" className="size-5" />
        </span>
      </div>

      <p className="mt-5 text-lg font-semibold leading-7 text-zinc-950">
        {workflow.question}
      </p>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-950">
        {workflow.title}
      </h2>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        {workflow.description}
      </p>

      <div className="mt-5 rounded-md bg-slate-50 p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          How it works
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-700">
          {workflow.howItWorks}
        </p>
      </div>

      <div className="mt-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Includes
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {workflow.includes.map((item) => (
            <span
              key={item}
              className="rounded-md bg-[#f7f8f5] px-2 py-1 text-xs font-medium text-slate-700"
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      <p className="mt-5 text-xs leading-5 text-slate-500">{workflow.note}</p>

      <Link
        href={workflow.href}
        className="mt-auto inline-flex h-11 items-center justify-center gap-2 rounded-md bg-emerald-950 px-4 text-sm font-semibold text-white transition-colors hover:bg-emerald-900"
      >
        {workflow.cta}
        <ArrowRight aria-hidden="true" className="size-4" />
      </Link>
    </article>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f7f8f5] text-zinc-950">
      <header className="border-b border-slate-200 bg-white/85 backdrop-blur">
        <div className="mx-auto flex h-24 w-full max-w-7xl items-center justify-between px-6">
          <Link href="/" aria-label="Okapi Sports Intelligence home">
            <Image
              src="/okapi-logo.png"
              alt="Okapi Sports Intelligence"
              width={178}
              height={69}
              priority
              className="h-auto w-36 sm:w-40"
            />
          </Link>
          <nav
            aria-label="Primary navigation"
            className="hidden items-center gap-8 text-sm font-medium sm:flex"
          >
            <Link href="/" className="text-zinc-950 hover:text-emerald-900">
              Home
            </Link>
            <a href="#products" className="text-zinc-950 hover:text-emerald-900">
              Products
            </a>
            <a href="#comparison" className="text-zinc-950 hover:text-emerald-900">
              Pricing
            </a>
            <a href="mailto:hello@okapidata.com" className="text-zinc-950 hover:text-emerald-900">
              Contact
            </a>
          </nav>
        </div>
      </header>

      <section className="mx-auto w-full max-w-7xl px-6 py-14 sm:py-18">
        <div className="max-w-4xl">
          <p className="text-sm font-medium text-emerald-900">Okapi Data</p>
          <h1 className="mt-5 text-5xl font-semibold tracking-tight text-zinc-950 sm:text-6xl">
            Choose your scouting workflow.
          </h1>
          <p className="mt-7 max-w-3xl text-lg leading-8 text-slate-600">
            Select the product that matches the decision you are trying to make.
            Player and team intelligence are purchased by competition or league.
            Transfer Finder is a subscription for global player search and
            team-specific recruitment.
          </p>
          <p className="mt-5 flex items-center gap-2 text-sm font-semibold text-slate-800">
            <Search aria-hidden="true" className="size-4 text-emerald-900" />
            Start with the question you need answered.
          </p>
        </div>

        <div id="products" className="mt-12">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            What are you trying to do?
          </p>
          <div className="mt-4 grid gap-5 lg:grid-cols-3">
            {workflows.map((workflow) => (
              <WorkflowCard key={workflow.key} workflow={workflow} />
            ))}
          </div>
        </div>

        <section
          id="comparison"
          className="mt-10 rounded-md border border-slate-200 bg-white p-5"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-zinc-950">
                Compare purchase paths
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Player Intelligence buys a defined market. Team Intelligence
                buys league-wide team context. Transfer Finder searches across
                the database.
              </p>
            </div>
          </div>

          <div className="mt-5 overflow-hidden rounded-md border border-slate-200">
            <div className="hidden grid-cols-[1fr_2fr_1fr] bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 md:grid">
              <span>Choose this</span>
              <span>If you want to...</span>
              <span>Purchase type</span>
            </div>
            {comparisonRows.map((row) => (
              <div
                key={row.product}
                className="grid gap-2 border-t border-slate-200 px-4 py-4 text-sm first:border-t-0 md:grid-cols-[1fr_2fr_1fr]"
              >
                <p className="font-semibold text-zinc-950">{row.product}</p>
                <p className="text-slate-600">{row.want}</p>
                <p className="font-medium text-slate-800">{row.purchaseType}</p>
              </div>
            ))}
          </div>

          <p className="mt-4 text-sm leading-6 text-slate-600">
            Not sure where to start? Begin with Player Intelligence if you know
            the league or market, or Transfer Finder if you want to search
            globally.
          </p>
        </section>
      </section>
    </main>
  );
}
