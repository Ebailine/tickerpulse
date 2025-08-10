import { NextRequest, NextResponse } from "next/server";
import { parseRss } from "@/app/lib/rss";
import { scoreSentiment } from "@/app/lib/sentiment";

async function fetchTickerRss(ticker: string) {
  const url = `https://feeds.finance.yahoo.com/rss/2.0/headline?s=${encodeURIComponent(ticker)}&region=US&lang=en-US`;
  const res = await fetch(url, { headers: { "User-Agent": "TickerPulse/1.0" } });
  if (!res.ok) return [];
  const xml = await res.text();
  const items = parseRss(xml);
  return items.map((it) => ({ ...it, ticker, sentiment: scoreSentiment(it.title, it.summary) }));
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const tickersParam = url.searchParams.get("tickers") || "AAPL,MSFT";
  const tickers = tickersParam.split(",").map((t) => t.trim().toUpperCase()).slice(0, 12);
  const results = await Promise.all(tickers.map(fetchTickerRss));
  const items = results.flat().sort((a, b) => (new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()));
  return NextResponse.json({ items });
}
