import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

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
        {/* Header */}
        <header className="border-b bg-white sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <Link href="/" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">SGN</span>
                  </div>
                  <div>
                    <h1 className="font-bold text-lg">Sistema de Gestão Normativa</h1>
                    <p className="text-xs text-muted-foreground">Monitoramento de Normas Regulamentadoras</p>
                  </div>
                </Link>
              </div>

              <nav className="flex items-center space-x-4">
                <Link href="/">
                  <Button variant="ghost">Dashboard</Button>
                </Link>
                <Link href="/normas">
                  <Button variant="ghost">Normas</Button>
                </Link>
              </nav>
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
        <Toaster />
      </body>
    </html>
  );
}
