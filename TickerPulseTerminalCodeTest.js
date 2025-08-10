Last login: Sat Aug  9 18:27:48 on ttys000
ethanbailine@Ethans-MacBook-Pro-2 ~ % cd ~/Desktop || cd ~
mkdir tickerpulse
cd tickerpulse

mkdir: tickerpulse: File exists
ethanbailine@Ethans-MacBook-Pro-2 tickerpulse % cat > package.json << 'EOF'
{
  "name": "tickerpulse",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3000",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "fast-xml-parser": "^4.4.1",
    "next": "14.2.5",
    "react": "18.3.1",
    "react-dom": "18.3.1"
  },
  "devDependencies": {
    "autoprefixer": "^10.4.18",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.9",
    "typescript": "5.5.4"
  }
}
EOF

ethanbailine@Ethans-MacBook-Pro-2 tickerpulse % cat > next.config.mjs << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { optimizePackageImports: ["react", "react-dom"] },
};
export default nextConfig;
EOF

ethanbailine@Ethans-MacBook-Pro-2 tickerpulse % cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
EOF

ethanbailine@Ethans-MacBook-Pro-2 tickerpulse % cat > postcss.config.js << 'EOF'
module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } };
EOF

ethanbailine@Ethans-MacBook-Pro-2 tickerpulse % cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: { extend: { typography: { DEFAULT: { css: { maxWidth: "65ch" }}}}},
  plugins: []
};
EOF

ethanbailine@Ethans-MacBook-Pro-2 tickerpulse % mkdir -p public/icons
cat > public/robots.txt << 'EOF'
User-agent: *
Allow: /
EOF

cat > public/manifest.json << 'EOF'
{
  "name": "TickerPulse",
  "short_name": "TickerPulse",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0f172a",
  "theme_color": "#0f172a",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
EOF

ethanbailine@Ethans-MacBook-Pro-2 tickerpulse % # write tiny valid PNGs; mac uses -D, Linux uses --decode. Try both:
printf 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=' | base64 -D 2>/dev/null > public/icons/icon-192.png || printf 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=' | base64 --decode > public/icons/icon-192.png
printf 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=' | base64 -D 2>/dev/null > public/icons/icon-512.png || printf 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=' | base64 --decode > public/icons/icon-512.png

zsh: command not found: #
zsh: command not found: mac
ethanbailine@Ethans-MacBook-Pro-2 tickerpulse % mkdir -p src/app/api/news src/app/api/sec src/app/lib
cat > src/app/globals.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

html, body { height: 100%; }
body { @apply bg-slate-50 text-slate-900; }
EOF

ethanbailine@Ethans-MacBook-Pro-2 tickerpulse % cat > src/app/layout.tsx << 'EOF'
import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "TickerPulse — Free Finance Prep",
  description: "Personal watchlist, fresh headlines, SEC filings. No keys needed.",
  manifest: "/manifest.json",
  themeColor: "#0f172a"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <Link href="/" className="font-semibold">TickerPulse</Link>
            <nav className="text-sm text-slate-700 flex gap-4">
              <a href="#how" className="hover:text-slate-900">How it works</a>
              <a href="#pwa" className="hover:text-slate-900">Install app</a>
              <a href="https://github.com" target="_blank" className="hover:text-slate-900">GitHub</a>
            </nav>
          </div>
        </header>
        {children}
        <footer className="mt-12 border-t bg-white">
          <div className="mx-auto max-w-6xl px-4 py-10 text-xs text-slate-500">© {new Date().getFullYear()} TickerPulse • Free PWA • No data collected</div>
        </footer>
      </body>
    </html>
  );
}
EOF

ethanbailine@Ethans-MacBook-Pro-2 tickerpulse % cat > src/app/lib/sentiment.ts << 'EOF'
const POS = ["beats", "beat", "surge", "record", "rallies", "rally", "upgrade", "outperform", "raises", "strong", "positive", "bullish", "growth"];
const NEG = ["miss", "misses", "cut", "cuts", "downgrade", "fall", "falls", "plunge", "plunges", "slump", "warns", "guidance", "negative", "bearish", "lawsuit", "probe"];

export function scoreSentiment(title: string, summary?: string) {
  const text = (title + " " + (summary || "")).toLowerCase();
  let score = 0;
  for (const p of POS) if (text.includes(p)) score += 1;
  for (const n of NEG) if (text.includes(n)) score -= 1;
  return score > 0 ? "bullish" : score < 0 ? "bearish" : "neutral";
}
EOF

