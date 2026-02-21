import { NextRequest } from 'next/server'
import { analisarConformidade } from '@/lib/ia/groq'
import { analisarConformidadeOllama } from '@/lib/ia/ollama'
import { env } from '@/lib/env'

export const runtime = 'nodejs'

// Função auxiliar para selecionar o provider
async function analisarConformidadeProvider(request: AnaliseConformidadeRequest) {
  if (env.AI_PROVIDER === 'ollama') {
    return analisarConformidadeOllama(request)
  }
  return analisarConformidade(request)
}

export const maxDuration = 120
import { AnaliseConformidadeRequest, AnaliseConformidadeResponse } from '@/types/ia'
import { CreateAnaliseSchema } from '@/schemas'
import { createSuccessResponse, createErrorResponse, validateRequestBody } from '@/middlewares/validation'
import { createRequestLogger } from '@/lib/logger'
import {
  exportarHistoricoCsv,
  limparHistoricoAnalises,
  listarAnalisesConformidade,
  OrdenacaoHistorico,
  PeriodoHistorico,
  persistirAnaliseConformidade,
} from '@/lib/ia/persistencia-analise'
import { getIdempotentResponse, saveIdempotentResponse } from '@/lib/idempotency'
import { randomUUID } from 'crypto'
import { recuperarEvidenciasNormativas } from '@/lib/normas/kb'
import { dividirDocumentoEmChunks } from '@/lib/ia/chunking'
import { consolidarResultadosIncrementais } from '@/lib/ia/consolidacao-incremental'

