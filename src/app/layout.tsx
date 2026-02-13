import { Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/lib/cache/query-client";
import Link from "next/link";

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
});

export const metadata = {
  title: "SGN - Sistema de Gestão Normativa",
  description: "Análise de conformidade com IA para normas regulamentadoras de SST",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <header className="border-b bg-white sticky top-0 z-50">
          <div className="container mx-auto px-4 h-14 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SGN</span>
              </div>
              <span className="font-semibold text-gray-900 hidden sm:inline">
                Gestão Normativa
              </span>
            </Link>

            <nav className="flex items-center gap-1">
              <Link
                href="/"
                className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                Analisar
              </Link>
              <Link
                href="/normas"
                className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                Normas
              </Link>
            </nav>
          </div>
        </header>

        <main className="min-h-[calc(100vh-3.5rem)] bg-gray-50">
          <QueryProvider>
            {children}
          </QueryProvider>
        </main>
      </body>
    </html>
  );
}
