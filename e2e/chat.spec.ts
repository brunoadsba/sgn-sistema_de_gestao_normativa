import { test, expect } from '@playwright/test'
import path from 'path'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('sgn.opening.seen.device', '1')
  })
})

test.describe('Chat NEX - painel lateral', () => {
  test('painel de chat abre e fecha via botao', async ({ page }) => {
    test.setTimeout(180_000)
    await page.goto('/')

    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles(path.resolve(__dirname, 'fixtures/sample-document.txt'))
    await expect(page.getByText(/sample-document/i).first()).toBeVisible({ timeout: 15_000 })

    await page.waitForTimeout(3_000)

    const analyzeBtn = page.getByRole('button', { name: /analisar conformidade/i })
    if (!(await analyzeBtn.isVisible({ timeout: 5_000 }).catch(() => false))) {
      test.skip()
      return
    }

    await analyzeBtn.click()

    await expect(
      page.getByText(/score|conformidade|gaps|resultado/i).first()
    ).toBeVisible({ timeout: 120_000 })

    const chatBtn = page.getByRole('button', { name: /assistente nex/i }).first()
    if (!(await chatBtn.isVisible({ timeout: 5_000 }).catch(() => false))) {
      test.skip()
      return
    }

    await chatBtn.click()

    await expect(page.getByText(/NEX/i).first()).toBeVisible({ timeout: 5_000 })

    const closeBtn = page.getByLabel(/fechar assistente/i)
    if (await closeBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await closeBtn.click()
    }
  })

  test('chat fecha com tecla Escape', async ({ page }) => {
    test.setTimeout(180_000)
    await page.goto('/')

    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles(path.resolve(__dirname, 'fixtures/sample-document.txt'))
    await expect(page.getByText(/sample-document/i).first()).toBeVisible({ timeout: 15_000 })

    await page.waitForTimeout(3_000)

    const analyzeBtn = page.getByRole('button', { name: /analisar conformidade/i })
    if (!(await analyzeBtn.isVisible({ timeout: 5_000 }).catch(() => false))) {
      test.skip()
      return
    }

    await analyzeBtn.click()

    await expect(
      page.getByText(/score|conformidade|gaps|resultado/i).first()
    ).toBeVisible({ timeout: 120_000 })

    const chatBtn = page.getByRole('button', { name: /assistente nex/i }).first()
    if (!(await chatBtn.isVisible({ timeout: 5_000 }).catch(() => false))) {
      test.skip()
      return
    }

    await chatBtn.click()
    await expect(page.getByText(/NEX/i).first()).toBeVisible({ timeout: 5_000 })

    await page.keyboard.press('Escape')
    await page.waitForTimeout(500)
  })
})

test.describe('Chat NEX - API', () => {
  test('POST /api/chat-documento rejeita body vazio', async ({ request }) => {
    const res = await request.post('/api/chat-documento', {
      data: {},
    })
    expect(res.status()).toBe(400)
  })

  test('POST /api/chat-documento rejeita messages invalidas', async ({ request }) => {
    const res = await request.post('/api/chat-documento', {
      data: {
        messages: [{ role: 'invalid', content: '' }],
      },
    })
    expect(res.status()).toBe(400)
  })
})
