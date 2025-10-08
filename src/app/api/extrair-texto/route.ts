import { NextRequest, NextResponse } from 'next/server'
import mammoth from 'mammoth'
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs'

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
      tamanho: file.size
    })

    let textoExtraido = ''

    try {
      // Detectar formato pelo nome do arquivo e MIME type
      const fileName = file.name.toLowerCase()
      const isPDF = file.type === 'application/pdf' || fileName.endsWith('.pdf')
      const isDOCX = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
                    file.type === 'application/msword' || 
                    fileName.endsWith('.docx') || 
                    fileName.endsWith('.doc')
      const isTXT = file.type === 'text/plain' || fileName.endsWith('.txt')

      console.log('🔍 Detectando formato:', {
        fileName: file.name,
        mimeType: file.type,
        isPDF,
        isDOCX,
        isTXT
      })

      if (isPDF) {
        // Extrair texto de PDF usando pdfjs-dist
        console.log('📄 Processando PDF...')
        const arrayBuffer = await file.arrayBuffer()
        const uint8Array = new Uint8Array(arrayBuffer)
        const pdf = await pdfjs.getDocument(uint8Array).promise
        
        let fullText = ''
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i)
          const textContent = await page.getTextContent()
          const pageText = textContent.items.map((item: any) => item.str).join(' ')
          fullText += pageText + '\n'
        }
        textoExtraido = fullText
        console.log('✅ PDF processado, texto extraído:', textoExtraido.length, 'caracteres')
        
      } else if (isDOCX) {
        // Extrair texto de DOCX usando mammoth
        console.log('📄 Processando DOCX...')
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const result = await mammoth.extractRawText({ buffer: buffer })
        textoExtraido = result.value
        console.log('✅ DOCX processado, texto extraído:', textoExtraido.length, 'caracteres')
        
      } else if (isTXT) {
        // Extrair texto de TXT
        console.log('📄 Processando TXT...')
        textoExtraido = await file.text()
        console.log('✅ TXT processado, texto extraído:', textoExtraido.length, 'caracteres')
        
      } else {
        return NextResponse.json(
          { success: false, error: `Formato de arquivo não suportado: ${file.type} (${file.name})` },
          { status: 400 }
        )
      }

      // Limpar e formatar o texto (preservar estrutura do Markdown)
      textoExtraido = textoExtraido
        .replace(/\n{3,}/g, '\n\n') // Limitar quebras de linha excessivas
        .trim()

      console.log('📝 Texto final extraído:', {
        tamanho: textoExtraido.length,
        preview: textoExtraido.substring(0, 200) + '...'
      })

      return NextResponse.json({
        success: true,
        data: {
          texto: textoExtraido,
          tamanho: textoExtraido.length,
          nomeArquivo: file.name,
          tipoArquivo: file.type
        }
      })

    } catch (extractionError) {
      console.error('❌ Erro na extração:', extractionError)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Erro ao extrair texto do arquivo',
          details: extractionError instanceof Error ? extractionError.message : 'Erro desconhecido'
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
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}
