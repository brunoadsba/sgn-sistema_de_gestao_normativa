'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { Brain, Sparkles, CheckSquare, Upload } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { UploadDocumento } from './UploadDocumento'
import { SeletorNormas } from './SeletorNormas'
import { ResultadoAnalise } from './ResultadoAnalise'
import { ErrorDisplay } from '@/components/ui/ErrorDisplay'
import { ChatSidePanel } from '@/features/chat-documento/components/ChatSidePanel'
import { ChatFloatingBubble } from '@/features/chat-documento/components/ChatFloatingBubble'
import { HistoricoAnalisesCard } from './HistoricoAnalisesCard'
import { fetchWithRetry } from '@/lib/fetch-with-retry'
import { useQueryState } from 'nuqs'
import { ordenarCodigosNr } from '@/lib/normas/ordem'

interface SeletorNorma {
    id: string
    codigo: string
    titulo: string
    categoria: string
}

interface AnaliseClienteProps {
    normasIniciais: SeletorNorma[]
}

// Tipos alinhados com o HistoricoAnalisesCard
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

type PeriodoHistorico = 'today' | '7d' | '30d' | 'all'
type OrdenacaoHistorico = 'data_desc' | 'data_asc' | 'score_desc' | 'score_asc'

type PaginacaoHistorico = {
    pagina: number
    totalPaginas: number
    temProxima: boolean
    temAnterior: boolean
}

// Usando o tipo oficial do backend para o resultado detalhado
import type { AnaliseConformidadeResponse } from '@/types/ia'

