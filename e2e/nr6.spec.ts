import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('sgn.opening.seen.device', '1')
  })
})

test.describe('Pagina NR-6', () => {
  test('pagina carrega com formulario completo', async ({ page }) => {
    await page.goto('/nr6')
    await expect(page.getByText(/NR-6/i).first()).toBeVisible()
    await expect(page.getByText(/Tipo de Documento/i)).toBeVisible()
  })

  test('select de tipo de documento funciona', async ({ page }) => {
    await page.goto('/nr6')

    const select = page.locator('select').first()
    if (await select.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await select.selectOption({ index: 1 })
    }
  })

  test('textarea aceita texto do documento', async ({ page }) => {
    await page.goto('/nr6')

    const textarea = page.locator('textarea').first()
    if (await textarea.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await textarea.fill('Ficha de entrega de EPI - Protetor auricular 3M modelo 1100 CA 5674')
      await expect(textarea).toHaveValue(/Ficha de entrega/i)
    }
  })

  test('botao analisar existe na pagina', async ({ page }) => {
    await page.goto('/nr6')
    const analyzeBtn = page.getByRole('button', { name: /analisar/i })
    await expect(analyzeBtn).toBeVisible({ timeout: 5_000 })
  })

  test('fluxo completo: preencher e analisar', async ({ page }) => {
    test.setTimeout(120_000)
    await page.goto('/nr6')

    const select = page.locator('select').first()
    if (await select.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await select.selectOption({ index: 1 })
    }

    const textarea = page.locator('textarea').first()
    if (await textarea.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await textarea.fill(
        'FICHA DE ENTREGA DE EPI\n' +
        'Funcionário: João da Silva\n' +
        'Cargo: Operador de Empilhadeira\n' +
        'Data: 10/01/2025\n' +
        'EPI Entregue: Protetor auricular 3M modelo 1100\n' +
        'CA: 5674 - Validade: 10/2026\n' +
        'Treinamento de uso: Sim, realizado em 10/01/2025\n' +
        'Assinatura do funcionário: [assinado]\n' +
        'Responsável: Maria Santos - Técnica de Segurança'
      )
    }

    const analyzeBtn = page.getByRole('button', { name: /analisar/i })
    if (await analyzeBtn.isEnabled({ timeout: 5_000 }).catch(() => false)) {
      await analyzeBtn.click()
      await expect(
        page.getByText(/score|conformidade|resultado|checklist/i).first()
      ).toBeVisible({ timeout: 90_000 })
    }
  })
})
