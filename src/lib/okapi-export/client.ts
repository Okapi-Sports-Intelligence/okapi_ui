import "server-only";

export type OkapiExportQuoteRequest = {
  leagues: string[];
  metrics: string[];
  product?: string;
};

export type OkapiExportRequest = {
  compId?: number;
  seasonId?: number;
  metric?: string;
  format?: "json" | "csv";
};

function getOkapiBaseUrl(): string {
  return process.env.OKAPI_BASE_URL ?? "https://okapidbs.okapisi.com";
}

async function okapiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`${getOkapiBaseUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Okapi request failed with status ${response.status}.`);
  }

  return response.json() as Promise<T>;
}

export function getOkapiLeagues(): Promise<unknown> {
  return okapiFetch("/api/data-catalog/leagues");
}

export function getOkapiMetrics(): Promise<unknown> {
  return okapiFetch("/api/data-catalog/metrics");
}

export function getOkapiExportQuote(
  request: OkapiExportQuoteRequest,
): Promise<unknown> {
  return okapiFetch("/api/data-catalog/export-quote", {
    method: "POST",
    body: JSON.stringify({
      product: "workbook",
      ...request,
    }),
  });
}

export function exportOkapiData(request: OkapiExportRequest): Promise<unknown> {
  const params = new URLSearchParams();

  if (request.compId !== undefined) {
    params.set("comp_id", String(request.compId));
  }

  if (request.seasonId !== undefined) {
    params.set("season_id", String(request.seasonId));
  }

  if (request.metric) {
    params.set("metric", request.metric);
  }

  params.set("format", request.format ?? "json");

  return okapiFetch(`/export/?${params.toString()}`);
}
