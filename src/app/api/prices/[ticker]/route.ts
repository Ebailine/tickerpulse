export const runtime = "nodejs";

import { db } from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function GET(_: Request, { params }: { params: { ticker: string } }) {
  const t = decodeURIComponent(params.ticker).toUpperCase();
  const q = `
    select d, open, high, low, close, volume, adj_close
    from prices_daily
    where ticker = $1
    order by d asc;
  `;
  const { rows } = await db().query(q, [t]);
  return NextResponse.json({ ticker: t, series: rows });
}
