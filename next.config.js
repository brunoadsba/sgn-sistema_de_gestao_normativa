/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker
  output: 'standalone',
  
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  experimental: {
    optimizePackageImports: ['groq-sdk'],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },
  // Módulos que não devem ser bundlados pelo webpack no server-side
  // better-sqlite3: módulo nativo Node.js
  // mammoth: leitura de DOCX, depende de Node.js fs
  // pdf-parse: extração de texto de PDFs, depende de Node.js fs
  serverExternalPackages: ['better-sqlite3', 'mammoth', 'pdf-parse'],
  
  // Security headers
  async headers() {
    const isProduction = process.env.NODE_ENV === 'production';
    
    // CSP nonce gerado com crypto para segurança
    const crypto = require('crypto');
    const cspNonce = `'nonce-${crypto.randomBytes(16).toString('base64')}'`;
    
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
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS, PATCH' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization, X-Correlation-ID, X-Requested-With' },
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Max-Age', value: '86400' },
          
          // Security headers
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
          
          // API Security
          { key: 'X-API-Version', value: '1.0' },
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
          
          // CSP headers (melhorado)
          { 
            key: 'Content-Security-Policy', 
            value: isProduction
              ? `default-src 'self'; script-src 'self' ${cspNonce}; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https: data:; connect-src 'self' https:; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests;`
              : `default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https: data:; connect-src 'self' ws: wss: https:; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self';`
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
