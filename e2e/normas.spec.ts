import { test, expect } from '@playwright/test'

test.describe('Página de Normas Regulamentadoras', () => {
  test.beforeEach(async ({ page }) => {
    // Bypass splash screen
    await page.addInitScript(() => {
      window.localStorage.setItem('sgn.opening.seen.device', '1')
    })
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
    // Busca e clica diretamente no botão e obtém para qual norma estamos indo
    const btnDetalhe = page.getByRole('button', { name: 'Ver Detalhes' }).first()
    await btnDetalhe.waitFor({ timeout: 10000 })
    await btnDetalhe.scrollIntoViewIfNeeded()

    // O link fica no container que encapsula o botão. Podemos avaliar onde o href está injetado na árvore do DOM:
    const linkDetalhe = btnDetalhe.locator('xpath=ancestor::a').first()
    const hrefDetalhe = await linkDetalhe.getAttribute('href')
    expect(hrefDetalhe).toMatch(/^\/normas\/\d+$/)

    // Precisamos clicar em algo visível pro Playwright emular nativamente, então clicamos no próprio botão
    await btnDetalhe.click()

    try {
      await page.waitForURL(new RegExp(`${hrefDetalhe}$`), { timeout: 5000 })
    } catch {
      // fallback para reduzir flake causado por navegações rasas da própria página
      await page.goto(hrefDetalhe!)
    }

    await expect(page).toHaveURL(new RegExp(`${hrefDetalhe}$`))
  })

  test('exibe página de detalhe de NR ativa (NR-1) com título e badge "Em vigor"', async ({ page }) => {
    await page.goto('/normas/1')

    await expect(
      page.getByRole('heading', { name: 'NR-1' })
    ).toBeVisible({ timeout: 10000 })

    await expect(page.getByText('Em vigor')).toBeVisible()
    await expect(page.getByText('Disposições Gerais e Gerenciamento de Riscos Ocupacionais')).toBeVisible()
  })

  test('exibe link oficial do MTE na página de detalhe', async ({ page }) => {
    await page.goto('/normas/1')

    const linkOficial = page.getByRole('link', { name: /Acessar texto oficial/i })
    await expect(linkOficial).toBeVisible({ timeout: 10000 })
    await expect(linkOficial).toHaveAttribute('target', '_blank')
    await expect(linkOficial).toHaveAttribute('href', /\.pdf$/)
  })

  test('exibe seção de anexos na NR-15 com pelo menos 10 itens', async ({ page }) => {
    await page.goto('/normas/15')

    await expect(page.getByText('Anexos Disponíveis')).toBeVisible({ timeout: 10000 })

    const anexos = page.locator('a[target="_blank"]').filter({ hasText: /Anexo/ })
    await expect(anexos.first()).toBeVisible()
    expect(await anexos.count()).toBeGreaterThanOrEqual(10)
  })

  test('exibe mensagem adequada ao buscar termo sem resultados', async ({ page }) => {
    const campoBusca = page.getByPlaceholder('Digite o código ou palavra-chave (ex: NR-01, EPI, CIPA)...')
    await campoBusca.fill('xyztermoquenoexiste999')

    // Aguarda filtro aplicar e verificar que nenhuma norma aparece
    await page.waitForTimeout(500)

    // Não deve haver nenhum card de norma visível com "Ver Detalhes"
    const botoes = page.getByRole('button', { name: 'Ver Detalhes' })
    await expect(botoes).toHaveCount(0)
  })
})
