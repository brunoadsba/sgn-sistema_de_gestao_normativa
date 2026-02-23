import { test, expect } from '@playwright/test'

test.describe('Página NR-6 — Análise de EPIs', () => {
  test.beforeEach(async ({ page }) => {
    // Bypass splash screen
    await page.addInitScript(() => {
      window.localStorage.setItem('sgn.opening.seen.device', '1')
    })
    await page.goto('/nr6')
  })

  test('exibe o título da página', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: 'MVP NR-6 - Análise de EPIs' })
    ).toBeVisible()
  })

  test('exibe a descrição da página', async ({ page }) => {
    await expect(
      page.getByText('Análise especializada de conformidade com a NR-6')
    ).toBeVisible()
  })

  test('exibe o formulário de análise com campos obrigatórios', async ({ page }) => {
    await expect(page.getByText('Analisar Documento')).toBeVisible()
    await expect(page.getByText('Tipo de Documento')).toBeVisible()
    await expect(
      page.getByPlaceholder('Cole aqui o conteúdo do documento para análise...')
    ).toBeVisible()
  })

  test('exibe botão de análise', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Analisar com NR-6/i })).toBeVisible()
  })

  test('exibe erro ao enviar sem preencher os campos', async ({ page }) => {
    await page.getByRole('button', { name: /Analisar com NR-6/i }).click()
    await expect(page.getByText('Preencha todos os campos obrigatórios')).toBeVisible()
  })

  test('exibe as opções do seletor de tipo de documento', async ({ page }) => {
    await page.getByRole('combobox').click()
    await expect(page.getByText('Ficha de Entrega de EPI')).toBeVisible()
    await expect(page.getByText('Treinamento de EPI')).toBeVisible()
    await expect(page.getByText('Inspeção de EPI')).toBeVisible()
  })
})
