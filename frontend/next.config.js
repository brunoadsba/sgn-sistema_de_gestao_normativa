/** @type {import("next").NextConfig} */
module.exports = {
  // Turbopack para desenvolvimento
  turbopack: {
    root: "/home/brunoadsba/sgn/frontend"
  },
  
  // 🚀 OTIMIZAÇÕES EMPRESARIAIS
  experimental: {
    // Otimização de imports de bibliotecas
    optimizePackageImports: [
      '@radix-ui/react-avatar',
      '@radix-ui/react-navigation-menu', 
      '@radix-ui/react-separator',
      '@radix-ui/react-slot',
      '@radix-ui/react-toast',
      'lucide-react'
    ]
    // 🔧 REMOVIDO: turbotrace (não suportado no Next.js 15.5.2)
  },
  
  // Compilador otimizado
  compiler: {
    // Remove console.log em produção
    removeConsole: process.env.NODE_ENV === 'production',
    // Minificação otimizada
    styledComponents: false
  },
  
  // Performance e headers
  poweredByHeader: false,
  compress: true,
  
  // Bundle splitting otimizado
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization.splitChunks.cacheGroups = {
        ...config.optimization.splitChunks.cacheGroups,
        // Chunk separado para UI components
        ui: {
          name: 'ui',
          chunks: 'all',
          test: /[\\/]node_modules[\\/](@radix-ui|lucide-react)[\\/]/,
          priority: 40,
          reuseExistingChunk: true
        },
        // Chunk para Supabase
        supabase: {
          name: 'supabase',
          chunks: 'all', 
          test: /[\\/]node_modules[\\/]@supabase[\\/]/,
          priority: 30,
          reuseExistingChunk: true
        }
      }
    }
    return config
  },

  // Headers de performance
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options', 
            value: 'DENY'
          }
        ]
      }
    ]
  },

  // Imagens otimizadas
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: false
  }
}
