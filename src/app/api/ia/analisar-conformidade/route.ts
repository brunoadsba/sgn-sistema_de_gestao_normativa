import { NextRequest } from 'next/server'
import { analisarConformidade } from '@/lib/ia/groq'

export const runtime = 'nodejs'
export const maxDuration = 120
import { AnaliseConformidadeRequest, AnaliseConformidadeResponse } from '@/types/ia'
import { CreateAnaliseSchema } from '@/schemas'
import { createSuccessResponse, createErrorResponse, validateRequestBody } from '@/middlewares/validation'
import { createRequestLogger } from '@/lib/logger'
import {
  exportarHistoricoCsv,
  listarAnalisesConformidade,
  OrdenacaoHistorico,
  PeriodoHistorico,
  persistirAnaliseConformidade,
} from '@/lib/ia/persistencia-analise'
import { getIdempotentResponse, saveIdempotentResponse } from '@/lib/idempotency'
import { randomUUID } from 'crypto'
import { recuperarEvidenciasNormativas } from '@/lib/normas/kb'

// Função principal para análise de IA
async function analisarConformidadeHandler(request: NextRequest) {
  const startTime = Date.now();
  const requestId = request.headers.get('x-request-id') ?? randomUUID();
  const idempotencyKey = request.headers.get('idempotency-key');
  const log = createRequestLogger(request, 'api.ia.analisar-conformidade')

  try {
    log.info({ requestId, idempotencyKey }, 'Análise de conformidade iniciada');

    // Validar entrada com Zod
    const bodyValidation = await validateRequestBody(CreateAnaliseSchema, request);
    if (!bodyValidation.success) {
      log.warn({ requestId }, 'Validação de entrada falhou');
      return createErrorResponse(bodyValidation.error, 400);
    }

    const body = bodyValidation.data as AnaliseConformidadeRequest;

    log.info({
      requestId,
      tipoDocumento: body.tipoDocumento,
    }, 'Validação de entrada bem-sucedida');

    if (idempotencyKey) {
      const cachedResponse = getIdempotentResponse(idempotencyKey, body);
      if (cachedResponse) {
        log.info({ requestId, idempotencyKey }, 'Resposta idempotente retornada do cache');
        const cached = createSuccessResponse(cachedResponse, 'Resultado retornado via idempotência', 200);
        cached.headers.set('x-request-id', requestId);
        return cached;
      }
    }

    const evidenciasNormativas = await recuperarEvidenciasNormativas(
      body.normasAplicaveis ?? [],
      body.documento
    )

    // Executar análise
    const resultado = await analisarConformidade({
      ...body,
      evidenciasNormativas: evidenciasNormativas.evidencias,
      contextoBaseConhecimento: evidenciasNormativas.contexto,
    })

    const tempoProcessamento = Date.now() - startTime

    validarEvidenciasDaResposta(resultado, evidenciasNormativas.evidencias.map((e) => e.chunkId))

    // Adicionar metadados
    const respostaCompleta: AnaliseConformidadeResponse = {
      ...resultado,
      timestamp: new Date().toISOString(),
      modeloUsado: 'llama-4-scout-17b-16e-instruct',
      tempoProcessamento
    }

    // Persistir no banco
    await persistirAnaliseConformidade(
      {
        ...body,
        evidenciasNormativas: evidenciasNormativas.evidencias,
        contextoBaseConhecimento: evidenciasNormativas.contexto,
      },
      respostaCompleta
    )

    if (idempotencyKey) {
      saveIdempotentResponse(idempotencyKey, body, respostaCompleta)
    }

    // Log de sucesso
    log.info({
      requestId,
      tempoProcessamento,
      score: resultado.score,
      gapsCount: resultado.gaps.length,
      evidenciasCount: evidenciasNormativas.evidencias.length,
    }, 'Análise de conformidade concluída com sucesso');

    const successResponse = createSuccessResponse(
      respostaCompleta,
      "Análise de conformidade concluída com sucesso",
      200
    );
    successResponse.headers.set('x-request-id', requestId);
    return successResponse;

  } catch (error) {
    const tempoProcessamento = Date.now() - startTime;
    const message = error instanceof Error ? error.message : 'Erro desconhecido'
    const statusCode = message.includes('Idempotency-Key já utilizada') ? 409 : 500

    log.error({
      requestId,
      tempoProcessamento,
      error: message,
    }, 'Erro na análise de conformidade');

    const errorResponse = createErrorResponse(
      statusCode === 409 ? 'Conflito de idempotência' : "Erro interno do servidor na análise de conformidade",
      statusCode,
      message
    );
    errorResponse.headers.set('x-request-id', requestId);
    return errorResponse;
  }
}

function validarEvidenciasDaResposta(
  resultado: AnaliseConformidadeResponse,
  chunkIdsValidos: string[]
) {
  const validSet = new Set(chunkIdsValidos)

  for (const gap of resultado.gaps) {
    if (!gap.evidencias || gap.evidencias.length === 0) {
      throw new Error(`Gap ${gap.id} sem evidência normativa local`)
    }

    for (const evidencia of gap.evidencias) {
      if (!validSet.has(evidencia.chunkId)) {
        throw new Error(
          `Gap ${gap.id} referenciou chunk inválido: ${evidencia.chunkId}`
        )
      }
    }
  }
}

// Exportar função simplificada
export const POST = analisarConformidadeHandler;

// GET /api/ia/analisar-conformidade - Listar análises
export async function GET(request: NextRequest) {
  const log = createRequestLogger(request, 'api.ia.analisar-conformidade.listar')
  try {
    const { searchParams } = new URL(request.url)
    const limite = Math.min(Math.max(parseInt(searchParams.get('limite') || '10'), 1), 100)
    const pagina = Math.max(parseInt(searchParams.get('pagina') || '1'), 1)
    const periodo = parsePeriodo(searchParams.get('periodo'))
    const ordenacao = parseOrdenacao(searchParams.get('ordenacao'))
    const buscaDocumento = (searchParams.get('busca') ?? '').trim()
    const format = searchParams.get('format')

    if (format === 'csv') {
      const csv = await exportarHistoricoCsv(periodo, ordenacao, buscaDocumento)
      return new Response(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="historico-analises-${periodo}-${ordenacao}.csv"`,
          'Cache-Control': 'no-store',
        },
      })
    }

    const data = await listarAnalisesConformidade(pagina, limite, periodo, ordenacao, buscaDocumento)

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

function parsePeriodo(periodo: string | null): PeriodoHistorico {
  if (periodo === 'today' || periodo === '7d' || periodo === '30d') {
    return periodo
  }
  return '30d'
}

function parseOrdenacao(ordenacao: string | null): OrdenacaoHistorico {
  if (
    ordenacao === 'data_desc' ||
    ordenacao === 'data_asc' ||
    ordenacao === 'score_desc' ||
    ordenacao === 'score_asc'
  ) {
    return ordenacao
  }
  return 'data_desc'
}
