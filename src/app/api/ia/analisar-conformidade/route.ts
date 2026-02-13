import { NextRequest } from 'next/server'
import { analisarConformidade } from '@/lib/ia/groq'
import { AnaliseConformidadeRequest, AnaliseConformidadeResponse } from '@/types/ia'
import { CreateAnaliseSchema } from '@/schemas'
import { createSuccessResponse, createErrorResponse, validateRequestBody } from '@/middlewares/validation'
import { log } from '@/lib/logger'
import { listarAnalisesConformidade, persistirAnaliseConformidade } from '@/lib/ia/persistencia-analise'

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
      tipoDocumento: body.tipoDocumento,
    }, 'Validação de entrada bem-sucedida');

    // Executar análise
    const resultado = await analisarConformidade(body as AnaliseConformidadeRequest)

    const tempoProcessamento = Date.now() - startTime

    // Adicionar metadados
    const respostaCompleta: AnaliseConformidadeResponse = {
      ...resultado,
      timestamp: new Date().toISOString(),
      modeloUsado: 'llama-4-scout-17b-16e-instruct',
      tempoProcessamento
    }

    // Persistir no banco
    await persistirAnaliseConformidade(body as AnaliseConformidadeRequest, respostaCompleta)

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
    const limite = Math.min(Math.max(parseInt(searchParams.get('limite') || '10'), 1), 100)
    const pagina = Math.max(parseInt(searchParams.get('pagina') || '1'), 1)
    const data = await listarAnalisesConformidade(pagina, limite)

    return createSuccessResponse(data)

  } catch (error) {
    log.error({
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, 'Erro ao listar análises de conformidade')

    return createErrorResponse(
      'Erro ao listar análises',
      500,
      error instanceof Error ? error.message : 'Erro desconhecido'
    )
  }
}
