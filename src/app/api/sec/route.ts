// src/app/api/sec/route.ts
import { NextRequest, NextResponse } from "next/server";
import { parseRss } from "@/app/lib/rss";
import { resolveCik } from "@/app/lib/tickers";

type RssItem = {
  title: string;
  link: string;
  pubDate: string;
  summary?: string | { [k: string]: any };
};

// Pull the SEC form code from the start of titles like "10-Q  - Quarterly report ..."
function extractForm(title: string): string {
  const m = title?.match(/^([A-Z0-9\-\/]+)\s{2,}/i);
  return (m?.[1] || "").toUpperCase();
}

async function fetchTickerSec(
  ticker: string,
  opts: { allowForms: Set<string> | null }
): Promise<Array<RssItem & { ticker: string; form?: string }>> {
  const cik = await resolveCik(ticker);
  if (!cik) return [];

  const url = `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${encodeURIComponent(
    cik
  )}&owner=exclude&count=100&output=atom`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "TickerPulse/1.0 (contact: emb486@drexel.edu)",
      "Accept": "application/atom+xml,application/xml,text/xml;q=0.9,*/*;q=0.8",
    },
  });
  if (!res.ok) return [];

  const xml = await res.text();
  const items = (parseRss(xml) as RssItem[]).map((it) => {
    const form = extractForm(it.title);
    return { ...it, ticker, form };
  });

  // Filter by form types if requested
  const filtered =
    opts.allowForms
      ? items.filter((it) => it.form && opts.allowForms!.has(it.form))
      : items;

  return filtered;
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);

  // tickers
  const tickersParam = url.searchParams.get("tickers") || "AAPL,MSFT";
  const tickers = tickersParam
    .split(",")
    .map((t) => t.trim().toUpperCase())
    .filter(Boolean)
    .slice(0, 12);

  // forms filter (comma separated). Default: common filings
  const formsParam = url.searchParams.get("forms"); // e.g. 10-K,10-Q,8-K
  const defaultForms = ["10-K", "10-Q", "8-K", "11-K", "13D", "13G", "SD"];
  const allowForms = formsParam
    ? new Set(
        formsParam
          .split(",")
          .map((s) => s.trim().toUpperCase())
          .filter(Boolean)
      )
    : new Set(defaultForms);

  // limit total items returned (across all tickers)
  const limit = Math.max(1, Math.min(200, parseInt(url.searchParams.get("limit") || "50", 10)));

  const results = await Promise.all(
    tickers.map((t) => fetchTickerSec(t, { allowForms }))
  );

  // Flatten, sort newest first, de-dupe by link, apply limit
  const seen = new Set<string>();
  const items = results
    .flat()
    .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
    .filter((it) => {
      if (seen.has(it.link)) return false;
      seen.add(it.link);
      return true;
    })
    .slice(0, limit);

  return NextResponse.json({ items });
}
