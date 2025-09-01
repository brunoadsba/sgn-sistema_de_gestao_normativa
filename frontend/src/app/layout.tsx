import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { DynamicToaster } from "@/components/dynamic/DynamicComponents";
import Script from "next/script";

// 🚀 OTIMIZAÇÃO: Font com display swap
const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial']
});

export const metadata = {
  title: "SGN - Sistema de Gestão Normativa",
  description: "Sistema para monitoramento de normas regulamentadoras",
  manifest: '/manifest.json',
  // 🔧 REMOVIDO: metadata deprecated
};

// 🚀 VIEWPORT CORRETO (Next.js 15)
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#1e40af'
}

export const revalidate = 300;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" data-scroll-behavior="smooth">
      <head>
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="preconnect" href="//fonts.gstatic.com" crossOrigin="" />
        <link rel="apple-touch-icon" href="/favicon.ico" />
        {/* 🔧 REMOVIDO: meta deprecated */}
      </head>
      <body className={inter.className}>
        <Script
          id="register-sw"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('✅ SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('❌ SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />

        {/* Header (sem componentes client) */}
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

              <nav className="flex items-center space-x-2">
                <Link
                  href="/"
                  className="px-3 py-2 text-sm rounded-md border hover:bg-gray-50"
                >
                  Dashboard
                </Link>
                <Link
                  href="/normas"
                  className="px-3 py-2 text-sm rounded-md border hover:bg-gray-50"
                >
                  Normas
                </Link>
              </nav>
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="min-h-screen bg-gray-50">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t py-8">
          <div className="container mx-auto px-4">
            <div className="text-center text-sm text-muted-foreground">
              <p>&copy; 2024 SGN - Sistema de Gestão Normativa. Todos os direitos reservados.</p>
            </div>
          </div>
        </footer>

        {/* Toaster dinâmico */}
        <DynamicToaster />
      </body>
    </html>
  );
}
