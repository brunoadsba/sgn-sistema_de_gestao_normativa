import { NextRequest } from 'next/server'
import mammoth from 'mammoth'
import { PDFParse } from 'pdf-parse'
import { pathToFileURL } from 'url'
import { resolve } from 'path'
import { rateLimit } from '@/lib/security/rate-limit'
import { createErrorResponse, createSuccessResponse } from '@/middlewares/validation'
import { createRequestLogger } from '@/lib/logger'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 120

// Configura o worker com file:// URL para funcionar em Node.js server-side.
// PDFParse.setWorker() sem argumento é no-op nesta versão — o path explícito é obrigatório.
const workerSubPath = ['node_modules', 'pdfjs' + '-dist', 'legacy', 'build', 'pdf.worker.mjs'].join('/');
PDFParse.setWorker(
  pathToFileURL(
    resolve(process.cwd(), workerSubPath)
  ).href
)

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

export async function POST(request: NextRequest) {
  const logger = createRequestLogger(request, 'api.extrair-texto')

  try {
    const rl = rateLimit(request, {
      windowMs: 60 * 1000,
      max: 30,
      keyPrefix: 'rl:extrair-texto',
    })

    if (rl.limitExceeded) {
      return createErrorResponse('Muitas requisições. Tente novamente em breve.', 429)
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return createErrorResponse('Nenhum arquivo fornecido', 400)
    }

    const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB
    if (file.size > MAX_FILE_SIZE) {
      return createErrorResponse('Arquivo excede 100MB', 400)
    }

    logger.info({ nome: file.name, tipo: file.type, tamanho: file.size }, 'Extraindo texto do arquivo')

    const fileName = file.name.toLowerCase()
    const isPDF =
      file.type === 'application/pdf' || fileName.endsWith('.pdf')
    const isDOCX =
      file.type ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.type === 'application/msword' ||
      fileName.endsWith('.docx') ||
      fileName.endsWith('.doc')
    const isTXT = file.type === 'text/plain' || fileName.endsWith('.txt')

    logger.info({ fileName: file.name, mimeType: file.type, isPDF, isDOCX, isTXT }, 'Detectando formato')

    let textoExtraido = ''

    try {
      if (isPDF) {
        logger.info('Processando PDF')
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const parser = new PDFParse({ data: buffer })
        const result = await parser.getText()
        textoExtraido = result.text
        logger.info({ caracteres: textoExtraido.length }, 'PDF processado')

      } else if (isDOCX) {
        logger.info('Processando DOCX')
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const result = await mammoth.extractRawText({ buffer })
        textoExtraido = result.value
        logger.info({ caracteres: textoExtraido.length }, 'DOCX processado')

      } else if (isTXT) {
        logger.info('Processando TXT')
        textoExtraido = await file.text()
        logger.info({ caracteres: textoExtraido.length }, 'TXT processado')

      } else {
        return createErrorResponse(
          `Formato não suportado: ${file.type} (${file.name})`,
          400
        )
      }

      textoExtraido = textoExtraido.replace(/\n{3,}/g, '\n\n').trim()

      logger.info({ tamanho: textoExtraido.length, preview: textoExtraido.substring(0, 200) + '...' }, 'Texto final extraido')

      return createSuccessResponse({
        texto: textoExtraido,
        tamanho: textoExtraido.length,
        nomeArquivo: file.name,
        tipoArquivo: file.type,
      })
    } catch (extractionError) {
      logger.error({ error: extractionError }, 'Erro na extracao de texto')
      return createErrorResponse(
        'Erro ao extrair texto do arquivo',
        500,
        extractionError instanceof Error
          ? extractionError.message
          : 'Erro desconhecido'
      )
    }
  } catch (error) {
    logger.error({ error }, 'Erro geral na rota extrair-texto')
    return createErrorResponse(
      'Erro interno do servidor',
      500,
      error instanceof Error ? error.message : 'Erro desconhecido'
    )
  }
}
