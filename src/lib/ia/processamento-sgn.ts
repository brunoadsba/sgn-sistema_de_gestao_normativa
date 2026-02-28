import { createHash } from 'crypto'
import { env } from '@/lib/env'
import { AnaliseConformidadeRequest, AnaliseConformidadeResponse } from '@/types/ia'
import { createLogger } from '@/lib/logger'
import {
  atualizarProgressoJob,
  finalizarJobAnalise,
} from '@/lib/ia/persistencia-analise'
import { analisarConformidadeProvider } from '@/lib/ia/provider-selector'
import { recuperarEvidenciasNormativas } from '@/lib/normas/kb'
import { dividirDocumentoEmChunks } from '@/lib/ia/chunking'
import { consolidarResultadosIncrementais } from '@/lib/ia/consolidacao-incremental'
import { inferirNormasHeuristicas, jaccardNormas } from '@/lib/ia/nr-heuristics'
import { calcularConfiancaAnalise } from '@/lib/ia/confidence'
import type { ProviderExecMeta } from '@/lib/ia/provider-selector'

const MAX_CHUNKS_INCREMENTAL = 8
const INCREMENTAL_CONCURRENCY = 3

export async function mapComConcorrencia<T, R>(
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

export function validarEvidenciasDaResposta(
  resultado: AnaliseConformidadeResponse,
  chunkIdsValidos: string[]
): { gapsRemovidos: number; gapsOriginais: number } {
  const validSet = new Set(chunkIdsValidos.map((id) => id.toLowerCase()))
  const gapsOriginais = resultado.gaps.length
  resultado.gaps = resultado.gaps.filter((gap) => {
    if (!gap.evidencias || gap.evidencias.length === 0) return false
    gap.evidencias = gap.evidencias.filter((evidencia) =>
      validSet.has(evidencia.chunkId.toLowerCase())
    )
    return gap.evidencias.length > 0
  })
  const gapsRemovidos = gapsOriginais - resultado.gaps.length

  if (gapsOriginais > 0 && gapsRemovidos > 0) {
    const proporcaoRemanescente = resultado.gaps.length / gapsOriginais
    resultado.score = Math.round(
      resultado.score + (100 - resultado.score) * (1 - proporcaoRemanescente)
    )
  }

  return { gapsRemovidos, gapsOriginais }
}

export async function executarProcessamentoSgn(
  jobId: string,
  documentoId: string,
  body: AnaliseConformidadeRequest,
  requestId: string,
  startTime: number
): Promise<void> {
  const log = createLogger('bg.analisar-conformidade').child({
    correlationId: requestId,
    jobId,
  })

  try {
    const estrategia = body.estrategiaProcessamento ?? 'completo'
    const timestamp = new Date().toISOString()
    const modeloUsado =
      env.AI_PROVIDER === 'ollama' ? env.OLLAMA_MODEL : 'hybrid-cloud (groq/zai)'

    let respostaCompleta: AnaliseConformidadeResponse
    let evidenciasPersistencia = [] as NonNullable<
      AnaliseConformidadeRequest['evidenciasNormativas']
    >
    let contextoPersistencia: NonNullable<
      AnaliseConformidadeRequest['contextoBaseConhecimento']
    > = {
      versaoBase: 'nao_informada',
      totalChunks: 0,
      fonte: 'local',
    }
    let providerMetaFinal: ProviderExecMeta = {
      providerUsed: 'groq',
      fallbackTriggered: false,
    }

    await atualizarProgressoJob(jobId, 'extracting', 10)

    if (estrategia === 'incremental') {
      const chunks = dividirDocumentoEmChunks(body.documento)
      if (chunks.length > MAX_CHUNKS_INCREMENTAL) {
        throw new Error(
          `Documento gerou ${chunks.length} chunks; limite incremental e ${MAX_CHUNKS_INCREMENTAL}`
        )
      }

      const resultadosPorChunk = await mapComConcorrencia(
        chunks,
        INCREMENTAL_CONCURRENCY,
        async (chunk) => {
          const inicioChunk = Date.now()
          const evidenciasChunk = await recuperarEvidenciasNormativas(
            body.normasAplicaveis ?? [],
            chunk.conteudo
          )
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
        resultadosPorChunk.map(({ chunk, resultado, tempoMs }) => ({
          chunk,
          resultado,
          tempoMs,
        })),
        { timestamp, modeloUsado, tempoProcessamento: Date.now() - startTime }
      )

      validarEvidenciasDaResposta(respostaCompleta, Array.from(new Set(chunkIdsValidos)))
      contextoPersistencia = {
        versaoBase: Array.from(versoesBase).join('|'),
        totalChunks: evidenciasPersistencia.length,
        fonte: 'local',
        missingNormas: Array.from(
          new Set(resultadosPorChunk.flatMap((item) => item.missingNormas))
        ),
      }
    } else {
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
      validarEvidenciasDaResposta(
        resultado,
        evidenciasNormativas.evidencias.map((e) => e.chunkId)
      )

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
    const normasAplicadas = (body.normasAplicaveis ?? ['NR-1']).map((item) =>
      item.toLowerCase()
    )
    const gapsComEvidencia = respostaCompleta.gaps.filter(
      (gap) => (gap.evidencias?.length ?? 0) > 0
    ).length
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

    await finalizarJobAnalise(jobId, documentoId, bodyComContexto, respostaCompleta)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro interno no worker'
    log.error({ jobId, error: message }, 'Falha no processamento assincrono')
    await atualizarProgressoJob(jobId, 'error', 0, message)
  }
}
