// 🚀 SERVICE WORKER EMPRESARIAL - CACHE AGRESSIVO
const CACHE_NAME = 'sgn-v1.0.0'
const STATIC_CACHE = 'sgn-static-v1'
const API_CACHE = 'sgn-api-v1'

// Assets críticos para cache imediato (apenas URLs válidas)
const CRITICAL_ASSETS = [
  '/',
  '/normas',
  '/empresas'
]

// APIs para cache com estratégia
const API_ROUTES = [
  '/api/normas',
  '/api/empresas',
  '/api/conformidade/dashboard'
]

// 🚀 INSTALAÇÃO - CACHE CRÍTICO COM VALIDAÇÃO
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      // Validar URLs antes de cachear
      const validUrls = CRITICAL_ASSETS.filter(url => {
        try {
          new URL(url, self.location.origin)
          return true
        } catch (error) {
          console.warn(`URL inválida ignorada: ${url}`)
          return false
        }
      })
      
      return cache.addAll(validUrls).catch(error => {
        console.warn('Erro ao cachear assets:', error)
        // Continuar mesmo com erro
        return Promise.resolve()
      })
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

// 🚀 FETCH - ESTRATÉGIAS DE CACHE CORRIGIDAS
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Cache First para assets estáticos
  if (request.destination === 'script' || request.destination === 'style') {
    event.respondWith(
      caches.match(request).then((response) => {
        return response || fetch(request).then((fetchResponse) => {
          // Clonar ANTES de usar
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
      fetch(request).then((fetchResponse) => {
        // Clonar ANTES de usar
        if (fetchResponse.status === 200) {
          const responseClone = fetchResponse.clone()
          caches.open(API_CACHE).then((cache) => {
            cache.put(request, responseClone)
          })
        }
        return fetchResponse
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
        // Clonar ANTES de usar
        const responseClone = fetchResponse.clone()
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseClone)
        })
        return fetchResponse
      })
      return response || fetchPromise
    })
  )
})
