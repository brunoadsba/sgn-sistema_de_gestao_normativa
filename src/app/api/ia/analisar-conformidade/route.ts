import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { analisarConformidade } from '@/lib/ia/groq'
import { analisarConformidadeOllama } from '@/lib/ia/ollama'
import { analisarConformidadeZai } from '@/lib/ia/zai'
import { env } from '@/lib/env'
import { AnaliseConformidadeRequest, AnaliseConformidadeResponse } from '@/types/ia'
import { CreateAnaliseSchema } from '@/schemas'
import { createSuccessResponse, createErrorResponse, validateRequestBody } from '@/middlewares/validation'
import { createLogger, createRequestLogger } from '@/lib/logger'
import {
  listarAnalisesConformidade,
  iniciarJobAnalise,
  atualizarProgressoJob,
  finalizarJobAnalise,
  buscarAnalisePorId,
} from '@/lib/ia/persistencia-analise'
import {
  getIdempotentResponse,
  saveIdempotentResponse,
  IdempotencyConflictError,
} from '@/lib/idempotency'
import { createHash, randomUUID } from 'crypto'
import { recuperarEvidenciasNormativas } from '@/lib/normas/kb'
import { dividirDocumentoEmChunks } from '@/lib/ia/chunking'
import { consolidarResultadosIncrementais } from '@/lib/ia/consolidacao-incremental'
import { rateLimit } from '@/lib/security/rate-limit'
import { classifyProviderError, shouldFallbackToZaiFromGroq } from '@/lib/ia/provider-errors'
import { inferirNormasHeuristicas, jaccardNormas } from '@/lib/ia/nr-heuristics'
import { calcularConfiancaAnalise } from '@/lib/ia/confidence'

export const runtime = 'nodejs'
export const maxDuration = 300 // Aumentado para lidar com chunks pesados

const MAX_CHUNKS_INCREMENTAL = 8
const INCREMENTAL_CONCURRENCY = 3
const providerLogger = createLogger('ia.provider')
type RequestWithWaitUntil = NextRequest & {
  waitUntil?: (promise: Promise<unknown>) => void
}
type AnaliseJobResponse = {
  jobId: string
  status: 'pending' | 'completed'
  pollUrl: string
}

type ProviderExecMeta = {
  providerUsed: 'groq' | 'zai' | 'ollama'
  fallbackTriggered: boolean
  fallbackFrom?: 'groq'
}

