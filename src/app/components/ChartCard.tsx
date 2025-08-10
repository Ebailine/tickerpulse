"use client";
import { useMemo, useState } from "react";
import { sma, rsi } from "@/app/lib/indicators";

type Pt = { d: string; close: number };
type Series = Pt[];

function cls(...a:(string|false|undefined)[]){ return a.filter(Boolean).join(" "); }

function pathFrom(values: (number|null)[], w: number, h: number, min: number, max: number) {
  const n = values.length;
  if (!n) return "";
  const px = (i:number)=> (i / Math.max(n - 1, 1)) * w;
  const py = (v:number)=> h - ((v - min) / Math.max(max - min, 1)) * h;

  let d = "";
  let started = false;
  for (let i = 0; i < n; i++) {
    const v = values[i];
    if (v == null || !isFinite(v)) { started = false; continue; }
    const x = px(i), y = py(v);
    d += (started ? "L" : "M") + x + " " + y + " ";
    started = true;
  }
  return d.trim();
}

export default function ChartCard({
  ticker, series, defaultRange = "6M"
}:{ ticker:string; series: Series; defaultRange?: "1M"|"3M"|"6M"|"1Y"|"MAX" }) {
  const [range, setRange] = useState(defaultRange);

  const windowed = useMemo(()=>{
    const n = series.length;
    const map = { "1M": 22, "3M": 66, "6M": 132, "1Y": 252, "MAX": n };
    const take = map[range] ?? 132;
    return series.slice(Math.max(0, n - take));
  }, [series, range]);

  const closes = windowed.map(s=>s.close);

  const sma20  = sma(closes, 20);
  const sma50  = sma(closes, 50);
  const sma200 = sma(closes, 200);
  const rsi14  = rsi(closes, 14);

  const w = 640, h = 220, hr = 80;
  const lo = Math.min(...closes), hi = Math.max(...closes);

  const pricePath = pathFrom(closes, w, h, lo, hi);
  const s20Path   = pathFrom(sma20,  w, h, lo, hi);
  const s50Path   = pathFrom(sma50,  w, h, lo, hi);
  const s200Path  = pathFrom(sma200, w, h, lo, hi);

  const rsiVals   = rsi14.map(v=> (v ?? null));
  const rsiPath   = pathFrom(rsiVals as (number|null)[], w, hr, 0, 100);

  const last = closes[closes.length-1] ?? 0;
  const first = closes[0] ?? last;
  const chgPct = first ? ((last - first) / first) * 100 : 0;

  return (
    <div className="rounded-2xl border border-white/20 bg-white/70 backdrop-blur p-4 shadow-soft dark:bg-brand-900/60 dark:border-white/10">
      <div className="flex items-center justify-between">
        <div className="font-semibold">{ticker}</div>
        <div className={cls("text-sm font-medium", chgPct>=0 ? "text-emerald-700":"text-rose-700")}>
          {chgPct>=0 ? "▲":"▼"} {isFinite(chgPct) ? chgPct.toFixed(2) : "0.00"}%
        </div>
      </div>

      <div className="mt-2 flex gap-2 text-xs">
        {(["1M","3M","6M","1Y","MAX"] as const).map(r=>(
          <button key={r} onClick={()=>setRange(r)}
            className={cls("rounded-md border px-2 py-1", range===r ? "bg-slate-900 text-white border-slate-900":"bg-white hover:bg-slate-50")}>
            {r}
          </button>
        ))}
      </div>

      <svg viewBox={`0 0 ${w} ${h}`} className="mt-3 w-full">
        <path d={pricePath} fill="none" stroke="currentColor" strokeWidth="2"/>
        <path d={s20Path}  fill="none" stroke="currentColor" strokeWidth="1" opacity="0.7"/>
        <path d={s50Path}  fill="none" stroke="currentColor" strokeWidth="1" opacity="0.6"/>
        <path d={s200Path} fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5"/>
      </svg>

      <div className="mt-2 text-xs text-slate-600">RSI(14)</div>
      <svg viewBox={`0 0 ${w} ${hr}`} className="mt-1 w-full">
        <line x1="0" y1={(1 - 0.70) * hr} x2={w} y2={(1 - 0.70) * hr} stroke="currentColor" strokeDasharray="4 4" opacity="0.3"/>
        <line x1="0" y1={(1 - 0.30) * hr} x2={w} y2={(1 - 0.30) * hr} stroke="currentColor" strokeDasharray="4 4" opacity="0.3"/>
        <path d={rsiPath} fill="none" stroke="currentColor" strokeWidth="1.5"/>
      </svg>

      <div className="mt-2 flex gap-3 text-[11px] text-slate-600">
        <span>Price</span><span>SMA20</span><span>SMA50</span><span>SMA200</span>
      </div>
    </div>
  );
}
