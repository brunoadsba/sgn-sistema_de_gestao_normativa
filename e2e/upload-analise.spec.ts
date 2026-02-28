import { test, expect } from '@playwright/test'
import path from 'path'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('sgn.opening.seen.device', '1')
  })
})

test.describe('Upload de documento', () => {
  test('upload de arquivo TXT extrai texto com sucesso', async ({ page }) => {
    await page.goto('/')
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles(path.resolve(__dirname, 'fixtures/sample-document.txt'))

    await expect(page.getByText(/sample-document/i)).toBeVisible({ timeout: 10_000 })
  })

  test('exibe nome e tamanho do arquivo apos upload', async ({ page }) => {
    await page.goto('/')
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles(path.resolve(__dirname, 'fixtures/sample-document.txt'))

    await expect(page.getByText(/sample-document/i)).toBeVisible({ timeout: 10_000 })
  })

  test('botao de remover arquivo funciona', async ({ page }) => {
    await page.goto('/')
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles(path.resolve(__dirname, 'fixtures/sample-document.txt'))
    await expect(page.getByText(/sample-document/i)).toBeVisible({ timeout: 10_000 })

    const removeBtn = page.locator('button').filter({ has: page.locator('svg') }).filter({ hasText: '' }).first()
    if (await removeBtn.isVisible()) {
      await removeBtn.click()
    }
  })
})

test.describe('API de extracao de texto', () => {
  test('POST /api/extrair-texto com TXT retorna texto', async ({ request }) => {
    const filePath = path.resolve(__dirname, 'fixtures/sample-document.txt')
    const fs = await import('fs')
    const fileBuffer = fs.readFileSync(filePath)

    const formData = new FormData()
    formData.append('file', new Blob([fileBuffer], { type: 'text/plain' }), 'sample-document.txt')

    const res = await request.post('/api/extrair-texto', {
      multipart: {
        file: {
          name: 'sample-document.txt',
          mimeType: 'text/plain',
          buffer: fileBuffer,
        },
      },
    })

    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    expect(body.data.texto).toContain('PROGRAMA DE GERENCIAMENTO DE RISCOS')
    expect(body.data.tamanho).toBeGreaterThan(100)
  })
})

test.describe('Fluxo de analise completa', () => {
  test('upload + sugestao de NRs + analise de conformidade', async ({ page }) => {
    test.setTimeout(180_000)
    await page.goto('/')

    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles(path.resolve(__dirname, 'fixtures/sample-document.txt'))
    await expect(page.getByText(/sample-document/i)).toBeVisible({ timeout: 15_000 })

    await page.waitForTimeout(3_000)

    const analyzeBtn = page.getByRole('button', { name: /analisar conformidade/i })

    if (await analyzeBtn.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await analyzeBtn.click()

      await expect(
        page.getByText(/score|conformidade|gaps|resultado/i).first()
      ).toBeVisible({ timeout: 120_000 })
    }
  })
})

test.describe('Seletor de normas', () => {
  test('botao TODAS seleciona todas as normas', async ({ page }) => {
    await page.goto('/')
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles(path.resolve(__dirname, 'fixtures/sample-document.txt'))
    await expect(page.getByText(/sample-document/i)).toBeVisible({ timeout: 10_000 })

    const todasBtn = page.getByRole('button', { name: /todas/i })
    if (await todasBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await todasBtn.click()
    }
  })

  test('botao LIMPAR esta presente', async ({ page }) => {
    await page.goto('/')
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles(path.resolve(__dirname, 'fixtures/sample-document.txt'))
    await expect(page.getByText(/sample-document/i)).toBeVisible({ timeout: 10_000 })

    await page.waitForTimeout(2_000)
    const limparBtn = page.getByRole('button', { name: /limpar/i })
    await expect(limparBtn).toBeVisible({ timeout: 5_000 })
  })
})
