import localFont from "next/font/local";
import type { Metadata } from "next";
import "./globals.css";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { CanvasBackgroundShell } from "@/components/ui/CanvasBackgroundShell";
import { SessionSplashGate } from "@/components/loading/SessionSplashGate";
import { AppShell } from "@/components/layout/AppShell";
import { Toaster } from "@/components/ui/toaster";
import { ChatProvider } from "@/features/chat-documento/context/ChatContext";

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
            <ChatProvider>
              <AppShell>{children}</AppShell>
              <Toaster />
            </ChatProvider>
          </SessionSplashGate>
        </NuqsAdapter>
      </body>
    </html>
  );
}
