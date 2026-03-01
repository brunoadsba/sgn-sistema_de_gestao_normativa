import localFont from "next/font/local";
import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { CanvasBackgroundShell } from "@/components/ui/CanvasBackgroundShell";
import { SessionSplashGate } from "@/components/loading/SessionSplashGate";
import { GlobalNav } from "@/components/navigation/GlobalNav";
import { Toaster } from "@/components/ui/toaster";
import { ChatProvider } from "@/features/chat-documento/context/ChatContext";
import { ChatSidePanel } from "@/features/chat-documento/components/ChatSidePanel";

const sgnSans = localFont({
  src: [
    {
      path: "./fonts/geist-latin.woff2",
      style: "normal",
    },
    {
      path: "./fonts/geist-latin-ext.woff2",
      style: "normal",
    },
  ],
  display: 'swap',
  fallback: ['system-ui', 'Arial', 'sans-serif'],
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
    <html lang="pt-BR" className="dark" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className={`${sgnSans.className} min-h-screen font-sans antialiased relative`}>
        <NuqsAdapter>
          <CanvasBackgroundShell />
          <SessionSplashGate>
            <header className="sticky top-0 z-50 w-full bg-white/60 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800 shadow-sm">
              <div className="container mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between gap-2">
                <Link href="/" className="flex items-center gap-3 group">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
                    <span className="text-white font-bold tracking-tight">SGN</span>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-gray-100 tracking-tight hidden md:inline group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    Gestão Normativa
                  </span>
                </Link>

                <GlobalNav />
              </div>
            </header>

            <main className="min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)] relative z-10 py-6 sm:py-10">
              <ChatProvider>
                {children}
                <ChatSidePanel />
              </ChatProvider>
            </main>
            <Toaster />
          </SessionSplashGate>
        </NuqsAdapter>
      </body>
    </html>
  );
}
