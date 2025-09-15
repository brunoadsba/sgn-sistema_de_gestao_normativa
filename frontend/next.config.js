/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    optimizePackageImports: ['@supabase/supabase-js'],
  },
  // Configuração para Netlify com suporte a API routes
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
