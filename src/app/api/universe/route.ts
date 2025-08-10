export const runtime = "nodejs";

import { db } from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const q = `
    select ticker, coalesce(name, ticker) as name, exchange
    from universe
    where is_active = true
    order by ticker;
  `;
  const { rows } = await db().query(q);
  return NextResponse.json(rows);
}
