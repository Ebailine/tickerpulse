import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "TickerPulse — Free Finance Prep",
  description: "Personal watchlist, fresh headlines, SEC filings. No keys needed.",
  manifest: "/manifest.json",
};
export const viewport = { themeColor: "#0f172a" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <Link href="/" className="font-semibold">TickerPulse</Link>
            <nav className="text-sm text-slate-700 flex gap-4">
              <Link href="/macro" className="hover:text-slate-900">Macro</Link>
              <a href="#how" className="hover:text-slate-900">How it works</a>
              <a href="#pwa" className="hover:text-slate-900">Install app</a>
              <a href="https://github.com" target="_blank" className="hover:text-slate-900">GitHub</a>
            </nav>
          </div>
        </header>
        {children}
        <footer className="mt-12 border-t bg-white">
          <div className="mx-auto max-w-6xl px-4 py-10 text-xs text-slate-500">
            © {new Date().getFullYear()} TickerPulse • Free PWA • No data collected
          </div>
        </footer>
      </body>
    </html>
  );
}