// Selecionar provider de IA com Fallback Híbrido
async function analisarConformidadeProvider(request: AnaliseConformidadeRequest) {
  if (env.AI_PROVIDER === 'ollama') {
    const resultado = await analisarConformidadeOllama(request)
    return {
      resultado,
      providerMeta: { providerUsed: 'ollama', fallbackTriggered: false } satisfies ProviderExecMeta,
    }
  }

  if (env.AI_PROVIDER === 'zai') {
    const resultado = await analisarConformidadeZai(request)
    return {
      resultado,
      providerMeta: { providerUsed: 'zai', fallbackTriggered: false } satisfies ProviderExecMeta,
    }
  }

  try {
    // Tenta Groq primeiro (Default Cloud)
    const resultado = await analisarConformidade(request)
    return {
      resultado,
      providerMeta: { providerUsed: 'groq', fallbackTriggered: false } satisfies ProviderExecMeta,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    const errorClass = classifyProviderError(error)
    const shouldFallback = shouldFallbackToZaiFromGroq(error)
    const hasZaiKey = Boolean(env.ZAI_API_KEY || process.env.OPENAI_API_KEY)

    providerLogger.warn(
      {
        provider: 'groq',
        fallbackProvider: 'zai',
        error_class: errorClass,
        error: errorMessage,
        shouldFallback,
        hasZaiKey,
      },
      'Falha no provider primário (Groq)'
    )

    if (shouldFallback && hasZaiKey) {
      providerLogger.info(
        { provider: 'groq', fallbackProvider: 'zai', error_class: errorClass },
        'Executando fallback Groq -> Z.AI'
      )
      const resultado = await analisarConformidadeZai(request)
      return {
        resultado,
        providerMeta: {
          providerUsed: 'zai',
          fallbackTriggered: true,
          fallbackFrom: 'groq',
        } satisfies ProviderExecMeta,
      }
    }

    if (shouldFallback && !hasZaiKey) {
      providerLogger.error(
        { provider: 'groq', error_class: errorClass },
        'Fallback para Z.AI solicitado, mas nenhuma chave (ZAI_API_KEY/OPENAI_API_KEY) está configurada'
      )
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
  const log = createLogger('bg.analisar-conformidade').child({ correlationId: requestId, jobId })

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
    let providerMetaFinal: ProviderExecMeta = { providerUsed: 'groq', fallbackTriggered: false }

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

          const providerChunk = await analisarConformidadeProvider({
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

          const resultadoChunk = providerChunk.resultado
          validarEvidenciasDaResposta(resultadoChunk, chunkIdsLocais)

          return {
            chunk,
            resultado: resultadoChunk,
            tempoMs: Date.now() - inicioChunk,
            versaoBase: evidenciasChunk.contexto.versaoBase,
            evidencias: evidenciasChunk.evidencias,
            chunkIdsLocais,
            providerMeta: providerChunk.providerMeta,
            missingNormas: evidenciasChunk.contexto.missingNormas ?? [],
          }
        }
      )

      await atualizarProgressoJob(jobId, 'consolidating', 90)

      const versoesBase = new Set(resultadosPorChunk.map((item) => item.versaoBase))
      const chunkIdsValidos = resultadosPorChunk.flatMap((item) => item.chunkIdsLocais)
      evidenciasPersistencia = resultadosPorChunk.flatMap((item) => item.evidencias)
      providerMetaFinal = resultadosPorChunk.some((item) => item.providerMeta.fallbackTriggered)
        ? { providerUsed: 'zai', fallbackTriggered: true, fallbackFrom: 'groq' }
        : resultadosPorChunk[0]?.providerMeta ?? providerMetaFinal

      respostaCompleta = consolidarResultadosIncrementais(
        resultadosPorChunk.map(({ chunk, resultado, tempoMs }) => ({ chunk, resultado, tempoMs })),
        { timestamp, modeloUsado, tempoProcessamento: Date.now() - startTime }
      )

      validarEvidenciasDaResposta(respostaCompleta, Array.from(new Set(chunkIdsValidos)))
      contextoPersistencia = {
        versaoBase: Array.from(versoesBase).join('|'),
        totalChunks: evidenciasPersistencia.length,
        fonte: 'local',
        missingNormas: Array.from(new Set(resultadosPorChunk.flatMap((item) => item.missingNormas))),
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

      const providerResult = await analisarConformidadeProvider({
        ...body,
        estrategiaProcessamento: 'completo',
        evidenciasNormativas: evidenciasNormativas.evidencias,
        contextoBaseConhecimento: evidenciasNormativas.contexto,
      })

      const resultado = providerResult.resultado
      providerMetaFinal = providerResult.providerMeta
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

    const heuristicas = inferirNormasHeuristicas(body.documento, body.tipoDocumento)
    const normasAplicadas = (body.normasAplicaveis ?? ['NR-1']).map((item) => item.toLowerCase())
    const gapsComEvidencia = respostaCompleta.gaps.filter((gap) => (gap.evidencias?.length ?? 0) > 0).length
    const confianca = calcularConfiancaAnalise({
      parseOk: true,
      nrConcordancia: jaccardNormas(normasAplicadas, heuristicas),
      totalGaps: respostaCompleta.gaps.length,
      gapsComEvidencia,
      totalNormas: normasAplicadas.length,
      kbMissingNormas: contextoPersistencia.missingNormas ?? [],
      fallbackTriggered: providerMetaFinal.fallbackTriggered,
    })

    const documentHash = createHash('sha256').update(body.documento).digest('hex')
    respostaCompleta = {
      ...respostaCompleta,
      reportStatus: 'pre_laudo_pendente',
      confidenceScore: confianca.confidenceScore,
      confidenceClass: confianca.confidenceClass,
      confidenceSignals: confianca.confidenceSignals,
      alertasConfiabilidade: confianca.alertasConfiabilidade,
      documentHash,
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
    const rl = rateLimit(request, {
      windowMs: 60 * 1000,
      max: 20,
      keyPrefix: 'rl:analisar-conformidade',
    })

    if (rl.limitExceeded) {
      return createErrorResponse('Muitas requisições. Tente novamente em breve.', 429)
    }

    const bodyValidation = await validateRequestBody(CreateAnaliseSchema, request)
    if (!bodyValidation.success) return createErrorResponse(bodyValidation.error, 400)

    const body = bodyValidation.data as AnaliseConformidadeRequest

    // Idempotência
    if (idempotencyKey) {
      const cached = await getIdempotentResponse(idempotencyKey, body) as AnaliseJobResponse | null
      if (cached) {
        const statusCode = cached.status === 'pending' ? 202 : 200
        return createSuccessResponse(cached, 'Retornado via cache de idempotência', statusCode)
      }
    }

    // Criar Job com status 'pending' para retorno imediato
    const { documentoId, jobId } = await iniciarJobAnalise({
      nomeArquivo: body.metadata?.nomeArquivo as string || `analise-${randomUUID().slice(0, 8)}.txt`,
      tipoDocumento: body.tipoDocumento,
      normasAplicaveis: body.normasAplicaveis ?? [],
    }, 'pending', sessionId)

    // Orquestração
    const promise = executarProcessamentoSgn(jobId, documentoId, body, requestId, startTime)
    const pollUrl = `/api/ia/jobs/${jobId}`
    const acceptedResponse: AnaliseJobResponse = { jobId, status: 'pending', pollUrl }

    if (syncMode) {
      await promise
      const completedResponse: AnaliseJobResponse = { jobId, status: 'completed', pollUrl }
      if (idempotencyKey) {
        await saveIdempotentResponse(idempotencyKey, body, completedResponse)
      }
      return createSuccessResponse(completedResponse, 'Análise concluída (Sync)')
    }

    if (idempotencyKey) {
      await saveIdempotentResponse(idempotencyKey, body, acceptedResponse)
    }

    // Backgrounding
    const requestWithWaitUntil = request as RequestWithWaitUntil
    if (requestWithWaitUntil.waitUntil) {
      requestWithWaitUntil.waitUntil(promise)
    } else {
      // Fallback para ambientes sem waitUntil nativo
      Promise.resolve(promise).catch(e => log.error({ e }, 'Erro unhandled no worker'))
    }

    // Retorno Imediato conforme RFC 7231 (202 Accepted)
    const response = createSuccessResponse(
      acceptedResponse,
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
    if (error instanceof IdempotencyConflictError) {
      return createErrorResponse('Conflito de idempotência', 409, error.message)
    }
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
      Math.min(Math.max(parseInt(searchParams.get('limite') || '10'), 1), 100),
      (searchParams.get('periodo') as 'today' | '7d' | '30d' | null) ?? '30d',
      (searchParams.get('ordenacao') as 'data_desc' | 'data_asc' | 'score_desc' | 'score_asc' | null) ?? 'data_desc',
      searchParams.get('busca') ?? ''
    )
    return createSuccessResponse(data)
  } catch {
    return createErrorResponse('Erro ao listar análises', 500)
  }
}
