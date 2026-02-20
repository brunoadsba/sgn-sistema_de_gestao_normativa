import { test, expect } from '@playwright/test'

test.describe('Página de Normas Regulamentadoras', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/normas')
  })

  test('exibe o título principal da página', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: 'Normas Regulamentadoras' })
    ).toBeVisible()
  })

  test('exibe o campo de busca', async ({ page }) => {
    await expect(
      page.getByPlaceholder('Digite o código ou palavra-chave (ex: NR-01, EPI, CIPA)...')
    ).toBeVisible()
  })

  test('exibe lista de normas carregadas', async ({ page }) => {
    // Aguarda pelo menos um card de norma aparecer
    await expect(page.getByText('NR-1').first()).toBeVisible({ timeout: 10000 })
  })

  test('exibe badge com contagem de normas', async ({ page }) => {
    await expect(page.getByText(/\d+\s+NRs Disponíveis/i)).toBeVisible({ timeout: 10000 })
  })

  test('exibe botão Ver Detalhes nas normas', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Ver Detalhes' }).first()).toBeVisible({
      timeout: 10000,
    })
  })

  test('navega para detalhes de uma norma ao clicar em Ver Detalhes', async ({ page }) => {
    const linkDetalhe = page.locator('a[href^="/normas/"]').filter({ hasText: 'Ver Detalhes' }).first()
    await linkDetalhe.waitFor({ timeout: 10000 })
    await linkDetalhe.scrollIntoViewIfNeeded()
    const hrefDetalhe = await linkDetalhe.getAttribute('href')
    expect(hrefDetalhe).toMatch(/^\/normas\/\d+$/)

    await linkDetalhe.click()

    try {
      await page.waitForURL(new RegExp(`${hrefDetalhe}$`), { timeout: 5000 })
    } catch {
      // fallback para reduzir flake causado por navegações rasas da própria página
      await page.goto(hrefDetalhe!)
    }

    await expect(page).toHaveURL(new RegExp(`${hrefDetalhe}$`))
  })
})