const MAX_CHUNKS_INCREMENTAL = 8
const INCREMENTAL_CONCURRENCY = 3

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

    const estrategia = body.estrategiaProcessamento ?? 'completo'
    const timestamp = new Date().toISOString()
    const modeloUsado = env.AI_PROVIDER === 'ollama' ? env.OLLAMA_MODEL : 'llama-4-scout-17b-16e-instruct'
    let respostaCompleta: AnaliseConformidadeResponse
    let evidenciasPersistencia = [] as NonNullable<AnaliseConformidadeRequest['evidenciasNormativas']>
    let contextoPersistencia: NonNullable<AnaliseConformidadeRequest['contextoBaseConhecimento']> = {
      versaoBase: 'nao_informada',
      totalChunks: 0,
      fonte: 'local',
    }

    if (estrategia === 'incremental') {
      const chunks = dividirDocumentoEmChunks(body.documento)
      if (chunks.length > MAX_CHUNKS_INCREMENTAL) {
        throw new Error(
          `Documento gerou ${chunks.length} chunks; limite incremental atual é ${MAX_CHUNKS_INCREMENTAL}`
        )
      }

      const resultadosPorChunk = await mapComConcorrencia(
        chunks,
        INCREMENTAL_CONCURRENCY,
        async (chunk) => {
          const inicioChunk = Date.now()
          log.info(
            {
              requestId,
              chunkId: chunk.chunkId,
              indice: chunk.indice,
              totalChunks: chunk.totalChunks,
              tamanhoCaracteres: chunk.tamanhoCaracteres,
            },
            'Iniciando análise de chunk incremental'
          )

          const evidenciasChunk = await recuperarEvidenciasNormativas(body.normasAplicaveis ?? [], chunk.conteudo)
          const chunkIdsLocais = evidenciasChunk.evidencias.map((e) => e.chunkId)

          const resultadoChunk = await analisarConformidadeProvider({
            ...body,
            documento: chunk.conteudo,
            estrategiaProcessamento: 'completo',
            chunkMetadados: [chunk],
            evidenciasNormativas: evidenciasChunk.evidencias,
            contextoBaseConhecimento: {
              versaoBase: 'local-kb-v1',
              totalChunks: chunkIdsLocais.length,
              fonte: 'local',
            },
          })

          validarEvidenciasDaResposta(resultadoChunk, chunkIdsLocais)

          return {
            chunk,
            resultado: resultadoChunk,
            tempoMs: Date.now() - inicioChunk,
            versaoBase: evidenciasChunk.contexto.versaoBase,
            evidencias: evidenciasChunk.evidencias,
            chunkIdsLocais,
          }
        }
      )
      const versoesBase = new Set(resultadosPorChunk.map((item) => item.versaoBase))
      const chunkIdsValidos = resultadosPorChunk.flatMap((item) => item.chunkIdsLocais)
      evidenciasPersistencia = resultadosPorChunk.flatMap((item) => item.evidencias)

      const tempoProcessamento = Date.now() - startTime
      respostaCompleta = consolidarResultadosIncrementais(
        resultadosPorChunk.map(({ chunk, resultado, tempoMs }) => ({ chunk, resultado, tempoMs })),
        {
          timestamp,
          modeloUsado,
          tempoProcessamento,
        }
      )

      validarEvidenciasDaResposta(respostaCompleta, Array.from(new Set(chunkIdsValidos)))
      contextoPersistencia = {
        versaoBase: Array.from(versoesBase).join('|'),
        totalChunks: evidenciasPersistencia.length,
        fonte: 'local',
      }
    } else {
      const evidenciasNormativas = await recuperarEvidenciasNormativas(
        body.normasAplicaveis ?? [],
        body.documento
      )
      evidenciasPersistencia = evidenciasNormativas.evidencias
      contextoPersistencia = evidenciasNormativas.contexto

      const resultado = await analisarConformidadeProvider({
        ...body,
        estrategiaProcessamento: 'completo',
        evidenciasNormativas: evidenciasNormativas.evidencias,
        contextoBaseConhecimento: evidenciasNormativas.contexto,
      })

      const tempoProcessamento = Date.now() - startTime
      console.log(`[DEBUG] Gaps retornados pela IA antes da validação: ${resultado.gaps.length}`)
      validarEvidenciasDaResposta(resultado, evidenciasNormativas.evidencias.map((e) => e.chunkId))
      console.log(`[DEBUG] Gaps após validação: ${resultado.gaps.length}`)

      respostaCompleta = {
        ...resultado,
        timestamp,
        modeloUsado,
        tempoProcessamento,
      }
    }

    // Persistir no banco
    await persistirAnaliseConformidade(
      {
        ...body,
        evidenciasNormativas: evidenciasPersistencia,
        contextoBaseConhecimento: contextoPersistencia,
      },
      respostaCompleta
    )

    if (idempotencyKey) {
      saveIdempotentResponse(idempotencyKey, body, respostaCompleta)
    }

    // Log de sucesso
    log.info({
      requestId,
      tempoProcessamento: respostaCompleta.tempoProcessamento,
      score: respostaCompleta.score,
      gapsCount: respostaCompleta.gaps.length,
      evidenciasCount: evidenciasPersistencia.length,
      estrategiaProcessamento: estrategia,
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

async function mapComConcorrencia<T, R>(
  items: T[],
  limit: number,
  mapper: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results = new Array<R>(items.length)
  let cursor = 0

  async function worker() {
    while (cursor < items.length) {
      const current = cursor
      cursor += 1
      results[current] = await mapper(items[current], current)
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker())
  await Promise.all(workers)
  return results
}

function validarEvidenciasDaResposta(
  resultado: AnaliseConformidadeResponse,
  chunkIdsValidos: string[]
) {
  const validSet = new Set(chunkIdsValidos.map(id => id.toLowerCase()))

  // Filtramos os gaps mutando o array para manter apenas os que possuem evidencias normais
  resultado.gaps = resultado.gaps.filter((gap) => {
    if (!gap.evidencias || gap.evidencias.length === 0) {
      // Caso a inteligência esqueceu, removemos esse gap pois não tem lastro normativo forte e previne a quebra da API
      return false
    }

    // Filtra internamente apenas as evidencias que a Inteligência relacionou de forma compatível (case-insensitive)
    gap.evidencias = gap.evidencias.filter((evidencia) => validSet.has(evidencia.chunkId.toLowerCase()))

    // Se sobrou ao menos 1 evidencia real e mapeada, esse gap é confiável e fica!
    return gap.evidencias.length > 0
  })
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

// DELETE /api/ia/analisar-conformidade - Limpar histórico de análises
export async function DELETE(request: NextRequest) {
  const log = createRequestLogger(request, 'api.ia.analisar-conformidade.limpar')
  try {
    const resultado = await limparHistoricoAnalises()
    log.info(resultado, 'Histórico de análises removido com sucesso')
    return createSuccessResponse(resultado, 'Histórico removido com sucesso')
  } catch (error) {
    log.error({
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }, 'Erro ao limpar histórico de análises')

    return createErrorResponse(
      'Erro ao limpar histórico de análises',
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
