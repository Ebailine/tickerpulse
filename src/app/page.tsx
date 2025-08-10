"use client";

import { useEffect, useMemo, useState } from "react";
import { useMounted, useAutoRefresh } from "@/app/lib/hooks";
import { cls } from "@/app/lib/ui";
import TabButton from "@/app/components/TabButton";
import TickerAdder from "@/app/components/TickerAdder";
import ChartCard from "@/app/components/ChartCard";

type Sentiment = "bullish" | "bearish" | "neutral";

type Item = {
  title: string;
  link: string;
  pubDate: string;
  summary?: string;
  ticker?: string;
  sentiment?: Sentiment;
};

type SeriesPt = { d: string; close: number };

type PriceResp = {
  ticker: string;
  series: SeriesPt[];
  last: number;
  changePct: number;
};

export default function Home() {
  const mounted = useMounted();

  // Watchlist state (saved to localStorage)
  const [watchlist, setWatchlist] = useState<string[]>([]);
  useEffect(() => {
    if (!mounted) return;
    try {
      const raw = localStorage.getItem("tp_watchlist");
      setWatchlist(raw ? JSON.parse(raw) : ["AAPL", "MSFT", "NVDA"]);
    } catch {
      setWatchlist(["AAPL", "MSFT", "NVDA"]);
    }
  }, [mounted]);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("tp_watchlist", JSON.stringify(watchlist));
    }
  }, [mounted, watchlist]);

  // Tabs + data state
  const [tab, setTab] = useState<"signals" | "prices" | "news" | "charts">("signals");
  const [news, setNews] = useState<Item[]>([]);
  const [sec, setSec] = useState<Item[]>([]);
  const [prices, setPrices] = useState<Record<string, PriceResp>>({});
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  // Loaders
  async function refreshNews() {
  const qs = encodeURIComponent(watchlist.join(","));
  const [n, s] = await Promise.all([
    fetch(`/api/news?tickers=${qs}`).then((r) => r.json()),
    fetch(`/api/sec?tickers=${qs}&forms=10-K,10-Q,8-K&limit=40`).then((r) => r.json()),
  ]);
  setNews(n.items);
  setSec(s.items);
}

  async function refreshPrices() {
    const entries = await Promise.all(
      watchlist.slice(0, 8).map(async (t) => {
        const r = await fetch(`/api/prices?t=${encodeURIComponent(t)}`).then((r) => r.json());
        return [t, r] as const;
      })
    );
    const obj: Record<string, PriceResp> = {};
    entries.forEach(([t, r]) => {
      obj[t] = r;
    });
    setPrices(obj);
  }

  async function refreshAll() {
    setLoading(true);
    await Promise.all([refreshNews(), refreshPrices()]);
    setLoading(false);
  }

  useEffect(() => {
    if (mounted) refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  useAutoRefresh(mounted, refreshAll, 60_000);

  // Search filter for news
  const filteredNews = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return news;
    return news.filter((i) =>
      (i.title + " " + (i.summary || "") + (i.ticker || "")).toLowerCase().includes(needle)
    );
  }, [q, news]);

  return (
    <main>
      <section className="mx-auto max-w-6xl px-4 py-8">
        {!mounted ? (
          <div className="text-sm text-slate-600">Loading…</div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">TickerPulse</h1>
              <button
                onClick={refreshAll}
                className="rounded-xl bg-slate-900 px-4 py-2 text-white disabled:opacity-50"
                disabled={loading}
              >
                {loading ? "Refreshing..." : "Refresh all"}
              </button>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              {watchlist.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm"
                >
                  {t}
                  <button
                    onClick={() => setWatchlist(watchlist.filter((x) => x !== t))}
                    className="text-slate-500 hover:text-slate-900"
                  >
                    ×
                  </button>
                </span>
              ))}
              <TickerAdder
                onAdd={(t) =>
                  setWatchlist(Array.from(new Set([...watchlist, t.toUpperCase()])))
                }
              />
            </div>

            <div className="mt-6 flex gap-2">
              <TabButton active={tab === "signals"} onClick={() => setTab("signals")}>
                Signals (beta)
              </TabButton>
              <TabButton active={tab === "prices"} onClick={() => setTab("prices")}>
                Prices
              </TabButton>
              <TabButton active={tab === "news"} onClick={() => setTab("news")}>
                News & Filings
              </TabButton>
              <TabButton active={tab === "charts"} onClick={() => setTab("charts")}>
                Charts
              </TabButton>
            </div>

            {tab === "signals" && (
              <SignalsPanel watchlist={watchlist} news={filteredNews} prices={prices} />
            )}
            {tab === "prices" && (
              <PricesPanel watchlist={watchlist} prices={prices} onReload={refreshPrices} />
            )}
            {tab === "news" && <NewsPanel news={filteredNews} sec={sec} q={q} setQ={setQ} />}
            {tab === "charts" && <ChartsPanel watchlist={watchlist} prices={prices} />}
          </>
        )}
      </section>
    </main>
  );
}

