import { useState, useCallback, useEffect } from 'react'
import { fetchWithRetry } from '@/lib/fetch-with-retry'
import { formatarDataHoraBrasilia } from '@/lib/formatters'

export type HistoricoAnalise = {
  id: string
  nomeDocumento: string
  tipoDocumento: string
  score: number
  confidenceScore?: number
  reportStatus?: 'pre_laudo_pendente' | 'laudo_aprovado' | 'laudo_rejeitado'
  nivelRisco: 'baixo' | 'medio' | 'alto' | 'critico'
  timestamp: string
  tempoProcessamento: number
  modeloUsado: string
}

export type PeriodoHistorico = 'today' | '7d' | '30d' | 'all'
export type OrdenacaoHistorico = 'data_desc' | 'data_asc' | 'score_desc' | 'score_asc'

export type PaginacaoHistorico = {
  pagina: number
  totalPaginas: number
  temProxima: boolean
  temAnterior: boolean
}

export { formatarDataHoraBrasilia }

type UseHistoricoParams = {
  mostrarHistorico: boolean
  paginaHistorico: number
  periodoHistorico: PeriodoHistorico
  ordenacaoHistorico: OrdenacaoHistorico
  buscaDebounced: string
  onPaginaReset: () => void
}

export function useHistorico({
  mostrarHistorico,
  paginaHistorico,
  periodoHistorico,
  ordenacaoHistorico,
  buscaDebounced,
  onPaginaReset,
}: UseHistoricoParams) {
  const [historico, setHistorico] = useState<HistoricoAnalise[]>([])
  const [carregandoHistorico, setCarregandoHistorico] = useState(false)
  const [limpandoHistorico, setLimpandoHistorico] = useState(false)
  const [paginacao, setPaginacao] = useState<PaginacaoHistorico>({
    pagina: 1,
    totalPaginas: 0,
    temProxima: false,
    temAnterior: false,
  })

  const carregarHistorico = useCallback(
    async (pagina: number, periodo: PeriodoHistorico, ordenacao: OrdenacaoHistorico, busca: string) => {
      setCarregandoHistorico(true)
      try {
        const params = new URLSearchParams({
          limite: '8',
          pagina: String(pagina),
          periodo,
          ordenacao,
        })
        if (busca.trim()) params.set('busca', busca.trim())

        const response = await fetchWithRetry(`/api/ia/analisar-conformidade?${params.toString()}`, {
          method: 'GET',
        }, { retries: 2, timeoutMs: 20_000 })

        const payload = await response.json().catch(() => null)
        if (!response.ok || !payload?.success) return

        const itens = Array.isArray(payload.data?.historico) ? payload.data.historico : []
        setHistorico(itens)
        setPaginacao({
          pagina: payload.data?.paginacao?.pagina ?? pagina,
          totalPaginas: payload.data?.paginacao?.totalPaginas ?? 0,
          temProxima: Boolean(payload.data?.paginacao?.temProxima),
          temAnterior: Boolean(payload.data?.paginacao?.temAnterior),
        })
      } finally {
        setCarregandoHistorico(false)
      }
    },
    []
  )

  useEffect(() => {
    if (!mostrarHistorico) return
    void carregarHistorico(paginaHistorico, periodoHistorico, ordenacaoHistorico, buscaDebounced)
  }, [carregarHistorico, mostrarHistorico, paginaHistorico, periodoHistorico, ordenacaoHistorico, buscaDebounced])

  const exportarHistoricoCsv = useCallback(() => {
    const params = new URLSearchParams({
      format: 'csv',
      periodo: periodoHistorico,
      ordenacao: ordenacaoHistorico,
    })
    if (buscaDebounced.trim()) params.set('busca', buscaDebounced.trim())
    const url = `/api/ia/analisar-conformidade?${params.toString()}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }, [periodoHistorico, ordenacaoHistorico, buscaDebounced])

  const limparHistorico = useCallback(async () => {
    if (historico.length === 0) return
    const confirmou = window.confirm(
      'Deseja realmente apagar todo o histórico de análises? Esta ação não pode ser desfeita.'
    )
    if (!confirmou) return

    setLimpandoHistorico(true)
    try {
      const response = await fetchWithRetry('/api/ia/analisar-conformidade', {
        method: 'DELETE',
      }, { retries: 2, timeoutMs: 20_000 })
      const payload = await response.json().catch(() => null)
      if (!response.ok || !payload?.success) {
        throw new Error(payload?.error || 'Falha ao limpar histórico')
      }
      onPaginaReset()
      await carregarHistorico(1, periodoHistorico, ordenacaoHistorico, buscaDebounced)
    } catch (err) {
      throw err
    } finally {
      setLimpandoHistorico(false)
    }
  }, [historico.length, periodoHistorico, ordenacaoHistorico, buscaDebounced, carregarHistorico, onPaginaReset])

  return {
    historico,
    carregandoHistorico,
    limpandoHistorico,
    paginacao,
    carregarHistorico,
    formatarDataHoraBrasilia,
    exportarHistoricoCsv,
    limparHistorico,
  }
}
