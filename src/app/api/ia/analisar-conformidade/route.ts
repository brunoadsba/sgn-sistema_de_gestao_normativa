import { NextRequest, NextResponse } from 'next/server'
import { analisarConformidade } from '@/lib/ia/groq'
import { AnaliseConformidadeRequest, AnaliseConformidadeResponse } from '@/types/ia'
import { CreateAnaliseSchema } from '@/schemas'
import { createSuccessResponse, createErrorResponse, validateRequestBody } from '@/middlewares/validation'
import { log } from '@/lib/logger'

// Função principal para análise de IA
async function analisarConformidadeHandler(request: NextRequest) {
  const startTime = Date.now();

  try {
    log.info('Análise de conformidade iniciada');

    // Validar entrada com Zod
    const bodyValidation = await validateRequestBody(CreateAnaliseSchema, request);
    if (!bodyValidation.success) {
      log.warn('Validação de entrada falhou');
      return createErrorResponse(bodyValidation.error, 400);
    }

    const body = bodyValidation.data;
    
    log.info({
      empresaId: body.empresaId,
      tipoAnalise: body.tipoAnalise,
    }, 'Validação de entrada bem-sucedida');
    
    // Executar análise
    const resultado = await analisarConformidade(body as AnaliseConformidadeRequest)
    
    const tempoProcessamento = Date.now() - startTime
    
    // Adicionar metadados
    const respostaCompleta: AnaliseConformidadeResponse = {
      ...resultado,
      timestamp: new Date().toISOString(),
      modeloUsado: 'llama-3.1-8b-versatile',
      tempoProcessamento
    }

    // Log de sucesso
    log.info({
      tempoProcessamento,
      score: resultado.score,
      gapsCount: resultado.gaps.length,
    }, 'Análise de conformidade concluída com sucesso');

    return createSuccessResponse(
      respostaCompleta,
      "Análise de conformidade concluída com sucesso",
      200
    );

  } catch (error) {
    const tempoProcessamento = Date.now() - startTime;
    
    log.error({
      tempoProcessamento,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }, 'Erro na análise de conformidade');

    return createErrorResponse(
      "Erro interno do servidor na análise de conformidade",
      500,
      error instanceof Error ? error.message : 'Erro desconhecido'
    );
  }
}

// Exportar função simplificada
export const POST = analisarConformidadeHandler;

// GET /api/ia/analisar-conformidade - Listar análises
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const empresaId = searchParams.get('empresaId')
    const limite = parseInt(searchParams.get('limite') || '10')
    const pagina = parseInt(searchParams.get('pagina') || '1')

    // TODO: Implementar busca no banco de dados
    // Por enquanto, retornar estrutura vazia
    const analises: AnaliseConformidadeResponse[] = []

    return NextResponse.json({
      success: true,
      data: {
        analises,
        paginacao: {
          pagina,
          limite,
          total: 0,
          totalPaginas: 0,
          temProxima: false,
          temAnterior: false
        }
      },
      timestamp: new Date().toISOString(),
      requestId: generateRequestId()
    })

  } catch (error) {
    console.error('Erro ao listar análises:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro ao listar análises',
        timestamp: new Date().toISOString(),
        requestId: generateRequestId()
      },
      { status: 500 }
    )
  }
}

// Função para validar entrada
function validarEntrada(body: any): { valida: boolean; erros: string[] } {
  const erros: string[] = []

  if (!body.documento || typeof body.documento !== 'string') {
    erros.push('Campo "documento" é obrigatório e deve ser uma string')
  }

  if (!body.tipoDocumento || typeof body.tipoDocumento !== 'string') {
    erros.push('Campo "tipoDocumento" é obrigatório e deve ser uma string')
  }

  if (!body.empresaId || typeof body.empresaId !== 'string') {
    erros.push('Campo "empresaId" é obrigatório e deve ser uma string')
  }

  if (body.normasAplicaveis && !Array.isArray(body.normasAplicaveis)) {
    erros.push('Campo "normasAplicaveis" deve ser um array')
  }

  if (body.prioridade && !['baixa', 'media', 'alta', 'critica'].includes(body.prioridade)) {
    erros.push('Campo "prioridade" deve ser: baixa, media, alta ou critica')
  }

  // Validar tamanho do documento
  if (body.documento && body.documento.length > 50000) {
    erros.push('Documento muito grande. Máximo 50.000 caracteres')
  }

  return {
    valida: erros.length === 0,
    erros
  }
}

// Função para gerar ID único da requisição
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Função para salvar análise no banco (TODO: implementar)
async function salvarAnalise(
  empresaId: string,
  resultado: AnaliseConformidadeResponse
): Promise<void> {
  // TODO: Implementar salvamento no Supabase
  console.log('Salvando análise no banco:', { empresaId, resultado })
}

// Função para buscar análises do banco (TODO: implementar)
async function buscarAnalises(
  empresaId?: string,
  limite: number = 10,
  pagina: number = 1
): Promise<AnaliseConformidadeResponse[]> {
  // TODO: Implementar busca no Supabase
  console.log('Buscando análises:', { empresaId, limite, pagina })
  return []
}