/* ---------- Panels ---------- */

function NewsPanel({
  news,
  sec,
  q,
  setQ,
}: {
  news: Item[];
  sec: Item[];
  q: string;
  setQ: (v: string) => void;
}) {
  return (
    <div className="mt-4 grid gap-6 md:grid-cols-3">
      <div className="md:col-span-2">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Headlines</h2>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search headlines or tickers"
            className="rounded-lg border px-3 py-2 text-sm"
          />
        </div>
        <ul className="space-y-3">
          {news.map((it, idx) => (
            <li
              key={idx}
              className="rounded-2xl border border-white/20 bg-white/70 backdrop-blur p-4 shadow-soft dark:bg-brand-900/60 dark:border-white/10 shadow-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <a href={it.link} target="_blank" className="font-medium hover:underline">
                  {it.title}
                </a>
                <span
                  className={cls(
                    "text-xs px-2 py-1 rounded-full capitalize",
                    it.sentiment === "bullish" && "bg-emerald-50 text-emerald-700",
                    it.sentiment === "bearish" && "bg-rose-50 text-rose-700",
                    it.sentiment === "neutral" && "bg-slate-100 text-slate-700"
                  )}
                >
                  {it.sentiment || ""}
                </span>
              </div>
              <div className="mt-1 text-xs text-slate-500 flex items-center gap-2">
                {it.ticker && <span className="rounded bg-slate-100 px-2 py-0.5">{it.ticker}</span>}
                <span>{new Date(it.pubDate).toLocaleString()}</span>
              </div>
              {it.summary && (
                <p
                  className="mt-2 text-sm text-slate-700 line-clamp-3"
                  dangerouslySetInnerHTML={{ __html: it.summary }}
                />
              )}
            </li>
          ))}
        </ul>
      </div>

      <aside className="space-y-4">
        <DailyBrief items={news} />
        <div className="rounded-2xl border border-white/20 bg-white/70 backdrop-blur p-4 shadow-soft dark:bg-brand-900/60 dark:border-white/10">
          <h3 className="font-semibold">Latest SEC filings</h3>
          <ul className="mt-2 space-y-2 text-sm">
            {sec.slice(0, 12).map((it, idx) => (
              <li key={idx} className="flex items-center justify-between gap-2">
                <a href={it.link} target="_blank" className="hover:underline">
                  {it.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <InstallCTA />
      </aside>
    </div>
  );
}

function PricesPanel({
  watchlist,
  prices,
  onReload,
}: {
  watchlist: string[];
  prices: Record<string, PriceResp>;
  onReload: () => void;
}) {
  return (
    <div className="mt-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Prices</h2>
        <button onClick={onReload} className="rounded-lg border px-3 py-1.5 text-sm hover:bg-slate-50">
          Reload prices
        </button>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {watchlist.map((t) => (
          <PriceCard key={t} data={prices[t]} ticker={t} />
        ))}
      </div>
      {!watchlist.length && (
        <div className="text-slate-600 text-sm mt-4">Add tickers above to load prices.</div>
      )}
    </div>
  );
}

function PriceCard({ data, ticker }: { data?: PriceResp; ticker: string }) {
  if (!data)
    return (
      <div className="rounded-2xl border border-white/20 bg-white/70 backdrop-blur p-4 shadow-soft dark:bg-brand-900/60 dark:border-white/10">
        <div className="flex items-center justify-between">
          <div className="font-semibold">{ticker}</div>
          <div className="text-xs text-slate-500">loading…</div>
        </div>
      </div>
    );
  const last = data.last?.toFixed(2);
  const ch = data.changePct?.toFixed(2);
  return (
    <div className="rounded-2xl border border-white/20 bg-white/70 backdrop-blur p-4 shadow-soft dark:bg-brand-900/60 dark:border-white/10">
      <div className="flex items-center justify-between">
        <div className="font-semibold">{ticker}</div>
        <div className={cls("text-sm font-medium", data.changePct >= 0 ? "text-emerald-700" : "text-rose-700")}>
          {ch}%
        </div>
      </div>
      <div className="text-2xl font-semibold mt-1">${last}</div>
      <Sparkline series={data.series} />
    </div>
  );
}

function Sparkline({ series }: { series: SeriesPt[] }) {
  if (!series?.length) return null;
  const w = 400,
    h = 80;
  const xs = series.map((_, i) => i);
  const ys = series.map((s) => s.close);
  const xmin = 0,
    xmax = xs.length - 1;
  const ymin = Math.min(...ys),
    ymax = Math.max(...ys);
  const px = (i: number) => ((i - xmin) / (xmax - xmin || 1)) * w;
  const py = (v: number) => h - ((v - ymin) / (ymax - ymin || 1)) * h;
  const path = xs
    .map((i, idx) => (idx ? "L" : "M") + px(i) + " " + py(ys[i]))
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mt-3 w-full">
      <path d={path} fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function SignalsPanel({
  watchlist,
  news,
  prices,
}: {
  watchlist: string[];
  news: Item[];
  prices: Record<string, PriceResp>;
}) {
  const byTicker = (t: string) => news.filter((n) => n.ticker === t);

  const avgSentiment = (items: Item[]) => {
    if (!items.length) return 0;
    const v = items
      .map((i) => (i.sentiment === "bullish" ? 1 : i.sentiment === "bearish" ? -1 : 0))
      .reduce((a: number, b: number) => a + b, 0);
    return v / items.length;
  };

  const momentum = (p?: PriceResp) => {
    if (!p?.series?.length) return 0;
    const series = p.series;
    const last = series[series.length - 1].close;
    const i = Math.max(0, series.length - 20);
    const base = series[i].close;
    return base ? (last - base) / base : 0;
    };

  const rows = watchlist.map((t) => {
    const s = avgSentiment(byTicker(t)); // -1 to 1
    const m = momentum(prices[t]);       // percentage change over 20 bars
    const score = s * 0.6 + m * 0.4;
    const label = score > 0.03 ? "Buy (demo)" : score < -0.03 ? "Caution (demo)" : "Hold (demo)";
    return { t, s, m, label };
  });

  return (
    <div className="mt-4">
      <div className="rounded-2xl border border-white/20 bg-white/70 backdrop-blur p-4 shadow-soft dark:bg-brand-900/60 dark:border-white/10">
        <h2 className="text-xl font-semibold">Signal Board (v0 demo)</h2>
        <p className="text-xs text-slate-500 mt-1">
          Not financial advice. Demo only. Combines news sentiment + 20-day momentum.
        </p>
        <table className="mt-3 w-full text-sm">
          <thead>
            <tr className="text-left">
              <th className="p-2">Ticker</th>
              <th className="p-2">Avg sentiment</th>
              <th className="p-2">20d momentum</th>
              <th className="p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.t} className="border-t">
                <td className="p-2">{r.t}</td>
                <td className="p-2">{r.s.toFixed(2)}</td>
                <td className="p-2">{(r.m * 100).toFixed(2)}%</td>
                <td className="p-2">
                  <span
                    className={cls(
                      "rounded-full px-2 py-1 text-xs",
                      r.label.startsWith("Buy") && "bg-emerald-50 text-emerald-700",
                      r.label.startsWith("Hold") && "bg-slate-100 text-slate-700",
                      r.label.startsWith("Caution") && "bg-rose-50 text-rose-700"
                    )}
                  >
                    {r.label}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DailyBrief({ items }: { items: Item[] }) {
  const top = useMemo(() => items.slice(0, 5), [items]);
  const text = top
    .map((i, idx) => `${idx + 1}. ${i.title}${i.ticker ? ` (${i.ticker})` : ""}`)
    .join("\n");
  function copy() {
    navigator.clipboard.writeText(text);
  }
  return (
    <div className="rounded-2xl border border-white/20 bg-white/70 backdrop-blur p-4 shadow-soft dark:bg-brand-900/60 dark:border-white/10">
      <h3 className="font-semibold">Daily Brief</h3>
      <p className="mt-1 text-sm text-slate-600">Top 5 headlines from your feed as quick bullets.</p>
      <button
        onClick={copy}
        className="mt-3 w-full rounded-lg border px-3 py-2 text-sm hover:bg-slate-50"
      >
        Copy to clipboard
      </button>
    </div>
  );
}

function InstallCTA() {
  return (
    <div className="rounded-2xl border border-white/20 bg-white/70 backdrop-blur p-4 shadow-soft dark:bg-brand-900/60 dark:border-white/10">
      <h3 className="font-semibold">Install TickerPulse</h3>
      <p className="mt-1 text-sm text-slate-600">Use it like a native app. Works great on phones.</p>
      <ul className="mt-2 list-disc pl-5 text-sm text-slate-700">
        <li>Desktop: click browser Install icon</li>
        <li>iPhone: Share → Add to Home Screen</li>
        <li>Android: Add to Home Screen</li>
      </ul>
    </div>
  );
}

function ChartsPanel({
  watchlist,
  prices,
}: {
  watchlist: string[];
  prices: Record<string, PriceResp>;
}) {
  const list = watchlist.slice(0, 4);

  return (
    <div className="mt-4 grid gap-3 md:grid-cols-2">
      {list.map((t) => (
        <ChartCard key={t} ticker={t} series={prices[t]?.series || []} />
      ))}

      {!list.length && <div className="text-sm text-slate-600">Add tickers above to see charts.</div>}
    </div>
  );
}
