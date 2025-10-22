import { Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/lib/cache/query-client";

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
});

export const metadata = {
  title: "SGN - Sistema de Gestão Normativa",
  description: "Sistema para monitoramento de normas regulamentadoras",
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
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">SGN</span>
                </div>
                <div>
                  <h1 className="font-bold text-lg">Sistema de Gestão Normativa</h1>
                  <p className="text-xs text-muted-foreground">Monitoramento de Normas Regulamentadoras</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <a 
                  href="/" 
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  Dashboard
                </a>
                <a 
                  href="/normas" 
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  Normas
                </a>
                <a 
                  href="/empresas" 
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  Empresas
                </a>
                <a 
                  href="/performance" 
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  Performance
                </a>
                <a 
                  href="/security" 
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  Segurança
                </a>
              </div>
            </div>
          </div>
        </header>

        <main className="min-h-screen bg-gray-50">
          <QueryProvider>
            {children}
          </QueryProvider>
        </main>

        <footer className="bg-white border-t py-8">
          <div className="container mx-auto px-4">
            <div className="text-center text-sm text-muted-foreground">
              <p>&copy; 2025 SGN - Sistema de Gestão Normativa. Todos os direitos reservados.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}