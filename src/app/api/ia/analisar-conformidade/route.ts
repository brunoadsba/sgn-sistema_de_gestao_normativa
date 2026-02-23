import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { analisarConformidade } from '@/lib/ia/groq'
import { analisarConformidadeOllama } from '@/lib/ia/ollama'
import { analisarConformidadeZai } from '@/lib/ia/zai'
import { env } from '@/lib/env'
import { AnaliseConformidadeRequest, AnaliseConformidadeResponse } from '@/types/ia'
import { CreateAnaliseSchema } from '@/schemas'
import { createSuccessResponse, createErrorResponse, validateRequestBody } from '@/middlewares/validation'
import { createRequestLogger } from '@/lib/logger'
import {
  listarAnalisesConformidade,
  iniciarJobAnalise,
  atualizarProgressoJob,
  finalizarJobAnalise,
  buscarAnalisePorId,
} from '@/lib/ia/persistencia-analise'
import { getIdempotentResponse } from '@/lib/idempotency'
import { randomUUID } from 'crypto'
import { recuperarEvidenciasNormativas } from '@/lib/normas/kb'
import { dividirDocumentoEmChunks } from '@/lib/ia/chunking'
import { consolidarResultadosIncrementais } from '@/lib/ia/consolidacao-incremental'

export const runtime = 'nodejs'
export const maxDuration = 300 // Aumentado para lidar com chunks pesados

const MAX_CHUNKS_INCREMENTAL = 8
const INCREMENTAL_CONCURRENCY = 3

// Selecionar provider de IA com Fallback Híbrido
async function analisarConformidadeProvider(request: AnaliseConformidadeRequest) {
  if (env.AI_PROVIDER === 'ollama') {
    return analisarConformidadeOllama(request)
  }

  if (env.AI_PROVIDER === 'zai') {
    return analisarConformidadeZai(request)
  }

  try {
    // Tenta Groq primeiro (Default Cloud)
    return await analisarConformidade(request)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : ''

    // Fallback automático para Z.AI (GLM) em erros de rate limit ou tokens excedidos
    const isRateLimit = errorMessage.includes('413') ||
      errorMessage.includes('rate_limit') ||
      errorMessage.includes('tokens') ||
      errorMessage.includes('TPM')

    if (isRateLimit) {
      console.warn(`[IA-FALLBACK] Groq atingiu limite (${errorMessage}). Migrando para Z.AI GLM...`)
      return analisarConformidadeZai(request)
    }

    throw error
  }
}

/**
 * Lógica pesada de processamento em background
 */
