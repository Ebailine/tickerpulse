import { NextRequest, NextResponse } from "next/server";
import { parseRss } from "@/app/lib/rss";
import { scoreSentiment } from "@/app/lib/sentiment";

type RssItem = {
  title: string;
  link: string;
  pubDate: string;
  summary?: string;
};

type Sentiment = "bullish" | "bearish" | "neutral";

/** Fetch Yahoo RSS for one ticker, parse, and attach sentiment + ticker */
async function fetchTickerRss(
  ticker: string
): Promise<Array<RssItem & { ticker: string; sentiment: Sentiment }>> {
  const url = `https://feeds.finance.yahoo.com/rss/2.0/headline?s=${encodeURIComponent(
    ticker
  )}&region=US&lang=en-US`;

  const res = await fetch(url, { headers: { "User-Agent": "TickerPulse/1.0" } });
  if (!res.ok) return [];

  const xml = await res.text();
  const items = parseRss(xml) as RssItem[];

  return items.map((it: RssItem) => ({
    ...it,
    ticker,
    sentiment: scoreSentiment(it.title, it.summary) as Sentiment,
  }));
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const tickersParam = url.searchParams.get("tickers") || "AAPL,MSFT";
  const tickers = tickersParam
    .split(",")
    .map((t) => t.trim().toUpperCase())
    .slice(0, 12);

  const results = await Promise.all(tickers.map(fetchTickerRss));
  const items = results
    .flat()
    .sort(
      (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
    );

  return NextResponse.json({ items });
}
