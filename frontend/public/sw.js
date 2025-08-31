// 🚀 SERVICE WORKER EMPRESARIAL - CACHE AGRESSIVO
const CACHE_NAME = 'sgn-v1.0.0'
const STATIC_CACHE = 'sgn-static-v1'
const API_CACHE = 'sgn-api-v1'

// Assets críticos para cache imediato
const CRITICAL_ASSETS = [
  '/',
  '/normas',
  '/empresas',
  '/_next/static/css/app/layout.css',
  '/_next/static/chunks/webpack.js'
]

// APIs para cache com estratégia
const API_ROUTES = [
  '/api/normas',
  '/api/empresas',
  '/api/conformidade/dashboard'
]

// 🚀 INSTALAÇÃO - CACHE CRÍTICO
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(CRITICAL_ASSETS)
    })
  )
  self.skipWaiting()
})

// 🚀 ATIVAÇÃO - LIMPEZA DE CACHE ANTIGO
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE && cacheName !== API_CACHE) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  self.clients.claim()
})

// 🚀 FETCH - ESTRATÉGIAS DE CACHE
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Cache First para assets estáticos
  if (request.destination === 'script' || request.destination === 'style') {
    event.respondWith(
      caches.match(request).then((response) => {
        return response || fetch(request).then((fetchResponse) => {
          const responseClone = fetchResponse.clone()
          caches.open(STATIC_CACHE).then((cache) => {
            cache.put(request, responseClone)
          })
          return fetchResponse
        })
      })
    )
    return
  }

  // Network First para APIs (com fallback)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).then((response) => {
        // Cache successful responses
        if (response.status === 200) {
          const responseClone = response.clone()
          caches.open(API_CACHE).then((cache) => {
            cache.put(request, responseClone)
          })
        }
        return response
      }).catch(() => {
        // Fallback para cache se network falhar
        return caches.match(request)
      })
    )
    return
  }

  // Stale While Revalidate para páginas
  event.respondWith(
    caches.match(request).then((response) => {
      const fetchPromise = fetch(request).then((fetchResponse) => {
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, fetchResponse.clone())
        })
        return fetchResponse
      })
      return response || fetchPromise
    })
  )
})
