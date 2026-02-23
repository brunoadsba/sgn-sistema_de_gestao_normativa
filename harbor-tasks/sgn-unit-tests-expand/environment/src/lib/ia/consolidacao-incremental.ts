import { AnaliseConformidadeResponse, GapConformidade, MetadadosProcessamento } from '@/types/ia'
import { ChunkDocumento } from '@/lib/ia/chunking'

type ResultadoChunk = {
  chunk: ChunkDocumento
  resultado: AnaliseConformidadeResponse
  tempoMs: number
}

function severidadePeso(severidade: GapConformidade['severidade']): number {
  switch (severidade) {
    case 'critica':
      return 4
    case 'alta':
      return 3
    case 'media':
      return 2
    case 'baixa':
    default:
      return 1
  }
}

function riscoPorScore(score: number): AnaliseConformidadeResponse['nivelRisco'] {
  if (score >= 85) return 'baixo'
  if (score >= 70) return 'medio'
  if (score >= 50) return 'alto'
  return 'critico'
}

function keyGap(gap: GapConformidade): string {
  return `${gap.categoria.toLowerCase()}::${gap.descricao.trim().toLowerCase()}`
}

function deduplicarGaps(resultados: ResultadoChunk[]): GapConformidade[] {
  const mapa = new Map<string, GapConformidade>()

  for (const item of resultados) {
    for (const gap of item.resultado.gaps) {
      const chave = keyGap(gap)
      const atual = mapa.get(chave)

      if (!atual) {
        mapa.set(chave, {
          ...gap,
          metadadosChunk: {
            chunkIdsUsados: [item.chunk.chunkId],
            ordemProcessamento: [item.chunk.indice],
          },
        })
        continue
      }

      const novaSeveridade =
        severidadePeso(gap.severidade) > severidadePeso(atual.severidade) ? gap.severidade : atual.severidade

      const evidenciasCombinadas = [...(atual.evidencias ?? []), ...(gap.evidencias ?? [])]
      const evidenciasDedupe = Array.from(
        new Map(evidenciasCombinadas.map((ev) => [ev.chunkId, ev])).values()
      )

      const impacto = atual.impacto ?? gap.impacto

      mapa.set(chave, {
        ...atual,
        severidade: novaSeveridade,
        recomendacao: atual.recomendacao.length >= gap.recomendacao.length ? atual.recomendacao : gap.recomendacao,
        prazo: atual.prazo.length >= gap.prazo.length ? atual.prazo : gap.prazo,
        normasRelacionadas: Array.from(
          new Set([...(atual.normasRelacionadas ?? []), ...(gap.normasRelacionadas ?? [])])
        ),
        evidencias: evidenciasDedupe,
        metadadosChunk: {
          chunkIdsUsados: Array.from(
            new Set([...(atual.metadadosChunk?.chunkIdsUsados ?? []), item.chunk.chunkId])
          ),
          ordemProcessamento: Array.from(
            new Set([...(atual.metadadosChunk?.ordemProcessamento ?? []), item.chunk.indice])
          ).sort((a, b) => a - b),
        },
        ...(impacto ? { impacto } : {}),
      })
    }
  }

  return Array.from(mapa.values()).sort(
    (a, b) => severidadePeso(b.severidade) - severidadePeso(a.severidade)
  )
}

function consolidarListaString(resultados: ResultadoChunk[], campo: 'pontosPositivos' | 'pontosAtencao' | 'proximosPassos') {
  const itens = resultados.flatMap((item) => item.resultado[campo])
  return Array.from(new Set(itens.map((txt) => txt.trim()).filter(Boolean)))
}

export function consolidarResultadosIncrementais(
  resultados: ResultadoChunk[],
  base: Pick<AnaliseConformidadeResponse, 'timestamp' | 'modeloUsado' | 'tempoProcessamento'>
): AnaliseConformidadeResponse {
  if (resultados.length === 0) {
    throw new Error('Nenhum resultado de chunk para consolidar')
  }

  const pesoTotal = resultados.reduce((acc, item) => acc + item.chunk.tamanhoCaracteres, 0)
  const scorePonderado =
    resultados.reduce((acc, item) => acc + item.resultado.score * item.chunk.tamanhoCaracteres, 0) /
    Math.max(pesoTotal, 1)

  const gaps = deduplicarGaps(resultados)
  const scoreFinal = Math.max(0, Math.min(100, Number(scorePonderado.toFixed(2))))
  const nivelRisco = riscoPorScore(scoreFinal)
  const temposPorChunkMs = Object.fromEntries(resultados.map((item) => [item.chunk.chunkId, item.tempoMs]))
  const chunksPorGap = Object.fromEntries(
    gaps.map((gap) => [gap.id, gap.metadadosChunk?.chunkIdsUsados ?? []])
  )
  const metadadosProcessamento: MetadadosProcessamento = {
    estrategia: 'incremental',
    totalChunksProcessados: resultados.length,
    chunksPorGap,
    ordemProcessamento: resultados.map((item) => item.chunk.chunkId),
    temposPorChunkMs,
    truncamentoEvitado: resultados.length > 1,
  }

  return {
    score: scoreFinal,
    nivelRisco,
    gaps,
    resumo: `Analise consolidada de ${resultados.length} blocos do documento.`,
    pontosPositivos: consolidarListaString(resultados, 'pontosPositivos'),
    pontosAtencao: consolidarListaString(resultados, 'pontosAtencao'),
    proximosPassos: consolidarListaString(resultados, 'proximosPassos'),
    timestamp: base.timestamp,
    modeloUsado: base.modeloUsado,
    tempoProcessamento: base.tempoProcessamento,
    metadadosProcessamento,
  }
}
