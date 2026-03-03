import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('sgn.opening.seen.device', '1')
  })
})

test.describe('Chat NEX - popup', () => {
  test('botao abre nova janela com chat', async ({ page, context }) => {
    await page.goto('/')

    const [popup] = await Promise.all([
      context.waitForEvent('page'),
      page.getByRole('button', { name: /assistente nex/i }).first().click(),
    ])

    await expect(popup).toHaveURL(/\/chat/)
    await expect(popup.getByRole('textbox', { name: /mensagem para o assistente/i })).toBeVisible({ timeout: 5_000 })

    const closeBtn = popup.getByLabel(/fechar janela/i)
    await closeBtn.click()
    await expect.poll(() => popup.isClosed()).toBe(true)
  })

  test('composer exibe estados corretos dos controles', async ({ page, context }) => {
    await page.goto('/')

    const [popup] = await Promise.all([
      context.waitForEvent('page'),
      page.getByRole('button', { name: /assistente nex/i }).first().click(),
    ])

    await expect(popup).toHaveURL(/\/chat/)
    await expect(popup.getByTestId('chat-action-attach')).toHaveAttribute('aria-disabled', 'false')
    await expect(popup.getByTestId('chat-action-model')).toHaveAttribute('aria-disabled', 'true')
    await expect(popup.getByTestId('chat-action-voice')).toHaveAttribute('aria-disabled', 'true')
    await expect(popup.getByTestId('chat-action-mode')).toBeDisabled()
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
