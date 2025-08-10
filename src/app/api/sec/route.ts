import { NextRequest, NextResponse } from "next/server";
import { parseRss } from "@/app/lib/rss";
import { TICKER_TO_CIK } from "@/app/lib/tickers";

async function fetchSec(ticker: string) {
  const cik = TICKER_TO_CIK[ticker.toUpperCase()];
  if (!cik) return [];
  const url = `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${cik}&type=&dateb=&owner=exclude&count=40&output=atom`;
  const res = await fetch(url, { headers: { "User-Agent": "TickerPulse/1.0; contact@example.com" } });
  if (!res.ok) return [];
  const xml = await res.text();
  const items = parseRss(xml);
  return items.map((it) => ({ ...it, ticker }));
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const tickersParam = url.searchParams.get("tickers") || "AAPL";
  const tickers = tickersParam.split(",").map((t) => t.trim().toUpperCase()).slice(0, 6);
  const results = await Promise.all(tickers.map(fetchSec));
  const items = results.flat();
  return NextResponse.json({ items });
}
