import { NextRequest, NextResponse } from "next/server";

type Point = { d: string; close: number };

async function fetchAlphaVantageDaily(ticker: string, key: string): Promise<Point[]> {
  const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${encodeURIComponent(ticker)}&apikey=${key}`;
  const res = await fetch(url, { headers: { "User-Agent": "TickerPulse/0.2" } });
  if (!res.ok) throw new Error("alpha vantage error");
  const data = await res.json() as any;
  const series = data["Time Series (Daily)"];
  if (!series) throw new Error("no series");
  const points: Point[] = Object.keys(series)
    .sort()
    .map(d => ({ d, close: parseFloat(series[d]["4. close"]) }));
  return points.slice(-90);
}

function mockSeries(): Point[] {
  const out: Point[] = [];
  const now = new Date();
  for (let i = 90; i >= 1; i--) {
    const dt = new Date(now); dt.setDate(now.getDate() - i);
    const base = 100 + Math.sin(i / 8) * 5 + (Math.random() - 0.5);
    out.push({ d: dt.toISOString().slice(0,10), close: Math.round(base * 100) / 100 });
  }
  return out;
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const t = (url.searchParams.get("t") || "AAPL").toUpperCase();
  const key = process.env.ALPHA_VANTAGE_KEY || "";
  let series: Point[] = [];
  try {
    series = key ? await fetchAlphaVantageDaily(t, key) : mockSeries();
  } catch {
    series = mockSeries();
  }
  const last = series[series.length - 1]?.close ?? 0;
  const first = series[0]?.close ?? last;
  const changePct = first ? ((last - first) / first) * 100 : 0;
  return NextResponse.json({ ticker: t, series, last, changePct });
}
