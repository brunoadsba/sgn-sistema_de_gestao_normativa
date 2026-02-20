'use client'

import { useState, useCallback, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Brain, ChevronLeft, ChevronRight, Download, Trash2 } from 'lucide-react'
import { useQueryState } from 'nuqs'
import { UploadDocumento } from '@/components/analise/UploadDocumento'
import { SeletorNormas } from '@/components/analise/SeletorNormas'
import { ResultadoAnalise } from '@/components/analise/ResultadoAnalise'
import { AnaliseConformidadeResponse } from '@/types/ia'
import { fetchWithRetry } from '@/lib/fetch-with-retry'
import { ErrorDisplay } from '@/components/error/ErrorDisplay'

export interface NormaReduzida {
    id: string
    codigo: string
    titulo: string
}

interface AnaliseClienteProps {
    normasIniciais: NormaReduzida[]
}

interface HistoricoAnalise {
    id: string
    nomeDocumento: string
    tipoDocumento: string
    score: number
    nivelRisco: 'baixo' | 'medio' | 'alto' | 'critico'
    timestamp: string
    tempoProcessamento: number
    modeloUsado: string
}

interface PaginacaoHistorico {
    pagina: number
    totalPaginas: number
    temProxima: boolean
    temAnterior: boolean
}

type PeriodoHistorico = 'today' | '7d' | '30d'
type OrdenacaoHistorico = 'data_desc' | 'data_asc' | 'score_desc' | 'score_asc'

