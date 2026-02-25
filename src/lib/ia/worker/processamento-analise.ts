import { analisarConformidade } from '@/lib/ia/groq'
import { analisarConformidadeOllama } from '@/lib/ia/ollama'
import { analisarConformidadeZai } from '@/lib/ia/zai'
import { env } from '@/lib/env'
import { AnaliseConformidadeRequest, AnaliseConformidadeResponse } from '@/types/ia'
import { createLogger } from '@/lib/logger'
import { atualizarProgressoJob, finalizarJobAnalise } from '@/lib/ia/persistencia-analise'
import { atualizarStatusIdempotenciaPorJobId } from '@/lib/idempotency'
import { recuperarEvidenciasNormativas } from '@/lib/normas/kb'
import { dividirDocumentoEmChunks } from '@/lib/ia/chunking'
import { consolidarResultadosIncrementais } from '@/lib/ia/consolidacao-incremental'
import { calcularScoreDeterministico } from '@/lib/ia/score-deterministico'
import { decidirEstrategiaProcessamento } from '@/lib/ia/worker/estrategia-processamento'
import { construirFingerprintEntrada, construirHashResultado } from '@/lib/ia/fingerprint'
import { normalizarAnaliseResposta } from '@/lib/ia/text-normalizer'

const MAX_CHUNKS_INCREMENTAL = 40
const INCREMENTAL_CONCURRENCY = 3
const processamentoLogger = createLogger('ia.worker.processamento')

export type ProcessamentoAnaliseInput = {
  jobId: string
  documentoId: string
  body: AnaliseConformidadeRequest
  requestId: string
  startTime: number
}

async function analisarConformidadeProvider(request: AnaliseConformidadeRequest) {
  if (env.AI_PROVIDER === 'ollama') {
    return analisarConformidadeOllama(request)
  }

  if (env.AI_PROVIDER === 'zai') {
    return analisarConformidadeZai(request)
  }

  try {
    return await analisarConformidade(request)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : ''
    const isRateLimit =
      errorMessage.includes('413') ||
      errorMessage.includes('rate_limit') ||
      errorMessage.includes('tokens') ||
      errorMessage.includes('TPM')

    if (isRateLimit) {
      if (env.ANALYSIS_STRICT_DETERMINISM === 'true') {
        throw new Error(`Provider Groq indisponível sem fallback no modo estrito: ${errorMessage}`)
      }

      processamentoLogger.warn(
        { provider: 'groq', error: errorMessage },
        'Groq atingiu limite; fallback para Z.AI'
      )
      return analisarConformidadeZai(request)
    }

    throw error
  }
}

export async function executarProcessamentoJobAnalise({
  jobId,
  documentoId,
  body,
  requestId,
  startTime,
}: ProcessamentoAnaliseInput): Promise<void> {
  const log = processamentoLogger.child({ correlationId: requestId, jobId })
  const fingerprintEntrada = construirFingerprintEntrada(body)

  const decisaoEstrategia = decidirEstrategiaProcessamento(body.estrategiaProcessamento, body.documento.length)
  const estrategia = decisaoEstrategia.estrategia
  if (decisaoEstrategia.motivo === 'auto_limite') {
    log.info(
      {
        tamanhoDocumento: body.documento.length,
        provider: decisaoEstrategia.provider,
        limiteCaracteres: decisaoEstrategia.limiteCaracteres,
      },
      'Documento acima do limite calibrado; estratégia alterada para incremental'
    )
  }

  const timestamp = new Date().toISOString()
  const modeloUsado =
    env.AI_PROVIDER === 'ollama'
      ? env.OLLAMA_MODEL
      : env.AI_PROVIDER === 'zai'
        ? env.ZAI_MODEL
        : env.ANALYSIS_STRICT_DETERMINISM === 'true'
          ? 'groq'
          : 'hybrid-cloud (groq/zai)'

  let respostaCompleta: AnaliseConformidadeResponse
  let evidenciasPersistencia = [] as NonNullable<AnaliseConformidadeRequest['evidenciasNormativas']>
  let contextoPersistencia: NonNullable<AnaliseConformidadeRequest['contextoBaseConhecimento']> = {
    versaoBase: 'nao_informada',
    totalChunks: 0,
    fonte: 'local',
  }

  await atualizarProgressoJob(jobId, 'extracting', 10)

  if (estrategia === 'incremental') {
    const chunks = dividirDocumentoEmChunks(body.documento)
    if (chunks.length > MAX_CHUNKS_INCREMENTAL) {
      throw new Error(
        `Documento gerou ${chunks.length} chunks; limite incremental é ${MAX_CHUNKS_INCREMENTAL}`
      )
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
    const scoreDeterministico = calcularScoreDeterministico(resultado.gaps)

    respostaCompleta = {
      ...resultado,
      score: scoreDeterministico.score,
      nivelRisco: scoreDeterministico.nivelRisco,
      timestamp,
      modeloUsado,
      tempoProcessamento: Date.now() - startTime,
      metadadosProcessamento: {
        ...(resultado.metadadosProcessamento ?? {
          estrategia: 'completo',
          totalChunksProcessados: 1,
          chunksPorGap: {},
          ordemProcessamento: [],
          truncamentoEvitado: true,
        }),
        scoreDeterministico: scoreDeterministico.detalhes,
      },
    }
  }

  const bodyComContexto: AnaliseConformidadeRequest = {
    ...body,
    evidenciasNormativas: evidenciasPersistencia,
    contextoBaseConhecimento: contextoPersistencia,
  }

  // Normaliza texto para corrigir erros recorrentes do LLM antes de gerar hash/persistir
  respostaCompleta = normalizarAnaliseResposta(respostaCompleta)

  const resultHash = construirHashResultado(respostaCompleta)
  const fingerprintAnalise = {
    ...fingerprintEntrada,
    resultHash,
  }

  respostaCompleta = {
    ...respostaCompleta,
    fingerprintAnalise,
    metadadosProcessamento: {
      ...(respostaCompleta.metadadosProcessamento ?? {
        estrategia,
        totalChunksProcessados: estrategia === 'incremental' ? 0 : 1,
        chunksPorGap: {},
        ordemProcessamento: [],
      }),
      fingerprintAnalise,
    },
  }

  await finalizarJobAnalise(jobId, documentoId, bodyComContexto, respostaCompleta)
  await atualizarStatusIdempotenciaPorJobId(jobId, 'completed')
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

function validarEvidenciasDaResposta(resultado: AnaliseConformidadeResponse, chunkIdsValidos: string[]) {
  const validSet = new Set(chunkIdsValidos.map((id) => id.toLowerCase()))
  resultado.gaps = resultado.gaps.filter((gap) => {
    if (!gap.evidencias || gap.evidencias.length === 0) return false
    gap.evidencias = gap.evidencias.filter((evidencia) => validSet.has(evidencia.chunkId.toLowerCase()))
    return gap.evidencias.length > 0
  })
}
