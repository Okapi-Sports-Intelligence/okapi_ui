import { Badge } from "@/components/ui/badge";
import type { PurchasableGroup } from "@/components/league-checkout/types";
import { cn } from "@/lib/utils/cn";

type CompetitionGroupSidebarProps = {
  groups: PurchasableGroup[];
  activeGroupKey: string;
  totalCount: number;
  title?: string;
  onSelectGroup: (groupKey: string) => void;
};

export function CompetitionGroupSidebar({
  groups,
  activeGroupKey,
  totalCount,
  title = "Browse by market",
  onSelectGroup,
}: CompetitionGroupSidebarProps) {
  const allItem = { key: "all", label: "All competitions", count: totalCount };
  const regionGroupKeys = new Set([
    "Concacaf",
    "East Asia & Oceania",
    "Eastern Europe",
    "Middle East, Africa, India",
    "South America",
    "Southern Europe",
    "Western Europe",
  ]);
  const collegeGroupKeys = new Set(["NCAA (Men)", "NCAA (Women)"]);
  const segmentGroupKeys = new Set(["Women's", "Youth"]);
  const sections = [
    {
      title: "Regions",
      groups: groups.filter((group) => regionGroupKeys.has(group.key)),
    },
    {
      title: "College",
      groups: groups.filter((group) => collegeGroupKeys.has(group.key)),
    },
    {
      title: "Segments",
      groups: groups.filter((group) => segmentGroupKeys.has(group.key)),
    },
    {
      title: "Other",
      groups: groups.filter(
        (group) =>
          !regionGroupKeys.has(group.key) &&
          !collegeGroupKeys.has(group.key) &&
          !segmentGroupKeys.has(group.key),
      ),
    },
  ].filter((section) => section.groups.length > 0);

  function renderGroupButton(group: PurchasableGroup) {
    const isActive = group.key === activeGroupKey;

    return (
      <button
        key={group.key}
        type="button"
        onClick={() => onSelectGroup(group.key)}
        className={cn(
          "flex min-h-10 w-full items-center justify-between gap-3 rounded-md border-l-2 px-3 py-2 text-left text-sm transition-colors",
          isActive
            ? "border-emerald-900 bg-emerald-50 text-emerald-950"
            : "border-transparent text-slate-700 hover:bg-slate-100",
        )}
      >
        <span className="truncate">{group.label}</span>
        <Badge
          className={cn(
            "shrink-0 font-mono",
            isActive && "bg-emerald-100 text-emerald-950",
          )}
        >
          {group.count}
        </Badge>
      </button>
    );
  }

  return (
    <nav aria-label="Competition markets" className="grid gap-3">
      <p className="px-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
        {title}
      </p>
      <div className="grid gap-1">
        {renderGroupButton(allItem)}
      </div>
      {sections.map((section) => (
        <div key={section.title} className="grid gap-1">
          <p className="px-3 pt-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            {section.title}
          </p>
          {section.groups.map(renderGroupButton)}
        </div>
      ))}
    </nav>
  );
}
