export type TransferFinderTier = "search" | "advanced" | "teamReport";

export type TransferFinderPlayer = {
  id: string;
  name: string;
  club: string;
  league: string;
  position: string;
  positionLabel: string;
  age: number;
  marketValueUsd: number;
  archetype: string;
  rating: number;
  rank: number;
  games: number;
  minutes: number;
  metrics: {
    totalVaep: number;
    defensiveIndex: number;
    offensiveIndex: number;
    gPlusAdded: number;
    xtTotal: number;
    goalsPer90: number;
    assistsPer90: number;
    xgPer90: number;
    vaepPer90: number;
    gPlusPer90: number;
    xtPer90: number;
  };
  graphics?: {
    heatmapUrl?: string;
  };
};