ethanbailine@Ethans-MacBook-Pro-2 tickerpulse % cat > src/app/lib/tickers.ts << 'EOF'
export const TICKER_TO_CIK: Record<string, string> = {
  AAPL: "0000320193",
  MSFT: "0000789019",
  GOOGL: "0001652044",
  AMZN: "0001018724",
  TSLA: "0001318605",
  NVDA: "0001045810",
  META: "0001326801",
  AMD: "0000002488"
};
EOF

ethanbailine@Ethans-MacBook-Pro-2 tickerpulse % cat > src/app/lib/rss.ts << 'EOF'
import { XMLParser } from "fast-xml-parser";

export function parseRss(xml: string) {
  const p = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });
  const js = p.parse(xml);
  if (js.rss) {
    const ch = js.rss.channel;
    const items = Array.isArray(ch.item) ? ch.item : [ch.item].filter(Boolean);
    return (items || []).map((it: any) => ({
      title: it.title || "",
      link: it.link || "",
      pubDate: it.pubDate || "",
      summary: it.description || ""
    }));
  }
  if (js.feed && js.feed.entry) {
    const items = Array.isArray(js.feed.entry) ? js.feed.entry : [js.feed.entry];
    return items.map((it: any) => ({
      title: it.title?.["#text"] || it.title || "",
      link: it.link?.["@_href"] || it.link?.[0]?.["@_href"] || "",
      pubDate: it.updated || it.published || "",
      summary: it.summary || it.content || ""
    }));
  }
  return [];
}
EOF

ethanbailine@Ethans-MacBook-Pro-2 tickerpulse % cat > src/app/api/news/route.ts << 'EOF'
import { NextRequest, NextResponse } from "next/server";
import { parseRss } from "@/app/lib/rss";
import { scoreSentiment } from "@/app/lib/sentiment";

async function fetchTickerRss(ticker: string) {
  const url = `https://feeds.finance.yahoo.com/rss/2.0/headline?s=${encodeURIComponent(ticker)}&region=US&lang=en-US`;
  const res = await fetch(url, { headers: { "User-Agent": "TickerPulse/1.0" } });
  if (!res.ok) return [];
  const xml = await res.text();
  const items = parseRss(xml);
  return items.map((it) => ({ ...it, ticker, sentiment: scoreSentiment(it.title, it.summary) }));
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const tickersParam = url.searchParams.get("tickers") || "AAPL,MSFT";
  const tickers = tickersParam.split(",").map((t) => t.trim().toUpperCase()).slice(0, 12);
  const results = await Promise.all(tickers.map(fetchTickerRss));
  const items = results.flat().sort((a, b) => (new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()));
  return NextResponse.json({ items });
}
EOF

ethanbailine@Ethans-MacBook-Pro-2 tickerpulse % cat > src/app/api/sec/route.ts << 'EOF'
import { NextRequest, NextResponse } from "next/server";
import { parseRss } from "@/app/lib/rss";
import { TICKER_TO_CIK } from "@/app/lib/tickers";

async function fetchSec(ticker: string) {
  const cik = TICKER_TO_CIK[ticker.toUpperCase()];
  if (!cik) return [];
  const url = `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${cik}&type=&dateb=&owner=exclude&count=40&output=atom`;
  const res = await fetch(url, { headers: { "User-Agent": "TickerPulse/1.0; contact@example.com" } });
  if (!res.ok) return [];
  const xml = await res.text();
  const items = parseRss(xml);
  return items.map((it) => ({ ...it, ticker }));
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const tickersParam = url.searchParams.get("tickers") || "AAPL";
  const tickers = tickersParam.split(",").map((t) => t.trim().toUpperCase()).slice(0, 6);
  const results = await Promise.all(tickers.map(fetchSec));
  const items = results.flat();
  return NextResponse.json({ items });
}
EOF

ethanbailine@Ethans-MacBook-Pro-2 tickerpulse % >....                                                                                                                                       
            <li>Add tickers. We store them locally on your device.</li>
            <li>We fetch Yahoo Finance RSS per ticker and SEC Atom feeds on the server, no keys.</li>
            <li>Sentiment tags are rule-based and transparent.</li>
            <li>Install it as an app for one-tap morning checks.</li>
          </ol>
        </div>

        <div id="pwa" className="mt-6 text-sm text-slate-600">
          <b>Install:</b> on desktop, click your browser Install App icon. On iPhone, share → Add to Home Screen.
        </div>
      </section>
    </main>
  );
}

