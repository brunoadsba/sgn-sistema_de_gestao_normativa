import { Inter } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { CanvasBackgroundShell } from "@/components/ui/CanvasBackgroundShell";
import { SessionSplashGate } from "@/components/loading/SessionSplashGate";

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "SGN - Sistema de Gestão Normativa",
  description: "Análise de conformidade com IA para normas regulamentadoras de SST",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/icon", sizes: "512x512", type: "image/png" }],
    apple: [{ url: "/apple-icon", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    title: "SGN",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark" data-scroll-behavior="smooth">
      <body className={`${inter.className} min-h-screen font-sans antialiased relative`}>
        <NuqsAdapter>
          <CanvasBackgroundShell />
          <SessionSplashGate>
            <header className="sticky top-0 z-50 w-full border-b border-white/10 dark:border-gray-800/80 bg-white/60 dark:bg-gray-950/80 backdrop-blur-md shadow-sm dark:shadow-black/30">
              <div className="container mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between gap-2">
                <Link href="/" className="flex items-center gap-3 group">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
                    <span className="text-white font-bold tracking-tight">SGN</span>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-gray-100 tracking-tight hidden md:inline group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    Gestão Normativa
                  </span>
                </Link>

                <nav className="flex items-center gap-1 sm:gap-2">
                  <Link
                    href="/"
                    className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/50 rounded-full transition-all whitespace-nowrap"
                  >
                    Analisar
                  </Link>
                  <Link
                    href="/normas"
                    className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/50 rounded-full transition-all whitespace-nowrap"
                  >
                    Normas
                  </Link>
                </nav>
              </div>
            </header>

            <main className="min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)] relative z-10 py-6 sm:py-10">
              {children}
            </main>
          </SessionSplashGate>
        </NuqsAdapter>
      </body>
    </html>
  );
}
