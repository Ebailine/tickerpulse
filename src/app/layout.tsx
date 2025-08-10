import "./globals.css";
import Link from "next/link";
import { Inter } from "next/font/google";

export const metadata = {
  title: "TickerPulse — Free Finance Prep",
  description: "Personal watchlist, fresh headlines, SEC filings. No keys needed.",
  manifest: "/manifest.json",
};
export const viewport = { themeColor: "#0f172a" };

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${inter.className} min-h-full bg-[radial-gradient(1000px_600px_at_10%_-10%,rgba(59,130,246,0.12),transparent),radial-gradient(800px_500px_at_90%_-10%,rgba(236,72,153,0.12),transparent)] dark:bg-[radial-gradient(1000px_600px_at_10%_-10%,rgba(59,130,246,0.18),transparent),radial-gradient(800px_500px_at_90%_-10%,rgba(236,72,153,0.18),transparent)] text-slate-900 dark:text-slate-100`}
      >
        <header className="sticky top-0 z-50 border-b border-white/20 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/50 dark:bg-brand-900/60">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <Link href="/" className="font-semibold">TickerPulse</Link>
            <nav className="text-sm text-slate-700 dark:text-slate-300 flex gap-4">
              <Link href="/macro" className="hover:text-slate-900 dark:hover:text-white">Macro</Link>
              <a href="#how" className="hover:text-slate-900 dark:hover:text-white">How it works</a>
              <a href="#pwa" className="hover:text-slate-900 dark:hover:text-white">Install app</a>
              <a href="https://github.com" target="_blank" className="hover:text-slate-900 dark:hover:text-white">GitHub</a>
            </nav>
          </div>
        </header>

        {children}

        <footer className="mt-12 border-t border-white/20 bg-white/60 backdrop-blur dark:bg-brand-900/60">
          <div className="mx-auto max-w-6xl px-4 py-10 text-xs text-slate-500 dark:text-slate-400">
            © {new Date().getFullYear()} TickerPulse • Free PWA • No data collected
          </div>
        </footer>
      </body>
    </html>
  );
}