export function AnaliseCliente({ normasIniciais }: AnaliseClienteProps) {
    const [arquivo, setArquivo] = useState<File | null>(null)
    const [normasSelecionadas, setNormasSelecionadas] = useState<string[]>([])
    const [analisando, setAnalisando] = useState(false)
    const [progresso, setProgresso] = useState(0)
    const [etapa, setEtapa] = useState('')
    const [erro, setErro] = useState<string | null>(null)
    const [resultado, setResultado] = useState<AnaliseConformidadeResponse | null>(null)
    const [historico, setHistorico] = useState<HistoricoAnalise[]>([])
    const [carregandoHistorico, setCarregandoHistorico] = useState(true)
    const [limpandoHistorico, setLimpandoHistorico] = useState(false)
    const [paginaHistoricoQuery, setPaginaHistoricoQuery] = useQueryState('hist_page', {
        defaultValue: '1',
        shallow: true,
    })
    const [periodoHistoricoQuery, setPeriodoHistoricoQuery] = useQueryState('hist_periodo', {
        defaultValue: '30d',
        shallow: true,
    })
    const [ordenacaoHistoricoQuery, setOrdenacaoHistoricoQuery] = useQueryState('hist_sort', {
        defaultValue: 'data_desc',
        shallow: true,
    })
    const [buscaDocumentoQuery, setBuscaDocumentoQuery] = useQueryState('hist_busca', {
        defaultValue: '',
        shallow: true,
    })
    const paginaHistorico = Math.max(parseInt(paginaHistoricoQuery || '1', 10) || 1, 1)
    const periodoHistorico: PeriodoHistorico =
        periodoHistoricoQuery === 'today' || periodoHistoricoQuery === '7d' || periodoHistoricoQuery === '30d'
            ? periodoHistoricoQuery
            : '30d'
    const ordenacaoHistorico: OrdenacaoHistorico =
        ordenacaoHistoricoQuery === 'data_desc' ||
        ordenacaoHistoricoQuery === 'data_asc' ||
        ordenacaoHistoricoQuery === 'score_desc' ||
        ordenacaoHistoricoQuery === 'score_asc'
            ? ordenacaoHistoricoQuery
            : 'data_desc'
    const buscaDocumento = buscaDocumentoQuery || ''
    const [buscaDebounced, setBuscaDebounced] = useState('')
    const [paginacao, setPaginacao] = useState<PaginacaoHistorico>({
        pagina: 1,
        totalPaginas: 0,
        temProxima: false,
        temAnterior: false,
    })

    const carregarHistorico = useCallback(async (
        pagina: number,
        periodo: PeriodoHistorico,
        ordenacao: OrdenacaoHistorico,
        busca: string
    ) => {
        setCarregandoHistorico(true)
        try {
            const params = new URLSearchParams({
                limite: '8',
                pagina: String(pagina),
                periodo,
                ordenacao,
            })
            if (busca.trim()) {
                params.set('busca', busca.trim())
            }

            const response = await fetchWithRetry(`/api/ia/analisar-conformidade?${params.toString()}`, {
                method: 'GET',
            }, { retries: 2, timeoutMs: 20_000 })

            const payload = await response.json().catch(() => null)
            if (!response.ok || !payload?.success) {
                return
            }

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
    }, [])

    useEffect(() => {
        const timeout = setTimeout(() => setBuscaDebounced(buscaDocumento), 300)
        return () => clearTimeout(timeout)
    }, [buscaDocumento])

    useEffect(() => {
        void carregarHistorico(paginaHistorico, periodoHistorico, ordenacaoHistorico, buscaDebounced)
    }, [carregarHistorico, paginaHistorico, periodoHistorico, ordenacaoHistorico, buscaDebounced])

    const executarAnalise = useCallback(async () => {
        if (!arquivo) {
            setErro('Selecione um documento para analisar.')
            return
        }
        if (normasSelecionadas.length === 0) {
            setErro('Selecione pelo menos uma norma regulamentadora.')
            return
        }

        setAnalisando(true)
        setErro(null)
        setProgresso(0)
        setResultado(null)

        try {
            // 1. Extrair texto do documento
            setEtapa('Extraindo texto do documento...')
            setProgresso(15)

            const formData = new FormData()
            formData.append('file', arquivo)

            const extractRes = await fetchWithRetry('/api/extrair-texto', {
                method: 'POST',
                body: formData,
            }, { retries: 3, timeoutMs: 60_000 })

            if (!extractRes.ok) {
                const err = await extractRes.json().catch(() => ({}))
                throw new Error(err.error || `Erro ${extractRes.status} ao extrair texto`)
            }

            const extractData = await extractRes.json()
            if (!extractData.success) {
                throw new Error(extractData.error || 'Falha na extração de texto')
            }

            const textoDocumento = extractData.data.texto
            setProgresso(40)

            // 2. Análise de conformidade com IA
            setEtapa('Analisando conformidade com IA...')
            setProgresso(50)

            const codigosNR = normasSelecionadas.map(codigo => {
                const match = codigo.match(/NR[-\s]*(\d+)/i)
                return match ? `NR-${parseInt(match[1])}` : codigo
            })

            const analysisRes = await fetchWithRetry('/api/ia/analisar-conformidade', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    documento: textoDocumento,
                    tipoDocumento: 'OUTRO',
                    normasAplicaveis: codigosNR,
                }),
            }, { retries: 3, timeoutMs: 90_000 })

            setProgresso(85)

            if (!analysisRes.ok) {
                const err = await analysisRes.json().catch(() => ({}))
                throw new Error(err.error || `Erro ${analysisRes.status} na análise`)
            }

            const analysisData = await analysisRes.json()
            if (!analysisData.success || !analysisData.data) {
                throw new Error(analysisData.error || 'Falha na análise de conformidade')
            }

            setProgresso(100)
            setEtapa('Concluída')
            setResultado(analysisData.data)
            await carregarHistorico(paginaHistorico, periodoHistorico, ordenacaoHistorico, buscaDebounced)
        } catch (err) {
            setErro(err instanceof Error ? err.message : 'Erro desconhecido na análise')
        } finally {
            setAnalisando(false)
        }
    }, [arquivo, normasSelecionadas, carregarHistorico, paginaHistorico, periodoHistorico, ordenacaoHistorico, buscaDebounced])

    const novaAnalise = () => {
        setArquivo(null)
        setNormasSelecionadas([])
        setResultado(null)
        setErro(null)
        setProgresso(0)
        setEtapa('')
    }

    const podeAnalisar = arquivo && normasSelecionadas.length > 0 && !analisando
    const formatarDataHoraBrasilia = (isoDate: string) =>
        new Intl.DateTimeFormat('pt-BR', {
            timeZone: 'America/Sao_Paulo',
            dateStyle: 'short',
            timeStyle: 'medium',
        }).format(new Date(isoDate))
    const labelPeriodo: Record<PeriodoHistorico, string> = {
        today: 'Hoje',
        '7d': '7 dias',
        '30d': '30 dias',
    }
    const periodos: PeriodoHistorico[] = ['today', '7d', '30d']
    const opcoesOrdenacao: { value: OrdenacaoHistorico; label: string }[] = [
        { value: 'data_desc', label: 'Data (mais recente)' },
        { value: 'data_asc', label: 'Data (mais antiga)' },
        { value: 'score_desc', label: 'Score (maior)' },
        { value: 'score_asc', label: 'Score (menor)' },
    ]
    const exportarHistoricoCsv = () => {
        const params = new URLSearchParams({
            format: 'csv',
            periodo: periodoHistorico,
            ordenacao: ordenacaoHistorico,
        })
        if (buscaDebounced.trim()) {
            params.set('busca', buscaDebounced.trim())
        }
        const url = `/api/ia/analisar-conformidade?${params.toString()}`
        window.open(url, '_blank', 'noopener,noreferrer')
    }
    const limparHistorico = async () => {
        if (historico.length === 0) return

        const confirmou = window.confirm(
            'Deseja realmente apagar todo o histórico de análises? Esta ação não pode ser desfeita.'
        )
        if (!confirmou) return

        setLimpandoHistorico(true)
        setErro(null)
        try {
            const response = await fetchWithRetry('/api/ia/analisar-conformidade', {
                method: 'DELETE',
            }, { retries: 2, timeoutMs: 20_000 })
            const payload = await response.json().catch(() => null)
            if (!response.ok || !payload?.success) {
                throw new Error(payload?.error || 'Falha ao limpar histórico')
            }
            await setPaginaHistoricoQuery('1')
            await carregarHistorico(1, periodoHistorico, ordenacaoHistorico, buscaDebounced)
        } catch (err) {
            setErro(err instanceof Error ? err.message : 'Erro desconhecido ao limpar histórico')
        } finally {
            setLimpandoHistorico(false)
        }
    }

    return (
        <div className="container mx-auto px-3 sm:px-4 max-w-5xl">
            {/* Header */}
            <div className="text-center mb-8 sm:mb-12 relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-blue-500/20 blur-3xl -z-10 rounded-full"></div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-indigo-900 to-gray-900 dark:from-gray-100 dark:via-indigo-300 dark:to-gray-100 tracking-tighter mb-3 sm:mb-4 pb-2 leading-normal">
                    Análise de Conformidade
                </h1>
                <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
                    Faça upload do seu documento SST, selecione as normas aplicáveis e deixe nossa IA identificar gaps e gerar recomendações precisas instantaneamente.
                </p>
            </div>

            {resultado ? (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <ResultadoAnalise resultado={resultado} onNovaAnalise={novaAnalise} />
                </div>
            ) : (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                        {/* Esquerda - Upload */}
                        <div className="md:col-span-7">
                            <Card className="h-full border-white/10 dark:border-gray-700/40 shadow-xl shadow-blue-900/5 bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl transition-all duration-300 hover:shadow-blue-900/10 dark:hover:shadow-black/20">
                                <CardHeader className="pb-4 border-b border-gray-100/50 dark:border-gray-700/40">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">1</div>
                                        <CardTitle className="text-lg sm:text-xl dark:text-gray-100">Envio do Documento</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <UploadDocumento
                                        arquivo={arquivo}
                                        onArquivoChange={(f) => { setArquivo(f); setErro(null) }}
                                        desabilitado={analisando}
                                    />
                                </CardContent>
                            </Card>
                        </div>

                        {/* Direita - Normas */}
                        <div className="md:col-span-5">
                            <Card className="h-full border-white/10 dark:border-gray-700/40 shadow-xl shadow-indigo-900/5 bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl transition-all duration-300 hover:shadow-indigo-900/10 dark:hover:shadow-black/20">
                                <CardHeader className="pb-4 border-b border-gray-100/50 dark:border-gray-700/40">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">2</div>
                                        <CardTitle className="text-lg sm:text-xl dark:text-gray-100">Normas Aplicáveis</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-6 h-[calc(100%-5rem)]">
                                    <SeletorNormas
                                        normas={normasIniciais}
                                        selecionadas={normasSelecionadas}
                                        onSelecaoChange={(s) => { setNormasSelecionadas(s); setErro(null) }}
                                        carregando={false}
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Erro */}
                    {erro && (
                        <div className="animate-in fade-in zoom-in-95 duration-300">
                            <ErrorDisplay message={erro} onRetry={executarAnalise} compact />
                        </div>
                    )}

                    {/* Progresso */}
                    {analisando && (
                        <div aria-live="polite" className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-4 p-6 bg-gradient-to-r from-blue-50/90 to-indigo-50/90 dark:from-blue-950/50 dark:to-indigo-950/50 backdrop-blur-xl border border-blue-100 dark:border-blue-900/50 shadow-lg rounded-2xl">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-blue-400 rounded-full blur animate-pulse opacity-50"></div>
                                        <div className="relative h-8 w-8 rounded-full border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 animate-spin" />
                                    </div>
                                    <span className="text-sm sm:text-base font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700 dark:from-blue-300 dark:to-indigo-300 truncate">
                                        {etapa}
                                    </span>
                                </div>
                                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{progresso}%</span>
                            </div>
                            <Progress value={progresso} className="h-3 bg-blue-100 dark:bg-blue-950" />
                        </div>
                    )}

                    {/* Botão Analisar */}
                    <div className="pt-4">
                        <Button
                            onClick={executarAnalise}
                            disabled={!podeAnalisar}
                            size="lg"
                            className="w-full h-14 sm:h-16 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-base sm:text-lg font-bold shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/40 hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                        >
                            <Brain className={`h-6 w-6 mr-3 ${analisando ? 'animate-pulse' : ''}`} />
                            {analisando ? 'Processando com Inteligência Artificial...' : 'Analisar Conformidade com IA'}
                        </Button>
                    </div>

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
                                        onClick={exportarHistoricoCsv}
                                        className="border-gray-300 dark:border-gray-600"
                                    >
                                        <Download className="mr-2 h-4 w-4" />
                                        Exportar CSV
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={limparHistorico}
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
                                        onClick={() => {
                                            setPeriodoHistoricoQuery(periodo)
                                            setPaginaHistoricoQuery('1')
                                        }}
                                        className={periodoHistorico === periodo ? '' : 'border-gray-300 dark:border-gray-600'}
                                    >
                                        {labelPeriodo[periodo]}
                                    </Button>
                                ))}
                            </div>
                            <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
                                <Input
                                    value={buscaDocumento}
                                    onChange={(event) => {
                                        const value = event.target.value
                                        setBuscaDocumentoQuery(value || null)
                                        setPaginaHistoricoQuery('1')
                                    }}
                                    placeholder="Buscar por nome do documento..."
                                    className="border-gray-300 dark:border-gray-600"
                                />
                                <select
                                    value={ordenacaoHistorico}
                                    onChange={(event) => {
                                        setOrdenacaoHistoricoQuery(event.target.value as OrdenacaoHistorico)
                                        setPaginaHistoricoQuery('1')
                                    }}
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
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Nenhuma análise registrada ainda.
                                </p>
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
                                                    {item.modeloUsado} · {item.tempoProcessamento}ms
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
                                                onClick={() => setPaginaHistoricoQuery(String(Math.max(paginaHistorico - 1, 1)))}
                                                className="border-gray-300 dark:border-gray-600"
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                disabled={!paginacao.temProxima}
                                                onClick={() => setPaginaHistoricoQuery(String(paginaHistorico + 1))}
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
                </div>
            )}
        </div>
    )
}
