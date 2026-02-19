import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { CanvasBackground } from "@/components/ui/CanvasBackground";

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
      <body className={`${inter.className} min-h-screen font-sans antialiased relative`}>
        <CanvasBackground />
        
        <header className="sticky top-0 z-50 w-full border-b border-white/20 bg-white/60 backdrop-blur-md shadow-sm">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
                <span className="text-white font-bold tracking-tight">SGN</span>
              </div>
              <span className="font-bold text-gray-900 tracking-tight hidden sm:inline group-hover:text-blue-600 transition-colors">
                Gestão Normativa
              </span>
            </Link>

            <nav className="flex items-center gap-2">
              <Link
                href="/"
                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-blue-600 hover:bg-blue-50/50 rounded-full transition-all"
              >
                Analisar
              </Link>
              <Link
                href="/normas"
                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-blue-600 hover:bg-blue-50/50 rounded-full transition-all"
              >
                Normas
              </Link>
            </nav>
          </div>
        </header>

        <main className="min-h-[calc(100vh-4rem)] relative z-10 py-10">
          {children}
        </main>
      </body>
    </html>
  );
}
