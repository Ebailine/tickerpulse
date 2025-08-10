import { NextRequest, NextResponse } from "next/server";
import { parseRss } from "@/app/lib/rss";
import { TICKER_TO_CIK } from "@/app/lib/tickers";

type RssItem = {
  title: string;
  link: string;
  pubDate: string;
  summary?: string;
};

async function fetchTickerSec(ticker: string): Promise<Array<RssItem & { ticker: string }>> {
  const cik = TICKER_TO_CIK[ticker];
  if (!cik) return [];

  // SEC Atom feed for a company
  const url = `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${encodeURIComponent(
    cik
  )}&owner=exclude&count=40&output=atom`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "TickerPulse/1.0",
      "Accept": "application/atom+xml,application/xml,text/xml;q=0.9,*/*;q=0.8",
    },
  });
  if (!res.ok) return [];

  const xml = await res.text();
  const items = parseRss(xml) as RssItem[];

  // Attach ticker; keep fields we care about
  return items.map((it: RssItem) => ({ ...it, ticker }));
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const tickersParam = url.searchParams.get("tickers") || "AAPL,MSFT";
  const tickers = tickersParam
    .split(",")
    .map((t) => t.trim().toUpperCase())
    .slice(0, 12);

  const results = await Promise.all(tickers.map(fetchTickerSec));
  const items = results
    .flat()
    .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

  return NextResponse.json({ items });
}
