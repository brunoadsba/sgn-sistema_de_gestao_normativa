import { NextRequest, NextResponse } from 'next/server'
import mammoth from 'mammoth'
import { PDFParse } from 'pdf-parse'
import { pathToFileURL } from 'url'
import { resolve } from 'path'

// Node runtime obrigatório para lidar com Buffer, mammoth e pdf-parse
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

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
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Nenhum arquivo fornecido' },
        { status: 400 }
      )
    }

    console.log('📁 Extraindo texto do arquivo:', {
      nome: file.name,
      tipo: file.type,
      tamanho: file.size,
    })

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

    console.log('🔍 Detectando formato:', {
      fileName: file.name,
      mimeType: file.type,
      isPDF,
      isDOCX,
      isTXT,
    })

    let textoExtraido = ''

    try {
      if (isPDF) {
        console.log('📄 Processando PDF...')
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const parser = new PDFParse({ data: buffer })
        const result = await parser.getText()
        textoExtraido = result.text
        console.log('✅ PDF processado:', textoExtraido.length, 'caracteres')

      } else if (isDOCX) {
        console.log('📄 Processando DOCX...')
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const result = await mammoth.extractRawText({ buffer })
        textoExtraido = result.value
        console.log('✅ DOCX processado:', textoExtraido.length, 'caracteres')

      } else if (isTXT) {
        console.log('📄 Processando TXT...')
        textoExtraido = await file.text()
        console.log('✅ TXT processado:', textoExtraido.length, 'caracteres')

      } else {
        return NextResponse.json(
          {
            success: false,
            error: `Formato não suportado: ${file.type} (${file.name})`,
          },
          { status: 400 }
        )
      }

      textoExtraido = textoExtraido.replace(/\n{3,}/g, '\n\n').trim()

      console.log('📝 Texto final:', {
        tamanho: textoExtraido.length,
        preview: textoExtraido.substring(0, 200) + '...',
      })

      return NextResponse.json({
        success: true,
        data: {
          texto: textoExtraido,
          tamanho: textoExtraido.length,
          nomeArquivo: file.name,
          tipoArquivo: file.type,
        },
      })
    } catch (extractionError) {
      console.error('❌ Erro na extração:', extractionError)
      return NextResponse.json(
        {
          success: false,
          error: 'Erro ao extrair texto do arquivo',
          details:
            extractionError instanceof Error
              ? extractionError.message
              : 'Erro desconhecido',
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('❌ Erro geral:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor',
        details:
          error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    )
  }
}
