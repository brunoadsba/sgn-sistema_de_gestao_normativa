import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('sgn.opening.seen.device', '1')
  })
})

test.describe('Health e navegacao basica', () => {
  test('GET /api/health retorna status ok', async ({ request }) => {
    const res = await request.get('/api/health')
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    expect(body.status).toBe('ok')
    expect(body.services.api).toBe('ok')
    expect(body.services.database).toBe('ok')
  })

  test('pagina inicial carrega com titulo correto', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/SGN|Gestão Normativa/i)
    await expect(page.getByText('Envio do Documento')).toBeVisible()
  })

  test('navegacao para /normas funciona', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: /normas/i }).first().click()
    await expect(page).toHaveURL(/\/normas/)
    await expect(page.getByText(/Normas Regulamentadoras/i)).toBeVisible()
  })

  test('navegacao para /nr6 funciona', async ({ page }) => {
    await page.goto('/nr6')
    await expect(page.getByRole('heading', { name: /NR-6/i })).toBeVisible()
  })

  test('navegacao volta para pagina de analise', async ({ page }) => {
    await page.goto('/normas')
    await page.getByRole('link', { name: /analisar/i }).first().click()
    await expect(page).toHaveURL('/')
  })

  test('splash screen e exibida na primeira visita', async ({ page, context }) => {
    await context.clearCookies()
    await page.addInitScript(() => {
      localStorage.removeItem('sgn.opening.seen.device')
    })
    await page.goto('/')
    await expect(page.getByText(/Gestão Normativa/i).first()).toBeVisible()
  })
})
