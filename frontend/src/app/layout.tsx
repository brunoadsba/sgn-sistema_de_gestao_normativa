import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "SGN - Sistema de Gestão Normativa",
  description: "Sistema de monitoramento de normas regulamentadoras",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        {/* Header Global */}
        <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
          <div className="container mx-auto px-4">
            <div className="flex h-16 items-center justify-between">
              {/* Logo e Navegação */}
              <div className="flex items-center space-x-6">
                <Link href="/" className="flex items-center space-x-2">
                  <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">SGN</span>
                  </div>
                  <span className="font-semibold text-lg">Sistema de Gestão Normativa</span>
                </Link>
                
                <nav className="hidden md:flex items-center space-x-6">
                  <Link href="/" className="text-sm font-medium hover:text-blue-600">
                    Dashboard
                  </Link>
                  <Link href="/normas" className="text-sm font-medium hover:text-blue-600">
                    Normas
                  </Link>
                  <Link href="/estatisticas" className="text-sm font-medium hover:text-blue-600">
                    Relatórios
                  </Link>
                </nav>
              </div>

              {/* Busca Global */}
              <div className="flex items-center space-x-4">
                <div className="hidden sm:flex">
                  <Input 
                    placeholder="Buscar normas..." 
                    className="w-64"
                  />
                </div>
                <Badge variant="outline" className="text-xs">
                  v1.0
                </Badge>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="min-h-screen bg-gray-50/50">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t bg-white mt-12">
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="font-semibold mb-3">SGN</h3>
                <p className="text-sm text-muted-foreground">
                  Sistema de Gestão Normativa para monitoramento de regulamentações.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Recursos</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><Link href="/normas">Explorar Normas</Link></li>
                  <li><Link href="/api/export?format=csv">Exportar Dados</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Suporte</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>Documentação</li>
                  <li>API</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Status</h3>
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-muted-foreground">Sistema Operacional</span>
                </div>
              </div>
            </div>
            <Separator className="my-6" />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <p>© 2025 SGN. Todos os direitos reservados.</p>
              <p>Última atualização: {new Date().toLocaleDateString("pt-BR")}</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
