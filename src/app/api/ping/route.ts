export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return new Response(JSON.stringify({ ok: true, now: new Date().toISOString() }), {
    headers: { "content-type": "application/json" },
  });
}
