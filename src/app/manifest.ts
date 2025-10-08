import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SGN - Sistema de Gestão Normativa',
    short_name: 'SGN',
    description: 'Sistema empresarial para monitoramento de normas regulamentadoras',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#1e40af',
    orientation: 'portrait',
    categories: ['business', 'productivity'],
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      }
    ],
    // 🚀 PERFORMANCE PWA
    prefer_related_applications: false,
    shortcuts: [
      {
        name: 'Dashboard',
        short_name: 'Home',
        description: 'Acessar dashboard principal',
        url: '/',
        icons: [{ src: '/favicon.ico', sizes: '192x192' }]
      },
      {
        name: 'Normas',
        short_name: 'Normas',
        description: 'Explorar normas',
        url: '/normas',
        icons: [{ src: '/favicon.ico', sizes: '192x192' }]
      }
    ]
  }
}
