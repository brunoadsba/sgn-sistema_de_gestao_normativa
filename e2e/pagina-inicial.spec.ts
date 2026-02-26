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
      page.getByText(/Faça upload do seu documento SST e deixe nossa IA identificar gaps/i)
    ).toBeVisible()
  })

  test('exibe a seção de upload de documento', async ({ page }) => {
    await expect(page.getByText('Envio do Documento')).toBeVisible()
    await expect(
      page.getByText('Mergulhe seu documento aqui')
    ).toBeVisible()
  })

  test('exibe a seção de seleção de normas', async ({ page }) => {
    await expect(page.getByText('Normas Aplicáveis')).toBeVisible()
    await expect(page.getByText('Catálogo de Normas')).toBeVisible()
  })

  test('botão começa com o rótulo de Aguardando Documento quando nenhum arquivo está selecionado', async ({ page }) => {
    const botao = page.getByRole('button', { name: /Aguardando Documento/i })
    await expect(botao).toBeVisible()
    await expect(botao).toBeDisabled()
  })

  test('botão muda para Sugerir Normas IA e fica habilitado ao subir documento sem normas', async ({ page }) => {
    const conteudo = Buffer.from('Documento SST de teste.')
    await page.setInputFiles('input[type="file"]', {
      name: 'pgr.txt',
      mimeType: 'text/plain',
      buffer: conteudo,
    })

    const botao = page.getByRole('button', { name: /Sugerir Normas (com )?IA/i })
    await expect(botao).toBeVisible()
    await expect(botao).not.toBeDisabled()
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
