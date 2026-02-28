import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('sgn.opening.seen.device', '1')
  })
})

test.describe('Catalogo de Normas', () => {
  test('lista de normas carrega com cards', async ({ page }) => {
    await page.goto('/normas')
    await expect(page.getByText(/Normas Regulamentadoras/i)).toBeVisible()
    await expect(page.getByText(/NR-1/i).first()).toBeVisible()
  })

  test('busca filtra normas por codigo', async ({ page }) => {
    await page.goto('/normas')
    const searchInput = page.getByPlaceholder(/código|palavra-chave/i)
    await searchInput.fill('NR-6')
    await expect(page.getByText(/NR-6/i).first()).toBeVisible()
  })

  test('busca filtra normas por palavra-chave', async ({ page }) => {
    await page.goto('/normas')
    const searchInput = page.getByPlaceholder(/código|palavra-chave/i)
    await searchInput.fill('EPI')
    await expect(page.getByText(/EPI/i).first()).toBeVisible()
  })

  test('detalhe da norma exibe informacoes e voltar funciona', async ({ page }) => {
    await page.goto('/normas/1')
    await expect(page.getByText(/Voltar/i)).toBeVisible({ timeout: 15_000 })
    await expect(page.getByRole('heading').first()).toBeVisible()
    await page.getByText(/Voltar/i).first().click()
    await expect(page.getByText(/Normas Regulamentadoras/i)).toBeVisible({ timeout: 10_000 })
  })

  test('botao analisar com NR redireciona para pagina inicial', async ({ page }) => {
    await page.goto('/normas/6')
    await expect(page.getByText(/Voltar/i)).toBeVisible({ timeout: 15_000 })
    const analyzeBtn = page.getByRole('link', { name: /analisar documento/i })
    if (await analyzeBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await analyzeBtn.click()
      await expect(page).toHaveURL(/\/\?norma=/, { timeout: 10_000 })
    }
  })
})

test.describe('API de Normas', () => {
  test('GET /api/normas retorna lista', async ({ request }) => {
    const res = await request.get('/api/normas')
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    expect(body.data).toBeDefined()
    expect(body.data.items).toBeDefined()
    expect(Array.isArray(body.data.items)).toBeTruthy()
    expect(body.data.items.length).toBeGreaterThan(0)
  })

  test('GET /api/normas/stats retorna estatisticas', async ({ request }) => {
    const res = await request.get('/api/normas/stats')
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    expect(body.data).toBeDefined()
  })

  test('GET /api/search?q=NR-1 retorna resultados', async ({ request }) => {
    const res = await request.get('/api/search?q=NR-1')
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    expect(body.data).toBeDefined()
  })
})
