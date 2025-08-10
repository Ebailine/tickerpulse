// src/app/lib/tickers.ts

// Quick built-ins for common names (useful during cold start)
export const TICKER_TO_CIK: Record<string, string> = {
  AAPL: "0000320193",
  MSFT: "0000789019",
  GOOGL: "0001652044",
  AMZN: "0001018724",
  TSLA: "0001318605",
  NVDA: "0001045810",
  META: "0001326801",
  AMD: "0000002488",
};

// Cache for resolved tickers in the current runtime
declare global {
  // eslint-disable-next-line no-var
  var __tp_cikCache: Map<string, string> | undefined;
}
const cache = (globalThis.__tp_cikCache ||= new Map<string, string>());

// Left-pad numeric CIK to 10 chars
function padCIK(x: number | string): string {
  const s = String(x).replace(/\D+/g, "");
  return s.padStart(10, "0");
}

/**
 * Resolve a single ticker to a 10-char CIK.
 * 1) check runtime cache
 * 2) check built-in map
 * 3) fetch SEC master list and cache all tickers
 */
export async function resolveCik(ticker: string): Promise<string | null> {
  const key = ticker.trim().toUpperCase();
  if (!key) return null;

  // cache hit?
  const hit = cache.get(key);
  if (hit) return hit;

  // built-in map?
  const builtIn = TICKER_TO_CIK[key];
  if (builtIn) {
    cache.set(key, builtIn);
    return builtIn;
  }

  // fetch SEC master JSON (updated by SEC)
  // shape: { "0": { cik_str: 320193, ticker: "AAPL", title: "Apple Inc." }, ... }
  try {
    const res = await fetch("https://www.sec.gov/files/company_tickers.json", {
      headers: {
        "User-Agent": "TickerPulse/1.0 (contact: emb486@drexel.edu)",
        "Accept": "application/json",
      },
      // tiny timeout safety on edge runtimes
      next: { revalidate: 60 * 60 }, // cache for 1h across builds
    });

    if (!res.ok) return null;

    const data = (await res.json()) as Record<
      string,
      { cik_str: number; ticker: string; title: string }
    >;

    // load all into cache
    for (const k in data) {
      const row = data[k];
      const t = row.ticker?.toUpperCase();
      if (t) cache.set(t, padCIK(row.cik_str));
    }

    return cache.get(key) || null;
  } catch {
    return null;
  }
}

/** Resolve many tickers at once */
export async function resolveCiks(tickers: string[]): Promise<Record<string, string | null>> {
  const out: Record<string, string | null> = {};
  for (const t of tickers) {
    out[t] = await resolveCik(t);
  }
  return out;
}
