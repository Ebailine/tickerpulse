import { NextRequest, NextResponse } from "next/server";

type Obs = { date: string; value: string };
type Series = { id: string; title: string; unit: string; observations: Obs[] };

const SERIES = [
  { id: "CPIAUCSL", title: "Inflation (CPI, SA, 1982-84=100)", unit: "index" },
  { id: "UNRATE",   title: "Unemployment Rate",                unit: "%"     },
  { id: "FEDFUNDS", title: "Fed Funds Rate (Effective)",       unit: "%"     },
  { id: "PAYEMS",   title: "Nonfarm Payrolls (thousands)",     unit: "K"     },
];

async function fetchFredSeries(id: string, key: string) {
  const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${id}&api_key=${key}&file_type=json`;
  const res = await fetch(url, { headers: { "User-Agent": "TickerPulse/0.3" } });
  if (!res.ok) throw new Error("fred error");
  const js = await res.json();
  return (js.observations || []) as Obs[];
}

// simple mock if key/rate limit fails
function mock(id: string): Obs[] {
  const today = new Date();
  const out: Obs[] = [];
  for (let i = 24; i >= 0; i--) {
    const d = new Date(today); d.setMonth(today.getMonth() - i);
    const val =
      id === "UNRATE"   ? (3.8 + Math.sin(i/4)*0.2).toFixed(1) :
      id === "FEDFUNDS" ? (5.1 + Math.sin(i/6)*0.2).toFixed(2) :
      id === "PAYEMS"   ? (15300 + i*20 + Math.sin(i/3)*30).toFixed(0) :
                          (310 + i*0.2 + Math.sin(i/5)).toFixed(1); // CPI-ish
    out.push({ date: d.toISOString().slice(0,10), value: val });
  }
  return out;
}

export async function GET(req: NextRequest) {
  const key = process.env.FRED_API_KEY || "";
  const results: Record<string, Series> = {};
  for (const s of SERIES) {
    try {
      const obs = key ? await fetchFredSeries(s.id, key) : mock(s.id);
      results[s.id] = { id: s.id, title: s.title, unit: s.unit, observations: obs.slice(-60) };
    } catch {
      results[s.id] = { id: s.id, title: s.title + " (mock)", unit: s.unit, observations: mock(s.id) };
    }
  }
  return NextResponse.json({ series: results });
}