export default function AnaliseCliente({ normasIniciais }: AnaliseClienteProps) {
    // Estados do Fluxo de Análise
    const [arquivo, setArquivo] = useState<File | null>(null)
    const [normasSelecionadas, setNormasSelecionadas] = useState<string[]>([])
    const [analisando, setAnalisando] = useState(false)
    const [progresso, setProgresso] = useState(0)
    const [etapa, setEtapa] = useState('')
    const [resultado, setResultado] = useState<AnaliseConformidadeResponse | null>(null)
    const [erro, setErro] = useState<string | null>(null)
    const [sugerindoNrs, setSugerindoNrs] = useState(false)
    const [jobId, setJobId] = useState<string | null>(null)

    // Estado do Histórico via Nuqs (Compartilhado com GlobalNav)
    const [mostrarHistoricoQuery] = useQueryState('hist_vis', { defaultValue: 'false', shallow: true })
    const mostrarHistorico = mostrarHistoricoQuery === 'true'

    const [historico, setHistorico] = useState<HistoricoAnalise[]>([])
    const [carregandoHistorico, setCarregandoHistorico] = useState(false)
    const [limpandoHistorico, setLimpandoHistorico] = useState(false)

    const [paginaHistoricoQuery, setPaginaHistoricoQuery] = useQueryState('page', { shallow: true })
    const [periodoHistoricoQuery, setPeriodoHistoricoQuery] = useQueryState('period', { shallow: true })
    const [ordenacaoHistoricoQuery, setOrdenacaoHistoricoQuery] = useQueryState('sort', { shallow: true })
    const [buscaDocumentoQuery, setBuscaDocumentoQuery] = useQueryState('q', { shallow: true })
    const [normaPreSelecionada] = useQueryState('norma', { shallow: true })

    useEffect(() => {
        if (normaPreSelecionada) {
            setNormasSelecionadas(ordenarCodigosNr([normaPreSelecionada]))
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
    const [chatAberto, setChatAberto] = useState(false)
    const [textoExtraidoChat, setTextoExtraidoChat] = useState<string | null>(null)
    const cacheExtracaoRef = useRef<Map<string, string>>(new Map())
    const extracaoEmAndamentoRef = useRef<Map<string, Promise<string>>>(new Map())
    const [paginacao, setPaginacao] = useState<PaginacaoHistorico>({
        pagina: 1,
        totalPaginas: 0,
        temProxima: false,
        temAnterior: false,
    })

    const gerarArquivoKey = useCallback((file: File) => {
        return `${file.name}-${file.size}-${file.lastModified}`
    }, [])

    const extrairTextoDocumento = useCallback(async (
        file: File,
        options?: { silencioso?: boolean }
    ): Promise<string> => {
        const key = gerarArquivoKey(file)
        const cacheAtual = cacheExtracaoRef.current.get(key)
        if (cacheAtual) return cacheAtual

        const requisicaoAtual = extracaoEmAndamentoRef.current.get(key)
        if (requisicaoAtual) return requisicaoAtual

        const silencioso = options?.silencioso ?? false
        const requisicao = (async () => {
            const formData = new FormData()
            formData.append('file', file)

            const response = await fetchWithRetry('/api/extrair-texto', {
                method: 'POST',
                body: formData,
            }, { retries: silencioso ? 1 : 3, timeoutMs: silencioso ? 30_000 : 60_000 })

            if (!response.ok) {
                if (response.status === 413) {
                    throw new Error('O arquivo excede o limite de 4.5MB permitido pelo ambiente em nuvem (Vercel). Para documentos maiores, utilize a plataforma via Docker Local ou divida o arquivo.')
                }
                const err = await response.json().catch(() => ({}))
                throw new Error(err.error || `Erro ${response.status} ao extrair texto`)
            }

            const payload = await response.json()
            const texto = payload?.data?.texto
            if (typeof texto !== 'string' || texto.length === 0) {
                throw new Error('Resposta inválida ao extrair texto do documento')
            }

            cacheExtracaoRef.current.set(key, texto)
            return texto
        })()

        extracaoEmAndamentoRef.current.set(key, requisicao)

        try {
            return await requisicao
        } finally {
            extracaoEmAndamentoRef.current.delete(key)
        }
    }, [gerarArquivoKey])

    useEffect(() => {
        if (!arquivo) {
            setTextoExtraidoChat(null)
            return
        }

        const key = gerarArquivoKey(arquivo)
        const textoCache = cacheExtracaoRef.current.get(key) ?? null
        setTextoExtraidoChat(textoCache)
    }, [arquivo, gerarArquivoKey])

    // Extração automática para o Chat em Background (deduplicada com cache/in-flight)
    useEffect(() => {
        if (!arquivo || analisando) return
        let cancelado = false

        const extrairParaChat = async () => {
            try {
                const texto = await extrairTextoDocumento(arquivo, { silencioso: true })
                if (!cancelado) setTextoExtraidoChat(texto)
            } catch (e) {
                if (cancelado) return
                const mensagem = e instanceof Error ? e.message : 'Erro desconhecido'
                if (mensagem.includes('4.5MB')) {
                    console.error('Documento muito grande para extração silenciosa de chat.')
                    return
                }
                console.error('Erro na extração silenciosa para chat:', e)
            }
        }

        void extrairParaChat()

        return () => {
            cancelado = true
        }
    }, [arquivo, analisando, extrairTextoDocumento])

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
            const textoDocumento = await extrairTextoDocumento(arquivo, { silencioso: false })
            setTextoExtraidoChat((anterior) => anterior ?? textoDocumento)

            if (normasSelecionadas.length === 0) {
                setSugerindoNrs(true)
                setEtapa('IA analisando o escopo do documento...')
                setProgresso(30)

                const sugestaoRes = await fetchWithRetry('/api/ia/sugerir-nrs', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ textoExtraido: textoDocumento, tipoDocumento: 'OUTRO' }),
                }, { retries: 1, timeoutMs: 30_000 })

                if (sugestaoRes.ok) {
                    const sugestaoData = await sugestaoRes.json()
                    if (sugestaoData.success && sugestaoData.sugeridas) {
                        const sugeridas = ordenarCodigosNr(sugestaoData.sugeridas as string[])
                        setNormasSelecionadas(sugeridas)
                        const normasTexto = sugeridas.join(', ')
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
            }, { retries: 1, timeoutMs: 30_000 })

            if (!analysisRes.ok) {
                const err = await analysisRes.json().catch(() => ({}))
                throw new Error(err.error || `Erro ${analysisRes.status} ao iniciar análise`)
            }

            const analysisData = await analysisRes.json()
            if (analysisData.success && analysisData.data?.jobId) {
                setJobId(analysisData.data.jobId)
                setEtapa('Job aceito. Acompanhando progresso...')
            } else if (analysisData.success && !analysisData.data?.jobId) {
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
    }, [arquivo, normasSelecionadas, carregarHistorico, paginaHistorico, periodoHistorico, ordenacaoHistorico, buscaDebounced, extrairTextoDocumento])

    const novaAnalise = () => {
        window.dispatchEvent(new CustomEvent('sgn-analysis-stop'))
        setArquivo(null)
        setNormasSelecionadas([])
        setResultado(null)
        setErro(null)
        setProgresso(0)
        setEtapa('')
        setSugerindoNrs(false)
        setTextoExtraidoChat(null)
        cacheExtracaoRef.current.clear()
        extracaoEmAndamentoRef.current.clear()
    }

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
        <div className={`container mx-auto px-3 sm:px-4 transition-all duration-500 ${mostrarHistorico ? 'max-w-7xl' : 'max-w-5xl'}`}>
            {/* Header */}
            <div className="relative mb-8 sm:mb-12">
                <div className="text-center relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-blue-500/20 blur-3xl -z-10 rounded-full"></div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-indigo-900 to-gray-900 dark:from-gray-100 dark:via-indigo-300 dark:to-gray-100 tracking-tighter mb-3 sm:mb-4 pb-2 leading-normal">
                        Análise de Conformidade
                    </h1>
                    <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
                        Faça upload do seu documento SST e deixe nossa IA identificar gaps e gerar recomendações precisas instantaneamente.
                    </p>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 items-start">
                <div className="flex-1 min-w-0 w-full">
                    {resultado ? (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <ResultadoAnalise resultado={resultado} onNovaAnalise={novaAnalise} onChatOpen={() => setChatAberto(true)} />
                        </div>
                    ) : (
                        <div className="space-y-8">
                            <AnimatePresence mode="wait">
                                {!analisando ? (
                                    <motion.div
                                        key="config-grid"
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
                                        transition={{ duration: 0.4 }}
                                        className="flex flex-col sm:flex-row gap-8 items-stretch"
                                    >
                                        {/* Esquerda - Upload */}
                                        <div className="flex-1 min-w-0">
                                            <Card className="h-full glass-mora shadow-blue-900/5">
                                                <CardHeader className="pb-4 border-b border-gray-100/50 dark:border-gray-700/40">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">1</div>
                                                        <CardTitle className="text-lg lg:text-xl dark:text-gray-100">Envio do Documento</CardTitle>
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
                                        <div className="flex-1 min-w-0">
                                            <Card className="h-full glass-mora shadow-indigo-900/5">
                                                <CardHeader className="pb-4 border-b border-gray-100/50 dark:border-gray-700/40">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">2</div>
                                                        <CardTitle className="text-lg lg:text-xl dark:text-gray-100">Normas Aplicáveis</CardTitle>
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="pt-6 h-[calc(100%-5rem)]">
                                                    <SeletorNormas
                                                        normas={normasIniciais}
                                                        selecionadas={normasSelecionadas}
                                                        onSelecaoChange={(s) => { setNormasSelecionadas(ordenarCodigosNr(s)); setErro(null) }}
                                                        carregando={analisando && progresso < 30}
                                                        sugeridas={normasSelecionadas.length > 0 && !analisando ? normasSelecionadas : []}
                                                    />
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="processing-stepper"
                                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        transition={{ duration: 0.5, type: "spring", damping: 20 }}
                                        className="w-full"
                                    >
                                        <div className="p-1 rounded-[2.5rem] bg-gradient-to-b from-blue-500/20 to-indigo-500/20 border border-white/10 shadow-2xl overflow-hidden">
                                            <div className="bg-white/70 dark:bg-gray-900/80 backdrop-blur-3xl rounded-[2.4rem] p-8 sm:p-10 space-y-8">
                                                {/* Badge de Resumo do Job */}
                                                <div className="flex flex-wrap gap-4 items-center p-4 rounded-2xl bg-gray-50/50 dark:bg-gray-950/40 border border-white/20 dark:border-white/5">
                                                    <div className="flex items-center gap-2">
                                                        <Upload className="w-4 h-4 text-blue-500" />
                                                        <span className="text-xs font-black text-gray-900 dark:text-gray-100 truncate max-w-[150px]">{arquivo?.name}</span>
                                                    </div>
                                                    <div className="h-4 w-px bg-gray-200 dark:bg-gray-800 hidden sm:block" />
                                                    <div className="flex items-center gap-2">
                                                        <Sparkles className="w-4 h-4 text-indigo-500" />
                                                        <span className="text-xs font-black text-gray-500 uppercase tracking-widest">
                                                            {normasSelecionadas.length > 0 ? normasSelecionadas.join(', ') : 'Normas Gerais'}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Header do Stepper */}
                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-1">
                                                        <h3 className="text-xl font-black tracking-tight text-gray-900 dark:text-gray-100 uppercase">
                                                            Processamento Neural
                                                        </h3>
                                                        <div className="flex items-center gap-2">
                                                            <motion.div
                                                                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                                                                transition={{ repeat: Infinity, duration: 2 }}
                                                                className="h-2 w-2 rounded-full bg-emerald-500"
                                                            />
                                                            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest leading-none">Status: {etapa}</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <motion.span
                                                            key={progresso}
                                                            initial={{ opacity: 0, scale: 0.5 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            className="text-3xl font-black text-blue-600 dark:text-blue-400 tabular-nums"
                                                        >
                                                            {progresso}%
                                                        </motion.span>
                                                    </div>
                                                </div>

                                                {/* Track Neural */}
                                                <div className="relative pt-6 pb-2 px-4">
                                                    {/* Background Line */}
                                                    <div className="absolute top-[35%] left-0 right-0 h-1bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${progresso}%` }}
                                                            transition={{ duration: 1, ease: "easeOut" }}
                                                            className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 shadow-[0_0_15px_rgba(37,99,235,0.6)]"
                                                        />
                                                    </div>

                                                    {/* Steps Nodes */}
                                                    <div className="relative z-10 flex justify-between items-center h-16">
                                                        {[
                                                            { label: 'Ingestão', step: 10, icon: Upload },
                                                            { label: 'Cérebro SGN', step: 40, icon: Brain },
                                                            { label: 'Veredito', step: 90, icon: CheckSquare }
                                                        ].map((s, idx) => {
                                                            const active = progresso >= s.step;
                                                            const done = progresso > s.step + 10;

                                                            return (
                                                                <div key={idx} className="flex flex-col items-center gap-4">
                                                                    <motion.div
                                                                        animate={active ? {
                                                                            scale: [1, 1.1, 1],
                                                                            boxShadow: ["0px 0px 0px rgba(37,99,235,0)", "0px 0px 20px rgba(37,99,235,0.4)", "0px 0px 0px rgba(37,99,235,0)"]
                                                                        } : {}}
                                                                        transition={{ repeat: Infinity, duration: 3 }}
                                                                        className={`
                                                                            w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-700
                                                                            ${active
                                                                                ? 'bg-blue-600 border-blue-500 text-white shadow-lg'
                                                                                : 'bg-white dark:bg-gray-950 border-gray-100 dark:border-gray-800 text-gray-300'
                                                                            }
                                                                        `}
                                                                    >
                                                                        {done ? (
                                                                            <CheckSquare className="w-5 h-5" />
                                                                        ) : (
                                                                            <s.icon className={`w-5 h-5 ${active ? 'animate-pulse' : ''}`} />
                                                                        )}
                                                                    </motion.div>
                                                                    <span className={`text-[10px] font-black uppercase tracking-widest ${active ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}>
                                                                        {s.label}
                                                                    </span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>

                                                {/* Logs Imersivos (Console Mini) */}
                                                <div className="bg-gray-950 rounded-2xl p-4 border border-white/5 font-mono text-[10px] sm:text-xs text-blue-400/80 space-y-1 overflow-hidden h-24 relative shadow-inner">
                                                    <div className="absolute top-2 right-4 flex gap-1">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-red-500/50" />
                                                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/50" />
                                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500/50" />
                                                    </div>
                                                    <div className="overflow-y-auto h-full scrollbar-hidden">
                                                        <AnimatePresence mode="popLayout">
                                                            <motion.p
                                                                key={etapa}
                                                                initial={{ opacity: 0, x: -10 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                className="flex gap-3"
                                                            >
                                                                <span className="text-gray-600 shrink-0">[{new Date().toLocaleTimeString()}]</span>
                                                                <span className="font-bold">SYSTEM: {etapa}</span>
                                                            </motion.p>
                                                        </AnimatePresence>
                                                        <p className="flex gap-3 opacity-30">
                                                            <span className="text-gray-600 shrink-0">[{new Date().toLocaleTimeString()}]</span>
                                                            <span>KERNEL: PROCESSED_CHUNK_ID_{Math.floor(Math.random() * 1000)}</span>
                                                        </p>
                                                        <p className="flex gap-3 opacity-20">
                                                            <span className="text-gray-600 shrink-0">[{new Date().toLocaleTimeString()}]</span>
                                                            <span>ENGINE: NEURAL_CONSISTENCY_CHECK_{progresso}%</span>
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Ação Central Unificada - Container Premium */}
                            <div className="flex flex-col items-center gap-6 pt-4">
                                <Button
                                    size="lg"
                                    onClick={executarAnalise}
                                    disabled={!arquivo || analisando || sugerindoNrs}
                                    className={`
                                        h-16 sm:h-20 px-12 rounded-3xl font-black text-lg sm:text-xl transition-all duration-500 group relative overflow-hidden
                                        ${!arquivo
                                            ? 'bg-gray-100 dark:bg-gray-800/50 text-gray-400 cursor-not-allowed border-2 border-dashed border-gray-200 dark:border-gray-700'
                                            : normasSelecionadas.length === 0
                                                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-2xl shadow-blue-500/30'
                                                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xl shadow-indigo-500/30'
                                        }
                                        ${analisando || sugerindoNrs ? 'scale-90 opacity-0 pointer-events-none' : 'hover:-translate-y-2 hover:scale-[1.02]'}
                                    `}
                                >
                                    {/* Efeito de Reflexo no Hover */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

                                    <div className="relative flex items-center gap-4">
                                        {analisando ? (
                                            <>
                                                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                                <span>Extraindo e analisando...</span>
                                            </>
                                        ) : sugerindoNrs ? (
                                            <>
                                                <Sparkles className="w-6 h-6 animate-pulse" />
                                                <span>IA Mapeando Normas...</span>
                                            </>
                                        ) : !arquivo ? (
                                            "Aguardando Documento"
                                        ) : normasSelecionadas.length === 0 ? (
                                            <>
                                                <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                                                <span>Sugerir Normas com IA</span>
                                            </>
                                        ) : (
                                            <>
                                                <Brain className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                                <span>Analisar Conformidade</span>
                                            </>
                                        )}
                                    </div>
                                </Button>

                                {erro && (
                                    <div className="w-full max-w-2xl animate-in zoom-in-95 fade-in duration-300">
                                        <ErrorDisplay
                                            message={erro}
                                            onRetry={executarAnalise}
                                            compact
                                            variant={(erro.includes('IA pré-selecionou') || erro.includes('Sugestão de Aplicabilidade')) ? 'info' : 'error'}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {mostrarHistorico && (
                    <div className="w-full lg:w-[450px] lg:sticky lg:top-24 animate-in fade-in slide-in-from-right-4 duration-500">
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
                    </div>
                )}
            </div>

            {/* COMPONENTES DE CHAT (PROTÓTIPOS) */}
            {arquivo && (
                <>
                    <ChatSidePanel
                        isOpen={chatAberto}
                        onClose={() => setChatAberto(false)}
                        documentContext={textoExtraidoChat}
                    />
                    <ChatFloatingBubble documentContext={textoExtraidoChat} />
                </>
            )}
        </div>
    )
}
