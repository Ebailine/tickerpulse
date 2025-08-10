export const runtime = "nodejs";

import { db } from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function GET(_: Request, { params }: { params: { ticker: string } }) {
  const t = decodeURIComponent(params.ticker).toUpperCase();
  const q = `
    select d, sma20, sma50, rsi14, mom20
    from features_daily
    where ticker = $1
    order by d asc;
  `;
  const { rows } = await db().query(q, [t]);
  return NextResponse.json({ ticker: t, features: rows });
}