async function executarProcessamentoSgn(
  jobId: string,
  documentoId: string,
  body: AnaliseConformidadeRequest,
  requestId: string,
  startTime: number
) {
  const log = createRequestLogger({ headers: new Headers({ 'x-request-id': requestId }) } as any, 'bg.analisar-conformidade')

  try {
    const estrategia = body.estrategiaProcessamento ?? 'completo'
    const timestamp = new Date().toISOString()
    const modeloUsado = env.AI_PROVIDER === 'ollama' ? env.OLLAMA_MODEL : 'hybrid-cloud (groq/zai)'

    let respostaCompleta: AnaliseConformidadeResponse
    let evidenciasPersistencia = [] as NonNullable<AnaliseConformidadeRequest['evidenciasNormativas']>
    let contextoPersistencia: NonNullable<AnaliseConformidadeRequest['contextoBaseConhecimento']> = {
      versaoBase: 'nao_informada',
      totalChunks: 0,
      fonte: 'local',
    }

    // Step 1: Extração/Preparo
    await atualizarProgressoJob(jobId, 'extracting', 10)

    if (estrategia === 'incremental') {
      const chunks = dividirDocumentoEmChunks(body.documento)
      if (chunks.length > MAX_CHUNKS_INCREMENTAL) {
        throw new Error(`Documento gerou ${chunks.length} chunks; limite incremental é ${MAX_CHUNKS_INCREMENTAL}`)
      }

      const resultadosPorChunk = await mapComConcorrencia(
        chunks,
        INCREMENTAL_CONCURRENCY,
        async (chunk) => {
          const inicioChunk = Date.now()
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

      await atualizarProgressoJob(jobId, 'consolidating', 90)

      const versoesBase = new Set(resultadosPorChunk.map((item) => item.versaoBase))
      const chunkIdsValidos = resultadosPorChunk.flatMap((item) => item.chunkIdsLocais)
      evidenciasPersistencia = resultadosPorChunk.flatMap((item) => item.evidencias)

      respostaCompleta = consolidarResultadosIncrementais(
        resultadosPorChunk.map(({ chunk, resultado, tempoMs }) => ({ chunk, resultado, tempoMs })),
        { timestamp, modeloUsado, tempoProcessamento: Date.now() - startTime }
      )

      validarEvidenciasDaResposta(respostaCompleta, Array.from(new Set(chunkIdsValidos)))
      contextoPersistencia = {
        versaoBase: Array.from(versoesBase).join('|'),
        totalChunks: evidenciasPersistencia.length,
        fonte: 'local',
      }
    } else {
      // Estratégia Completa
      await atualizarProgressoJob(jobId, 'analyzing', 20)

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

      validarEvidenciasDaResposta(resultado, evidenciasNormativas.evidencias.map((e) => e.chunkId))

      respostaCompleta = {
        ...resultado,
        timestamp,
        modeloUsado,
        tempoProcessamento: Date.now() - startTime,
      }
    }

    const bodyComContexto: AnaliseConformidadeRequest = {
      ...body,
      evidenciasNormativas: evidenciasPersistencia,
      contextoBaseConhecimento: contextoPersistencia,
    }

    // Finalizar e Persistir
    await finalizarJobAnalise(jobId, documentoId, bodyComContexto, respostaCompleta)

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro interno no worker'
    log.error({ jobId, error: message }, 'Falha no processamento assíncrono')
    await atualizarProgressoJob(jobId, 'error', 0, message)
  }
}

/**
 * Handler POST - Padrão Indústria (Async Worker)
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const requestId = request.headers.get('x-request-id') ?? randomUUID()
  const idempotencyKey = request.headers.get('idempotency-key')
  const syncMode = request.nextUrl.searchParams.get('mode') === 'sync'
  const log = createRequestLogger(request, 'api.ia.analisar-conformidade')

  const cookieStore = await cookies()
  let sessionId = cookieStore.get('sgn_session')?.value

  if (!sessionId) {
    sessionId = randomUUID()
  }

  try {
    const bodyValidation = await validateRequestBody(CreateAnaliseSchema, request)
    if (!bodyValidation.success) return createErrorResponse(bodyValidation.error, 400)

    const body = bodyValidation.data as AnaliseConformidadeRequest

    // Idempotência
    if (idempotencyKey) {
      const cached = getIdempotentResponse(idempotencyKey, body)
      if (cached) return createSuccessResponse(cached, 'Retornado via cache', 200)
    }

    // Criar Job com status 'pending' para retorno imediato
    const { documentoId, jobId } = await iniciarJobAnalise({
      nomeArquivo: body.metadata?.nomeArquivo as string || `analise-${randomUUID().slice(0, 8)}.txt`,
      tipoDocumento: body.tipoDocumento,
      normasAplicaveis: body.normasAplicaveis ?? [],
    }, 'pending', sessionId)

    // Orquestração
    const promise = executarProcessamentoSgn(jobId, documentoId, body, requestId, startTime)

    if (syncMode) {
      await promise
      return createSuccessResponse({ jobId, status: 'completed' }, 'Análise concluída (Sync)')
    }

    // Backgrounding
    if ((request as any).waitUntil) {
      (request as any).waitUntil(promise)
    } else {
      // Fallback para ambientes sem waitUntil nativo
      Promise.resolve(promise).catch(e => log.error({ e }, 'Erro unhandled no worker'))
    }

    // Retorno Imediato conforme RFC 7231 (202 Accepted)
    const response = createSuccessResponse(
      { jobId, status: 'pending', pollUrl: `/api/ia/jobs/${jobId}` },
      'Análise iniciada com sucesso em background',
      202
    )

    // Setar cookie de sessão se não existir
    response.cookies.set('sgn_session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 semana
      path: '/',
    })

    return response

  } catch (error) {
    log.error({ error }, 'Erro fatal no endpoint de análise')
    return createErrorResponse('Falha ao iniciar análise', 500)
  }
}

// RESTANTE DAS FUNÇÕES (Auxiliares do Aider/Originais)

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

function validarEvidenciasDaResposta(resultado: AnaliseConformidadeResponse, chunkIdsValidos: string[]) {
  const validSet = new Set(chunkIdsValidos.map(id => id.toLowerCase()))
  resultado.gaps = resultado.gaps.filter((gap) => {
    if (!gap.evidencias || gap.evidencias.length === 0) return false
    gap.evidencias = gap.evidencias.filter((evidencia) => validSet.has(evidencia.chunkId.toLowerCase()))
    return gap.evidencias.length > 0
  })
}

// GET para listagem/histórico
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (id) {
      const analise = await buscarAnalisePorId(id)
      if (!analise) return createErrorResponse('Análise não encontrada', 404)
      return createSuccessResponse({ analises: [analise] })
    }

    const data = await listarAnalisesConformidade(
      Math.max(parseInt(searchParams.get('pagina') || '1'), 1),
      Math.min(Math.max(parseInt(searchParams.get('limite') || '10'), 1), 100)
    )
    return createSuccessResponse(data)
  } catch (error) {
    return createErrorResponse('Erro ao listar análises', 500)
  }
}
