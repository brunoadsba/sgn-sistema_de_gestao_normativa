import { test, expect, type Page } from '@playwright/test'

test.describe('Navegação Global', () => {
  const abrirMenu = async (page: Page) => {
    const botaoMenu = page.locator('header').getByRole('button').first()
    await botaoMenu.click()
  }

  test.beforeEach(async ({ page }) => {
    // Bypass splash screen
    await page.addInitScript(() => {
      window.localStorage.setItem('sgn.opening.seen.device', '1')
    })
  })
  test('logo leva à página inicial', async ({ page }) => {
    await page.goto('/normas')
    await page.getByRole('link', { name: /Gestão Normativa|SGN/i }).first().click()
    await expect(page).toHaveURL('/')
  })

  test('link Analisar na nav leva à página inicial', async ({ page }) => {
    await page.goto('/normas')
    await abrirMenu(page)
    await page.getByRole('link', { name: 'Analisar' }).click()
    await expect(page).toHaveURL('/')
    await expect(page.getByRole('heading', { name: 'Análise de Conformidade' })).toBeVisible()
  })

  test('link Normas na nav leva à página de normas', async ({ page }) => {
    await page.goto('/')
    await abrirMenu(page)
    await page.getByRole('link', { name: 'Normas' }).click()
    await expect(page).toHaveURL('/normas')
    await expect(
      page.getByRole('heading', { name: 'Normas Regulamentadoras' })
    ).toBeVisible()
  })

  test('header está visível e fixo em todas as páginas', async ({ page }) => {
    for (const rota of ['/', '/normas', '/nr6']) {
      await page.goto(rota)
      await abrirMenu(page)
      await expect(page.getByRole('link', { name: 'Analisar' })).toBeVisible()
      await expect(page.getByRole('link', { name: 'Normas' })).toBeVisible()
    }
  })
})
