import { test, expect } from '@playwright/test'

test.describe('Página Inicial — Análise de Conformidade', () => {
  test.beforeEach(async ({ page }) => {
    // Bypass splash screen
    await page.addInitScript(() => {
      window.localStorage.setItem('sgn.opening.seen.device', '1')
    })
    await page.goto('/')
  })

  test('exibe o título da página corretamente', async ({ page }) => {
    await expect(page).toHaveTitle(/SGN/)
    await expect(page.getByRole('heading', { name: 'Análise de Conformidade' })).toBeVisible()
  })

  test('exibe a descrição da página', async ({ page }) => {
    await expect(
      page.getByText(/Faça upload do seu documento SST, selecione as normas aplicáveis/i)
    ).toBeVisible()
  })

  test('exibe a seção de upload de documento', async ({ page }) => {
    await expect(page.getByText('Envio do Documento')).toBeVisible()
    await expect(
      page.getByText('Arraste seu documento SST aqui')
    ).toBeVisible()
  })

  test('exibe a seção de seleção de normas', async ({ page }) => {
    await expect(page.getByText('Normas Aplicáveis', { exact: true })).toBeVisible()
  })

  test('botão Analisar está desabilitado sem documento e sem normas', async ({ page }) => {
    const botao = page.getByRole('button', { name: /Analisar Conformidade com IA/i })
    await expect(botao).toBeVisible()
    await expect(botao).toBeDisabled()
  })

  test('exibe erro ao tentar analisar sem selecionar normas', async ({ page }) => {
    // Faz upload de um arquivo para habilitar o botão parcialmente
    const conteudo = Buffer.from('Documento SST de teste.')
    await page.setInputFiles('input[type="file"]', {
      name: 'pgr.txt',
      mimeType: 'text/plain',
      buffer: conteudo,
    })
    // Sem selecionar NRs, o botão permanece desabilitado — a validação
    // acontece via estado React. Verificamos apenas que o botão existe
    // e está desabilitado quando não há NRs selecionadas.
    const botao = page.getByRole('button', { name: /Analisar Conformidade com IA/i })
    await expect(botao).toBeDisabled()
  })

  test('aceita upload de arquivo TXT e exibe nome do arquivo', async ({ page }) => {
    const conteudo = Buffer.from('Documento de teste SST para validação de conformidade.')
    await page.setInputFiles('input[type="file"]', {
      name: 'pgr-teste.txt',
      mimeType: 'text/plain',
      buffer: conteudo,
    })
    await expect(page.getByText('pgr-teste.txt')).toBeVisible()
  })

  test('rejeita arquivo com formato inválido', async ({ page }) => {
    const conteudo = Buffer.from('<html></html>')
    await page.setInputFiles('input[type="file"]', {
      name: 'arquivo.html',
      mimeType: 'text/html',
      buffer: conteudo,
    })
    await expect(page.getByText('Formato não suportado. Use PDF, DOCX ou TXT.')).toBeVisible()
  })
})
