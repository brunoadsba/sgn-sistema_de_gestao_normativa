import { NextRequest, NextResponse } from 'next/server'
import { analisarNR6 } from '@/lib/ia/analisador-nr6'
import { AnaliseNR6Request } from '@/lib/ia/analisador-nr6'

// POST /api/nr6/analisar
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validar entrada específica para NR-6
    const validacao = validarEntradaNR6(body)
    if (!validacao.valida) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Dados de entrada inválidos para análise NR-6',
          detalhes: validacao.erros 
        },
        { status: 400 }
      )
    }

    const inicioProcessamento = Date.now()
    
    // Executar análise específica da NR-6
    const resultado = await analisarNR6(body as AnaliseNR6Request)
    
    const tempoProcessamento = Date.now() - inicioProcessamento
    
    // Adicionar metadados específicos da NR-6
    const respostaCompleta = {
      ...resultado,
      timestamp: new Date().toISOString(),
      modeloUsado: 'llama-3.1-8b-instant',
      tempoProcessamento,
      norma: 'NR-6',
      versao: '2024.1'
    }

    // Log específico da NR-6
    console.log(`Análise NR-6 concluída para empresa ${body.empresaId}:`, {
      score: resultado.score,
      gaps: resultado.gaps.length,
      conformidadeNR6: resultado.conformidadeNR6,
      tempoProcessamento
    })

    // Salvar análise no banco (implementar depois)
    // await salvarAnaliseNR6(body.empresaId, respostaCompleta)

    return NextResponse.json({
      success: true,
      data: respostaCompleta,
      timestamp: new Date().toISOString(),
      requestId: generateRequestId()
    })

  } catch (error) {
    console.error('Erro na análise NR-6:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro interno do servidor na análise NR-6',
        detalhes: error instanceof Error ? error.message : 'Erro desconhecido',
        timestamp: new Date().toISOString(),
        requestId: generateRequestId()
      },
      { status: 500 }
    )
  }
}

// Validação específica para NR-6
function validarEntradaNR6(body: any): { valida: boolean; erros: string[] } {
  const erros: string[] = []

  if (!body.documento || typeof body.documento !== 'string') {
    erros.push('Campo "documento" é obrigatório para análise NR-6')
  }

  if (!body.tipoDocumento) {
    erros.push('Campo "tipoDocumento" é obrigatório para análise NR-6')
  }

  const tiposValidos = ['ficha_entrega_epi', 'treinamento_epi', 'inspecao_epi', 'pgr', 'nr1_gro', 'ppra', 'outro']
  // PGR e NR-1-GRO são os documentos principais (NR-1 GRO substituiu PPRA)
  // PPRA mantido para compatibilidade com documentos legados
  if (body.tipoDocumento && !tiposValidos.includes(body.tipoDocumento)) {
    erros.push(`Tipo de documento inválido. Tipos válidos: ${tiposValidos.join(', ')}`)
  }

  if (!body.empresaId || typeof body.empresaId !== 'string') {
    erros.push('Campo "empresaId" é obrigatório para análise NR-6')
  }

  // Validar tamanho específico para NR-6
  if (body.documento && body.documento.length > 30000) {
    erros.push('Documento muito grande para análise NR-6. Máximo 30.000 caracteres')
  }

  return {
    valida: erros.length === 0,
    erros
  }
}

// Função para gerar ID único
function generateRequestId(): string {
  return `nr6_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}