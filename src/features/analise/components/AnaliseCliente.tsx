'use client'

import { useState, useCallback, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Brain, Sparkles, CheckSquare } from 'lucide-react'
import { useQueryState } from 'nuqs'
import dynamic from 'next/dynamic'
import { UploadDocumento } from '@/components/analise/UploadDocumento'
import { SeletorNormas } from '@/components/analise/SeletorNormas'
import { AnaliseConformidadeResponse } from '@/types/ia'
import { fetchWithRetry } from '@/lib/fetch-with-retry'
import { ErrorDisplay } from '@/components/error/ErrorDisplay'
import { HistoricoAnalisesCard } from '@/features/analise/components/HistoricoAnalisesCard'

const ResultadoAnalise = dynamic(
    () => import('@/components/analise/ResultadoAnalise').then((mod) => mod.ResultadoAnalise),
    {
        loading: () => (
            <Card className="border-white/10 dark:border-gray-700/40 shadow-xl shadow-blue-900/5 bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl">
                <CardContent className="py-8">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Carregando resultado...</p>
                </CardContent>
            </Card>
        ),
    }
)

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
    const [jobId, setJobId] = useState<string | null>(null)
    const [erro, setErro] = useState<string | null>(null)
    const [resultado, setResultado] = useState<AnaliseConformidadeResponse | null>(null)
    const [historico, setHistorico] = useState<HistoricoAnalise[]>([])
    const [carregandoHistorico, setCarregandoHistorico] = useState(true)
    const [limpandoHistorico, setLimpandoHistorico] = useState(false)
    const [mostrarHistorico, setMostrarHistorico] = useState(false)
    const [sugerindoNrs, setSugerindoNrs] = useState(false)

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
    const [normaPreSelecionada] = useQueryState('norma', { shallow: true })

    useEffect(() => {
        if (normaPreSelecionada) {
            setNormasSelecionadas([normaPreSelecionada])
        }
    }, [normaPreSelecionada, setNormasSelecionadas])
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
        if (!mostrarHistorico) return
        void carregarHistorico(paginaHistorico, periodoHistorico, ordenacaoHistorico, buscaDebounced)
    }, [carregarHistorico, mostrarHistorico, paginaHistorico, periodoHistorico, ordenacaoHistorico, buscaDebounced])

    // Polling de Job
    useEffect(() => {
        if (!jobId || !analisando) return

        window.dispatchEvent(new CustomEvent('sgn-analysis-start'))

        let timer: NodeJS.Timeout

        const checkStatus = async () => {
            try {
                const res = await fetch(`/api/ia/jobs/${jobId}`)
                const payload = await res.json()

                if (!res.ok || !payload.success) return

                const job = payload.data
                setProgresso(job.progresso || 0)

                // Mapear status para etapas legíveis
                const statusMap: Record<string, string> = {
                    'pending': 'Aguardando início...',
                    'extracting': 'Extraindo texto do documento...',
                    'analyzing': 'IA analisando conformidade...',
                    'consolidating': 'Consolidando resultados...',
                    'completed': 'Análise concluída!',
                    'error': 'Erro no processamento'
                }
                setEtapa(statusMap[job.status] || job.status)

                if (job.status === 'completed' && job.resultadoId) {
                    window.dispatchEvent(new CustomEvent('sgn-analysis-stop'))
                    // Buscar o resultado completo
                    const resFinal = await fetch(`/api/ia/analisar-conformidade?id=${job.resultadoId}`)
                    const payloadFinal = await resFinal.json()
                    if (payloadFinal.success && payloadFinal.data) {
                        setResultado(payloadFinal.data.analises[0])
                        setAnalisando(false)
                        setJobId(null)
                        void carregarHistorico(paginaHistorico, periodoHistorico, ordenacaoHistorico, buscaDebounced)
                    }
                } else if (job.status === 'error') {
                    window.dispatchEvent(new CustomEvent('sgn-analysis-stop'))
                    setErro(job.erroDetalhes || 'Erro ao processar documento')
                    setAnalisando(false)
                    setJobId(null)
                } else {
                    // Continuar polling
                    timer = setTimeout(checkStatus, 3000)
                }
            } catch (err) {
                console.error('Erro polling:', err)
                timer = setTimeout(checkStatus, 5000)
            }
        }

        timer = setTimeout(checkStatus, 2000)
        return () => clearTimeout(timer)
    }, [jobId, analisando, carregarHistorico, paginaHistorico, periodoHistorico, ordenacaoHistorico, buscaDebounced])

    const executarAnalise = useCallback(async () => {
        if (!arquivo) {
            setErro('Selecione um documento para analisar.')
            return
        }
        setAnalisando(true)
        window.dispatchEvent(new CustomEvent('sgn-analysis-start'))
        setErro(null)
        setProgresso(0)
        setResultado(null)
        setSugerindoNrs(false)

        try {
            setEtapa('Iniciando extração...')

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
            const textoDocumento = extractData.data.texto

            // Se o usuário pedir para sugerir as normas (array vazio), vamos bater na API de sugestão e PARAR a execução para ele revisar.
            if (normasSelecionadas.length === 0) {
                setSugerindoNrs(true)
                setEtapa('IA analisando o escopo do documento...')
                setProgresso(30)

                const sugestaoRes = await fetchWithRetry('/api/ia/sugerir-nrs', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ textoExtraido: textoDocumento }),
                }, { retries: 1, timeoutMs: 30_000 })

                if (sugestaoRes.ok) {
                    const sugestaoData = await sugestaoRes.json()
                    if (sugestaoData.success && sugestaoData.sugeridas) {
                        const sugeridas = sugestaoData.sugeridas as string[]
                        setNormasSelecionadas(sugeridas)
                        const normasTexto = sugeridas.map(n => n.toUpperCase()).join(', ')
                        setErro(`Sugestão de Aplicabilidade: ${normasTexto}. Valide as normas selecionadas e inicie a análise.`)
                    }
                } else {
                    setErro("Não foi possível inferir as normas com IA. Por favor, selecione-as manualmente.")
                }

                setSugerindoNrs(false)
                setAnalisando(false)
                return;
            }

            setEtapa('Iniciando análise...')
            setProgresso(5)

            // Agora enviamos para análise que retorna jobId
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
                    metadata: { nomeArquivoSource: arquivo.name }
                }),
            }, { retries: 1, timeoutMs: 30_000 }) // Timeout curto pois queremos o JobId

            if (!analysisRes.ok) {
                const err = await analysisRes.json().catch(() => ({}))
                throw new Error(err.error || `Erro ${analysisRes.status} ao iniciar análise`)
            }

            const analysisData = await analysisRes.json()
            if (analysisData.success && analysisData.data?.jobId) {
                setJobId(analysisData.data.jobId)
                setEtapa('Job aceito. Acompanhando progresso...')
                // O useEffect de polling assume daqui em diante
            } else if (analysisData.success && !analysisData.data?.jobId) {
                // Caso a API tenha concluído síncronamente (raro mas possível em docs minúsculos)
                setResultado(analysisData.data)
                setProgresso(100)
                setAnalisando(false)
                await carregarHistorico(paginaHistorico, periodoHistorico, ordenacaoHistorico, buscaDebounced)
            }
        } catch (err) {
            window.dispatchEvent(new CustomEvent('sgn-analysis-stop'))
            setErro(err instanceof Error ? err.message : 'Erro desconhecido na análise')
            setAnalisando(false)
        }
    }, [arquivo, normasSelecionadas, carregarHistorico, paginaHistorico, periodoHistorico, ordenacaoHistorico, buscaDebounced])

    const novaAnalise = () => {
        window.dispatchEvent(new CustomEvent('sgn-analysis-stop'))
        setArquivo(null)
        setNormasSelecionadas([])
        setResultado(null)
        setErro(null)
        setProgresso(0)
        setEtapa('')
        setSugerindoNrs(false)
    }

    const podeGatilhoAcao = arquivo && !analisando && !sugerindoNrs
    const formatarDataHoraBrasilia = (isoDate: string) =>
        new Intl.DateTimeFormat('pt-BR', {
            timeZone: 'America/Sao_Paulo',
            dateStyle: 'short',
            timeStyle: 'medium',
        }).format(new Date(isoDate))
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
                            <Card className="h-full glass-mora shadow-blue-900/5">
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
                            <Card className="h-full glass-mora shadow-indigo-900/5">
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
                                        carregando={analisando && progresso < 30}
                                        sugeridas={normasSelecionadas.length > 0 && !analisando ? normasSelecionadas : []}
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Botão de Ação Dinâmico */}
                    <div className="flex justify-center pt-4">
                        <Button
                            size="lg"
                            onClick={executarAnalise}
                            disabled={!arquivo || analisando || sugerindoNrs}
                            className={`
                                h-14 px-10 rounded-2xl font-bold text-lg transition-all duration-500 shadow-xl group
                                ${!arquivo ? 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed' :
                                    normasSelecionadas.length === 0 ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-500/20' :
                                        'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-emerald-500/20 animate-in zoom-in-95'
                                }
                            `}
                        >
                            {analisando ? (
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Processando...</span>
                                </div>
                            ) : sugerindoNrs ? (
                                <div className="flex items-center gap-3">
                                    <Sparkles className="w-5 h-5 animate-pulse" />
                                    <span>IA Mapeando Normas...</span>
                                </div>
                            ) : !arquivo ? (
                                "Aguardando Documento"
                            ) : normasSelecionadas.length === 0 ? (
                                <div className="flex items-center gap-3">
                                    <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                    <span>Sugerir Aplicabilidade</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <CheckSquare className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                    <span>Confirmar e Analisar</span>
                                </div>
                            )}
                        </Button>
                    </div>

                    {/* Erro ou Info */}
                    {erro && (
                        <div className="animate-in fade-in zoom-in-95 duration-300">
                            <ErrorDisplay
                                message={erro}
                                onRetry={executarAnalise}
                                compact
                                variant={(erro.includes('IA pré-selecionou') || erro.includes('Sugestão de Aplicabilidade')) ? 'info' : 'error'}
                            />
                        </div>
                    )}

                    {/* Progresso com Stepper */}
                    {analisando && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-6 p-8 bg-white/40 dark:bg-gray-900/40 backdrop-blur-2xl border border-white/20 dark:border-gray-800 shadow-2xl rounded-3xl">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                                        Análise em Andamento
                                    </h3>
                                    <span className="text-sm font-black text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full">{progresso}%</span>
                                </div>
                                <Progress value={progresso} className="h-2 bg-gray-200 dark:bg-gray-800" />
                            </div>

                            <div className="grid grid-cols-3 gap-4 relative">
                                {[
                                    { label: 'Extração', step: 10, key: 'extract' },
                                    { label: 'Análise', step: 40, key: 'analyze' },
                                    { label: 'Conclusão', step: 90, key: 'finish' }
                                ].map((s, idx) => (
                                    <div key={s.key} className="flex flex-col items-center gap-3 relative z-10">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 shadow-lg ${progresso >= s.step
                                            ? 'bg-blue-600 border-blue-600 text-white scale-110 shadow-blue-500/20 animate-neural'
                                            : 'bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 text-gray-400'
                                            }`}>
                                            {progresso > s.step ? (
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            ) : (
                                                <span className="text-xs font-bold">{idx + 1}</span>
                                            )}
                                        </div>
                                        <span className={`text-[10px] sm:text-xs font-bold tracking-tight uppercase ${progresso >= s.step ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'
                                            }`}>
                                            {s.label}
                                        </span>
                                    </div>
                                ))}
                                {/* Linha conectora */}
                                <div className="absolute top-5 left-[15%] right-[15%] h-[2px] bg-gray-100 dark:bg-gray-800 -z-0">
                                    <div
                                        className="h-full bg-blue-600 transition-all duration-700 ease-in-out shadow-[0_0_8px_rgba(37,99,235,0.5)]"
                                        style={{ width: `${Math.max(0, Math.min(100, (progresso / 100) * 125))}%` }}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-3 py-3 px-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100/50 dark:border-blue-800/30">
                                <div className="h-2 w-2 rounded-full bg-blue-500 animate-ping" />
                                <span className="text-xs sm:text-sm font-medium text-blue-700 dark:text-blue-300 italic shimmer-text">
                                    {etapa}
                                </span>
                            </div>
                        </div>
                    )}

                    <div className="pt-4">
                        <Button
                            onClick={executarAnalise}
                            disabled={!podeGatilhoAcao}
                            size="lg"
                            className="w-full h-14 sm:h-16 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-base sm:text-lg font-bold shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/40 hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                        >
                            <Brain className={`h-6 w-6 mr-3 ${analisando || sugerindoNrs ? 'animate-pulse' : ''}`} />
                            {analisando || sugerindoNrs
                                ? 'Extraindo e processando documento...'
                                : normasSelecionadas.length === 0
                                    ? 'Descobrir Normas Aplicáveis com IA'
                                    : 'Analisar Conformidade com NRs'}
                        </Button>
                    </div>


                    <div className="pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setMostrarHistorico((prev) => !prev)}
                            className="border-gray-300 dark:border-gray-600"
                        >
                            {mostrarHistorico ? 'Ocultar Histórico' : 'Mostrar Histórico'}
                        </Button>
                    </div>

                    {mostrarHistorico ? (
                        <HistoricoAnalisesCard
                            historico={historico}
                            carregandoHistorico={carregandoHistorico}
                            limpandoHistorico={limpandoHistorico}
                            paginaHistorico={paginaHistorico}
                            periodoHistorico={periodoHistorico}
                            ordenacaoHistorico={ordenacaoHistorico}
                            buscaDocumento={buscaDocumento}
                            paginacao={paginacao}
                            formatarDataHoraBrasilia={formatarDataHoraBrasilia}
                            onExportarCsv={exportarHistoricoCsv}
                            onLimparHistorico={limparHistorico}
                            onPeriodoChange={(periodo) => {
                                setPeriodoHistoricoQuery(periodo)
                                setPaginaHistoricoQuery('1')
                            }}
                            onBuscaChange={(value) => {
                                setBuscaDocumentoQuery(value || null)
                                setPaginaHistoricoQuery('1')
                            }}
                            onOrdenacaoChange={(value) => {
                                setOrdenacaoHistoricoQuery(value)
                                setPaginaHistoricoQuery('1')
                            }}
                            onPaginaChange={(novaPagina) => setPaginaHistoricoQuery(String(novaPagina))}
                        />
                    ) : null}
                </div>
            )}
        </div>
    )
}
