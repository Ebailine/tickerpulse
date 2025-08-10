"use client";
import { useEffect, useState } from "react";

type Obs = { date: string; value: string };
type Series = { id: string; title: string; unit: string; observations: Obs[] };

function cls(...a:(string|false|undefined)[]){ return a.filter(Boolean).join(" "); }

export default function MacroPage(){
  const [data, setData] = useState<{series: Record<string, Series>} | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{ fetch("/api/macro").then(r=>r.json()).then(setData).finally(()=>setLoading(false)); }, []);

  return (
    <main>
      <section className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-3xl font-bold">Macro Dashboard</h1>
        <p className="text-sm text-slate-600 mt-1">CPI, Unemployment, Fed Funds, Payrolls (live via FRED).</p>

        {loading && <div className="mt-6 text-sm text-slate-600">Loading macro data…</div>}

        {!loading && !data?.series && (
          <div className="mt-6 text-rose-700">Could not load macro data.</div>
        )}

        {!loading && data?.series && (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {["CPIAUCSL","UNRATE","FEDFUNDS","PAYEMS"].map(k => (
              <MacroCard key={k} s={data.series[k]} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function MacroCard({ s }:{ s: Series }) {
  const obs = s?.observations || [];
  const last = obs[obs.length-1];
  const prev = obs[obs.length-13] || obs[0];
  const value = Number(last?.value ?? 0);
  const prevVal = Number(prev?.value ?? value);
  const yoy = prevVal ? ((value - prevVal) / prevVal) * 100 : 0;

  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="flex items-center justify-between">
        <div className="font-semibold">{s.title}</div>
        <div className={cls("text-sm font-medium", yoy>=0 ? "text-emerald-700":"text-rose-700")}>
          {yoy>=0 ? "▲" : "▼"} {isFinite(yoy) ? yoy.toFixed(2) : "0.00"}%
        </div>
      </div>
      <div className="text-2xl font-semibold mt-1">
        {isFinite(value) ? value.toLocaleString() : (last?.value ?? "—")} {s.unit}
      </div>
      <div className="text-xs text-slate-500 mt-1">Latest: {last?.date || "—"}</div>
      <Spark obs={obs}/>
    </div>
  );
}

function Spark({ obs }:{ obs: Obs[] }) {
  if (!obs.length) return null;
  const w = 400, h = 80;
  const ys = obs.map(o => Number(o.value));
  const xmin=0, xmax=ys.length-1;
  const ymin=Math.min(...ys), ymax=Math.max(...ys);
  const px = (i:number)=> (i-xmin)/(xmax-xmin||1)*w;
  const py = (v:number)=> h - (v-ymin)/(ymax-ymin||1)*h;
  const d = ys.map((v,i)=> (i? "L":"M") + px(i) + " " + py(v)).join(" ");
  return <svg viewBox={`0 0 ${w} ${h}`} className="mt-3 w-full"><path d={d} fill="none" stroke="currentColor" strokeWidth="2"/></svg>;
}