function TickerAdder({ onAdd }: { onAdd: (t: string)=>void }) {
  const [t, setT] = useState("");
  return (
    <form onSubmit={(e)=>{e.preventDefault(); if(!t) return; onAdd(t); setT("");}} className="flex items-center gap-2">
      <input value={t} onChange={e=>setT(e.target.value)} placeholder="Add ticker (e.g., AAPL)" className="rounded-lg border px-3 py-1.5 text-sm" />
      <button className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm text-white">Add</button>
    </form>
  );
}

function DailyBrief({ items }: { items: Item[] }) {
  const top = useMemo(()=> items.slice(0,5), [items]);
  const text = top.map((i,idx)=>`${idx+1}. ${i.title}${i.ticker?` (${i.ticker})`:''}`).join("\n");
  function copy(){ navigator.clipboard.writeText(text); }
  return (
    <div className="rounded-xl border bg-white p-4">
      <h3 className="font-semibold">Daily Brief</h3>
      <p className="mt-1 text-sm text-slate-600">Top 5 headlines from your feed as quick bullets.</p>
      <button onClick={copy} className="mt-3 w-full rounded-lg border px-3 py-2 text-sm hover:bg-slate-50">Copy to clipboard</button>
    </div>
  );
}

function InstallCTA(){
  return (
    <div className="rounded-xl border bg-white p-4">
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
EOF

ethanbailine@Ethans-MacBook-Pro-2 tickerpulse % cat > next-env.d.ts << 'EOF'
/// <reference types="next" />
/// <reference types="next/image-types/global" />
/** NOTE: This file should not be edited. */
EOF

ethanbailine@Ethans-MacBook-Pro-2 tickerpulse % npm install


up to date, audited 142 packages in 2s

37 packages are looking for funding
  run `npm fund` for details

1 critical severity vulnerability

To address all issues, run:
  npm audit fix --force

Run `npm audit` for details.
ethanbailine@Ethans-MacBook-Pro-2 tickerpulse % npm run dev


> dev
> next dev -p 3000

  ▲ Next.js 14.2.5
  - Local:        http://localhost:3000

 ✓ Starting...
It looks like you're trying to use TypeScript but do not have the required package(s) installed.
Installing dependencies

If you are not trying to use TypeScript, please remove the tsconfig.json file from your package root (and any TypeScript files in your pages directory).


Installing devDependencies (npm):
- @types/react
- @types/node


added 4 packages, and audited 146 packages in 2s

37 packages are looking for funding
  run `npm fund` for details

1 critical severity vulnerability

To address all issues, run:
  npm audit fix --force

Run `npm audit` for details.


   We detected TypeScript in your project and reconfigured your tsconfig.json file for you. Strict-mode is set to false by default.
   The following suggested values were added to your tsconfig.json. These values can be changed to fit your project's needs:

   	- allowJs was set to true
   	- include was updated to add '.next/types/**/*.ts'
   	- plugins was updated to add { name: 'next' }

   The following mandatory changes were made to your tsconfig.json:

   	- esModuleInterop was set to true (requirement for SWC / babel)

 ✓ Ready in 5.6s
 ○ Compiling / ...
 ✓ Compiled / in 3.9s (500 modules)
 ⚠ Unsupported metadata themeColor is configured in metadata export in /. Please move it to viewport export instead.
Read more: https://nextjs.org/docs/app/api-reference/functions/generate-viewport
 GET / 200 in 4310ms
 ○ Compiling /api/sec ...
 ✓ Compiled /api/sec in 2.9s (289 modules)
 ✓ Compiled (292 modules)
 GET /api/sec?tickers=AAPL%2CMSFT%2CNVDA 200 in 3392ms
 GET /api/sec?tickers=AAPL%2CMSFT%2CNVDA 200 in 97ms
 GET /api/news?tickers=AAPL%2CMSFT%2CNVDA 200 in 3659ms
 GET /api/news?tickers=AAPL%2CMSFT%2CNVDA 200 in 102ms
 ⚠ Unsupported metadata themeColor is configured in metadata export in /. Please move it to viewport export instead.
Read more: https://nextjs.org/docs/app/api-reference/functions/generate-viewport
 GET / 200 in 158ms
 GET /api/news?tickers=AAPL%2CMSFT%2CNVDA 200 in 238ms
 GET /api/sec?tickers=AAPL%2CMSFT%2CNVDA 200 in 287ms
 GET /api/sec?tickers=AAPL%2CMSFT%2CNVDA 200 in 84ms
 GET /api/news?tickers=AAPL%2CMSFT%2CNVDA 200 in 145ms
 GET /api/news?tickers=AAPL%2CMSFT%2CNVDA%2CTSLA 200 in 304ms
 GET /api/sec?tickers=AAPL%2CMSFT%2CNVDA%2CTSLA 200 in 314ms

