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
      page.getByPlaceholder('Buscar por código, título ou descrição...')
    ).toBeVisible()
  })

  test('exibe lista de normas carregadas', async ({ page }) => {
    // Aguarda pelo menos um card de norma aparecer
    await expect(page.getByText('NR-1').first()).toBeVisible({ timeout: 10000 })
  })

  test('exibe badge com contagem de normas', async ({ page }) => {
    // Badge mostra "X normas ativas"
    await expect(page.getByText(/normas ativas/)).toBeVisible({ timeout: 10000 })
  })

  test('exibe botão Ver Detalhes nas normas', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Ver Detalhes' }).first()).toBeVisible({
      timeout: 10000,
    })
  })

  test('navega para detalhes de uma norma ao clicar em Ver Detalhes', async ({ page }) => {
    const botao = page.getByRole('button', { name: 'Ver Detalhes' }).first()
    await botao.waitFor({ timeout: 10000 })
    await botao.click()
    await expect(page).toHaveURL(/\/normas\/\d+/)
  })
})
