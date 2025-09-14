// 🚀 SERVICE WORKER SIMPLIFICADO - CACHE BÁSICO
const CACHE_NAME = 'sgn-v1.0.1'

// 🚀 INSTALAÇÃO - CACHE SIMPLES
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Instalando...')
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('✅ Service Worker: Cache aberto')
      return cache.addAll([
        '/',
        '/normas',
        '/empresas'
      ]).catch(() => {
        console.warn('⚠️ Service Worker: Erro ao cachear assets')
        return Promise.resolve()
      })
    })
  )
  self.skipWaiting()
})

// 🚀 ATIVAÇÃO - LIMPEZA DE CACHE ANTIGO
self.addEventListener('activate', (event) => {
  console.log('🔄 Service Worker: Ativando...')
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Service Worker: Removendo cache antigo:', cacheName)
            return caches.delete(cacheName)
          }
          return Promise.resolve()
        })
      )
    })
  )
  self.clients.claim()
  console.log('✅ Service Worker: Ativado e controlando clientes')
})

// 🚀 FETCH - ESTRATÉGIA SIMPLES
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Apenas para requisições GET
  if (request.method !== 'GET') {
    return
  }

  // Network First para APIs
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).then((response) => {
        // Cache apenas respostas bem-sucedidas
        if (response.status === 200) {
          const responseClone = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
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

  // Cache First para páginas e assets
  event.respondWith(
    caches.match(request).then((response) => {
      if (response) {
        return response
      }
      
      return fetch(request).then((fetchResponse) => {
        // Cache apenas respostas bem-sucedidas
        if (fetchResponse.status === 200) {
          const responseClone = fetchResponse.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone)
          })
        }
        return fetchResponse
      })
    })
  )
})
