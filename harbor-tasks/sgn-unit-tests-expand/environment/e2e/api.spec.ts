import { test, expect } from '@playwright/test'

test.describe('APIs — Smoke Tests', () => {
  test('GET /api/health retorna status de saúde', async ({ request }) => {
    const response = await request.get('/api/health')
    expect(response.status()).toBe(200)
    const body = await response.json()
    expect(body).toHaveProperty('status')
  })

  test('GET /api/normas retorna lista de normas', async ({ request }) => {
    const response = await request.get('/api/normas')
    expect(response.status()).toBe(200)
    const body = await response.json()
    expect(body.success).toBe(true)
    expect(Array.isArray(body.data)).toBe(true)
    expect(body.data.length).toBeGreaterThan(0)
  })

  test('GET /api/normas/stats retorna estatísticas', async ({ request }) => {
    const response = await request.get('/api/normas/stats')
    expect(response.status()).toBe(200)
    const body = await response.json()
    expect(body.success).toBe(true)
  })

  test('POST /api/ia/analisar-conformidade valida entrada inválida com 400', async ({
    request,
  }) => {
    const response = await request.post('/api/ia/analisar-conformidade', {
      data: { documento: '', tipoDocumento: '' },
    })
    expect(response.status()).toBe(400)
  })

  test('GET /api/search sem query retorna resultado vazio ou erro controlado', async ({
    request,
  }) => {
    const response = await request.get('/api/search?q=')
    expect([200, 400]).toContain(response.status())
  })
})
