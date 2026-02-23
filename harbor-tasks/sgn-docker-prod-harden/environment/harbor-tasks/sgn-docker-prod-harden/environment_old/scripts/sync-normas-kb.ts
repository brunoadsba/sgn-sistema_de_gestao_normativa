import fs from 'fs'
import path from 'path'
import { PDFParse } from 'pdf-parse'
import { pathToFileURL } from 'url'
import { resolve } from 'path'
import mammoth from 'mammoth'
import { getNormas } from '../src/lib/data/normas'

const OUTPUT_DIR = path.join(process.cwd(), 'data', 'normas')

PDFParse.setWorker(
  pathToFileURL(
    resolve(process.cwd(), 'node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs')
  ).href
)

function toFileName(codigo: string): string {
  return codigo.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9-]/g, '')
}

async function extrairTextoPdf(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: buffer })
  const result = await parser.getText()
  await parser.destroy()
  return result.text.trim()
}

async function extrairConteudo(url: string): Promise<string> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Falha ao baixar arquivo: ${url} (${response.status})`)
  }

  const buffer = Buffer.from(await response.arrayBuffer())
  const contentType = response.headers.get('content-type')?.toLowerCase() ?? ''

  if (contentType.includes('pdf') || url.toLowerCase().endsWith('.pdf')) {
    return extrairTextoPdf(buffer)
  }

  if (contentType.includes('word') || url.toLowerCase().endsWith('.docx')) {
    const doc = await mammoth.extractRawText({ buffer })
    return doc.value.trim()
  }

  return buffer.toString('utf8').trim()
}

async function run() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  const normas = getNormas()

  for (const norma of normas) {
    const fileName = `${toFileName(norma.codigo)}.txt`
    const outputPath = path.join(OUTPUT_DIR, fileName)

    try {
      const textoPrincipal = await extrairConteudo(norma.urlOficial)
      const anexosTexto: string[] = []

      if (norma.urlAnexos?.length) {
        for (const anexo of norma.urlAnexos) {
          try {
            const conteudoAnexo = await extrairConteudo(anexo.url)
            anexosTexto.push(`\n\n=== ${anexo.label} ===\n${conteudoAnexo}`)
          } catch (error) {
            anexosTexto.push(
              `\n\n=== ${anexo.label} ===\nFalha ao baixar/extrair: ${
                error instanceof Error ? error.message : 'erro desconhecido'
              }`
            )
          }
        }
      }

      const finalText = [
        `# ${norma.codigo} - ${norma.titulo}`,
        `Fonte: ${norma.urlOficial}`,
        textoPrincipal,
        ...anexosTexto,
      ].join('\n\n')

      fs.writeFileSync(outputPath, finalText, 'utf8')
      console.log(`OK: ${norma.codigo} -> ${outputPath}`)
    } catch (error) {
      console.error(
        `ERRO: ${norma.codigo} (${norma.urlOficial}) -> ${
          error instanceof Error ? error.message : 'erro desconhecido'
        }`
      )
    }
  }
}

run().catch((error) => {
  console.error('Falha no sync de base normativa:', error)
  process.exit(1)
})
