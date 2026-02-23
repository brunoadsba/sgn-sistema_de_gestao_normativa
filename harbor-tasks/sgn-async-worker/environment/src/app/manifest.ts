import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SGN - Sistema de Gestão Normativa',
    short_name: 'SGN',
    description: 'Sistema empresarial para monitoramento de normas regulamentadoras',
    start_url: '/',
    display: 'standalone',
    background_color: '#050b1b',
    theme_color: '#050b1b',
    orientation: 'portrait',
    categories: ['business', 'productivity'],
    icons: [
      {
        src: '/icon',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
    // 🚀 PERFORMANCE PWA
    prefer_related_applications: false,
    shortcuts: [
      {
        name: 'Dashboard',
        short_name: 'Home',
        description: 'Acessar dashboard principal',
        url: '/',
        icons: [{ src: '/icon', sizes: '512x512', type: 'image/png' }]
      },
      {
        name: 'Normas',
        short_name: 'Normas',
        description: 'Explorar normas',
        url: '/normas',
        icons: [{ src: '/icon', sizes: '512x512', type: 'image/png' }]
      }
    ]
  }
}
