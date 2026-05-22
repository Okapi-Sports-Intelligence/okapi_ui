import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";

type CompetitionSearchProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function CompetitionSearch({
  value,
  onChange,
  placeholder = "Search competitions, countries, or regions",
}: CompetitionSearchProps) {
  return (
    <div className="relative">
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400"
      />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="pl-9"
      />
    </div>
  );
}
