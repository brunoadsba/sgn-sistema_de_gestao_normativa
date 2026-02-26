'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { Input } from '@/components/ui/input'

type PeriodoHistorico = 'today' | '7d' | '30d'
type OrdenacaoHistorico = 'data_desc' | 'data_asc' | 'score_desc' | 'score_asc'

type HistoricoAnalise = {
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

type PaginacaoHistorico = {
  pagina: number
  totalPaginas: number
  temProxima: boolean
  temAnterior: boolean
}

type HistoricoAnalisesCardProps = {
  historico: HistoricoAnalise[]
  carregandoHistorico: boolean
  limpandoHistorico: boolean
  paginaHistorico: number
  periodoHistorico: PeriodoHistorico
  ordenacaoHistorico: OrdenacaoHistorico
  buscaDocumento: string
  paginacao: PaginacaoHistorico
  formatarDataHoraBrasilia: (isoDate: string) => string
  onExportarCsv: () => void
  onLimparHistorico: () => void
  onPeriodoChange: (periodo: PeriodoHistorico) => void
  onBuscaChange: (value: string) => void
  onOrdenacaoChange: (value: OrdenacaoHistorico) => void
  onPaginaChange: (pagina: number) => void
}

const periodos: PeriodoHistorico[] = ['today', '7d', '30d']
const labelPeriodo: Record<PeriodoHistorico, string> = {
  today: 'Hoje',
  '7d': '7 dias',
  '30d': '30 dias',
}

const opcoesOrdenacao: { value: OrdenacaoHistorico; label: string }[] = [
  { value: 'data_desc', label: 'Data (mais recente)' },
  { value: 'data_asc', label: 'Data (mais antiga)' },
  { value: 'score_desc', label: 'Score (maior)' },
  { value: 'score_asc', label: 'Score (menor)' },
]

export function HistoricoAnalisesCard({
  historico,
  carregandoHistorico,
  limpandoHistorico,
  paginaHistorico,
  periodoHistorico,
  ordenacaoHistorico,
  buscaDocumento,
  paginacao,
  formatarDataHoraBrasilia,
  onExportarCsv,
  onLimparHistorico,
  onPeriodoChange,
  onBuscaChange,
  onOrdenacaoChange,
  onPaginaChange,
}: HistoricoAnalisesCardProps) {
  return (
    <Card className="border-white/10 dark:border-gray-700/40 shadow-xl shadow-emerald-900/5 bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl">
      <CardHeader className="pb-4 border-b border-gray-100/50 dark:border-gray-700/40">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="text-xl dark:text-gray-100">Histórico de análises</CardTitle>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Data e hora exibidas no padrão Brasil (Horário de Brasília).
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onExportarCsv}
              className="border-gray-300 dark:border-gray-600"
            >
              <Download className="mr-2 h-4 w-4" />
              Exportar CSV
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onLimparHistorico}
              disabled={limpandoHistorico || historico.length === 0}
              className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/40"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {limpandoHistorico ? 'Limpando...' : 'Limpar Histórico'}
            </Button>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {periodos.map((periodo) => (
            <Button
              key={periodo}
              type="button"
              size="sm"
              variant={periodoHistorico === periodo ? 'default' : 'outline'}
              onClick={() => onPeriodoChange(periodo)}
              className={periodoHistorico === periodo ? '' : 'border-gray-300 dark:border-gray-600'}
            >
              {labelPeriodo[periodo]}
            </Button>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
          <Input
            value={buscaDocumento}
            onChange={(event) => onBuscaChange(event.target.value)}
            placeholder="Buscar por nome do documento..."
            className="border-gray-300 dark:border-gray-600"
          />
          <select
            value={ordenacaoHistorico}
            onChange={(event) => onOrdenacaoChange(event.target.value as OrdenacaoHistorico)}
            className="h-10 rounded-md border border-gray-300 bg-transparent px-3 text-sm text-gray-700 dark:border-gray-600 dark:text-gray-200"
          >
            {opcoesOrdenacao.map((opcao) => (
              <option key={opcao.value} value={opcao.value} className="bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
                {opcao.label}
              </option>
            ))}
          </select>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {carregandoHistorico ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Carregando histórico...</p>
        ) : historico.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Nenhuma análise registrada ainda.</p>
        ) : (
          <div className="space-y-4">
            <div className="space-y-3">
              {historico.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/70 px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {item.nomeDocumento}
                    </p>
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                      Score {item.score}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <span className="truncate">{item.tipoDocumento} · Risco {item.nivelRisco}</span>
                    <span>{formatarDataHoraBrasilia(item.timestamp)}</span>
                  </div>
                  <div className="mt-1 text-[11px] text-gray-400 dark:text-gray-500 break-all sm:break-normal">
                    {item.modeloUsado} · {item.tempoProcessamento}ms · confiança {item.confidenceScore ?? 0}/100
                  </div>
                  <div className="mt-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                    {item.reportStatus === 'laudo_aprovado'
                      ? 'Laudo aprovado'
                      : item.reportStatus === 'laudo_rejeitado'
                        ? 'Laudo rejeitado'
                        : 'Pré-laudo pendente'}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-t border-gray-200 pt-3 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Página {paginacao.pagina} de {Math.max(paginacao.totalPaginas, 1)}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!paginacao.temAnterior}
                  onClick={() => onPaginaChange(Math.max(paginaHistorico - 1, 1))}
                  className="border-gray-300 dark:border-gray-600"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!paginacao.temProxima}
                  onClick={() => onPaginaChange(paginaHistorico + 1)}
                  className="border-gray-300 dark:border-gray-600"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
