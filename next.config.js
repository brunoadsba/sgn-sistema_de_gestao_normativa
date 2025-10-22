/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker
  output: 'standalone',
  
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    optimizePackageImports: ['@supabase/supabase-js', 'groq-sdk'],
  },
  images: {
    domains: ['kqdilsmgjlgmqcoubpel.supabase.co'],
  },
  
  // Security headers
  async headers() {
    const isProduction = process.env.NODE_ENV === 'production';
    
    return [
      {
        source: '/api/:path*',
        headers: [
          // CORS headers
          { 
            key: 'Access-Control-Allow-Origin', 
            value: isProduction 
              ? 'https://sgn.vercel.app' 
              : 'http://localhost:3001' 
          },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization, X-Correlation-ID' },
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          
          // Security headers
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
          
          // Rate limiting headers
          { key: 'X-RateLimit-Limit', value: '100' },
          { key: 'X-RateLimit-Remaining', value: '99' },
          { key: 'X-RateLimit-Reset', value: '1640995200' },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          // Security headers
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
          
          // CSP headers
          { 
            key: 'Content-Security-Policy', 
            value: isProduction
              ? "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https:; connect-src 'self' https:; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self';"
              : "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https:; connect-src 'self' ws: wss: https:; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self';"
          },
          
          // HSTS (apenas em produção)
          ...(isProduction ? [
            { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' }
          ] : []),
          
          // Cross-Origin headers
          { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
        ],
      },
    ]
  },
  
  // Environment variables validation
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // Compression
  compress: true,
  
  // Power by header
  poweredByHeader: false,
  
  // Trailing slash
  trailingSlash: false,
  
  // Redirects for production
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/empresas',
        permanent: false,
      },
    ]
  },
}

module.exports = nextConfig
