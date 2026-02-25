'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  CheckCircle, AlertTriangle, Shield,
  ArrowRight, RotateCcw,
  Printer, MessageSquare
} from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { AnaliseConformidadeResponse, GapConformidade } from '@/types/ia'
import { motion } from 'framer-motion'

interface ResultadoAnaliseProps {
  resultado: AnaliseConformidadeResponse
  onNovaAnalise: () => void
  onChatOpen: () => void
}


const CONFIG_RISCO = {
  baixo: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-600 dark:text-emerald-400', label: 'Risco Baixo' },
  medio: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-600 dark:text-amber-400', label: 'Risco Médio' },
  alto: { bg: 'bg-orange-500/10', border: 'border-orange-500/20', text: 'text-orange-600 dark:text-orange-400', label: 'Risco Alto' },
  critico: { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-600 dark:text-red-400', label: 'Risco Crítico' },
} as const

const CONFIG_SEVERIDADE: Record<string, { badge: string; border: string; icon: string }> = {
  baixa: { badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', border: 'border-l-emerald-500', icon: 'text-emerald-500' },
  media: { badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400', border: 'border-l-amber-500', icon: 'text-amber-500' },
  alta: { badge: 'bg-orange-500/10 text-orange-600 dark:text-orange-400', border: 'border-l-orange-500', icon: 'text-orange-500' },
  critica: { badge: 'bg-red-500/10 text-red-600 dark:text-red-400', border: 'border-l-red-500', icon: 'text-red-500' },
}

const ORDEM_SEVERIDADE: Record<string, number> = {
  critica: 0,
  alta: 1,
  media: 2,
  baixa: 3,
}

function formatarDataHora(data: Date): string {
  const dataParte = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(data)
  const horaParte = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(data)
  return `${dataParte} ${horaParte}`
}

function gerarTituloRelatorioParaImpressao(): string {
  const agora = new Date()
  const dataBr = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(agora)
  const horaBr = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(agora)

  // Mantém padrão estável e compatível com nomes de arquivo.
  const dataSegura = dataBr.replace(/\//g, '-')
  const horaSegura = horaBr.replace(':', '-')
  return `Relatório_SGN_${dataSegura}_${horaSegura}`
}

function formatarNivelRisco(nivel: AnaliseConformidadeResponse['nivelRisco']): string {
  const mapa = {
    baixo: 'Baixo',
    medio: 'Médio',
    alto: 'Alto',
    critico: 'Crítico',
  } as const

  return mapa[nivel] ?? 'Médio'
}

function formatarSeveridadeRelatorio(severidade: GapConformidade['severidade']): string {
  const mapa = {
    critica: 'CRÍTICA',
    alta: 'ALTA',
    media: 'MÉDIA',
    baixa: 'BAIXA',
  } as const

  return mapa[severidade] ?? String(severidade).toUpperCase()
}

function limparResumoRelatorio(texto: string): string {
  if (!texto) return ''

  const linhasLimpas = texto
    .replace(/\r\n/g, '\n')
    .replace(/An[aá]lise consolidada de \d+ blocos do documento\.?/gi, '')
    .replace(/\bPontos-?Chave\b:?/gi, '')
    .split('\n')
    .map((linha) => linha.trim())
    .join('\n')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  return linhasLimpas
}

function ScoreIndicador({ score }: { score: number }) {
  const cor =
    score >= 80 ? 'text-emerald-600'
      : score >= 60 ? 'text-amber-600'
        : score >= 40 ? 'text-orange-600'
          : 'text-red-600'

  const bgCor =
    score >= 80 ? 'bg-emerald-500/5 border-emerald-500/20'
      : score >= 60 ? 'bg-amber-500/5 border-amber-500/20'
        : score >= 40 ? 'bg-orange-500/5 border-orange-500/20'
          : 'bg-red-500/5 border-red-500/20'

  const porcentagem = Math.min(100, Math.max(0, score))
  const circunferencia = 2 * Math.PI * 40
  const offset = circunferencia - (porcentagem / 100) * circunferencia
  const corTraco = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : score >= 40 ? '#f97316' : '#ef4444'

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={`flex flex-col items-center justify-center p-8 rounded-[2rem] border ${bgCor} min-w-[180px] bg-white/50 dark:bg-gray-900/50 backdrop-blur-3xl relative overflow-hidden transition-all duration-500`}
    >
      <div className="relative w-28 h-28">
        <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="4" className="text-gray-100 dark:text-gray-800" />
          <motion.circle
            initial={{ strokeDashoffset: circunferencia }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 2, ease: "easeOut" }}
            cx="50" cy="50" r="42"
            fill="none"
            stroke={corTraco}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circunferencia}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-4xl font-black tracking-tighter leading-none ${cor}`}>{score}</span>
        </div>
      </div>
      <span className={`text-[9px] font-black uppercase tracking-[0.2em] mt-3 ${cor} bg-white/50 dark:bg-black/20 px-3 py-1 rounded-full border border-white/20`}>
        {score >= 80 ? 'Excelente' : score >= 60 ? 'Parcial' : score >= 40 ? 'Baixa' : 'Crítica'}
      </span>
    </motion.div>
  )
}

function GapItem({ gap }: { gap: GapConformidade }) {
  const config = CONFIG_SEVERIDADE[gap.severidade] || CONFIG_SEVERIDADE.media

  return (
    <motion.div
      className={`group p-6 rounded-2xl bg-white/50 dark:bg-gray-950/30 border border-gray-100 dark:border-white/5 hover:border-indigo-500/30 transition-all duration-300 flex flex-col gap-4`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${config.badge}`}>
              {gap.severidade}
            </span>
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-2 py-0.5 border border-gray-100 dark:border-gray-800 rounded-lg">
              {gap.categoria}
            </span>
            {gap.classificacao && (
              <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest px-2 py-0.5 border border-indigo-200 dark:border-indigo-800 rounded-lg">
                GUT {gap.classificacao}
              </span>
            )}
            {gap.prazoDias != null && (
              <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">
                Prazo: {gap.prazoDias}d
              </span>
            )}
          </div>
          <h4 className="text-[15px] font-bold text-gray-900 dark:text-gray-100 leading-tight">
            {gap.descricao}
          </h4>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-gray-50/50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
        <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-1.5 mb-1">
          <ArrowRight className="w-3 h-3" /> Recomendação
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
          {gap.recomendacao}
        </p>
      </div>
    </motion.div>
  )
}

export function ResultadoAnalise({ resultado, onNovaAnalise, onChatOpen }: ResultadoAnaliseProps) {
  const gapsPorTipo = useMemo(() => {
    return {
      critica: resultado.gaps.filter((g) => g.severidade === 'critica'),
      alta: resultado.gaps.filter((g) => g.severidade === 'alta'),
      media: resultado.gaps.filter((g) => g.severidade === 'media'),
      baixa: resultado.gaps.filter((g) => g.severidade === 'baixa'),
    }
  }, [resultado.gaps])

  const defaultAccordionValues = useMemo(() => {
    const values = []
    if (gapsPorTipo.critica.length > 0) values.push('item-critica')
    if (gapsPorTipo.alta.length > 0) values.push('item-alta')
    return values
  }, [gapsPorTipo])

  const dataGeracao = useMemo(() => new Date(), [])

  const gapsOrdenadosPrint = useMemo(() => {
    return [...resultado.gaps].sort((a, b) => {
      const ordemA = ORDEM_SEVERIDADE[a.severidade] ?? 9
      const ordemB = ORDEM_SEVERIDADE[b.severidade] ?? 9
      return ordemA - ordemB
    })
  }, [resultado.gaps])

  const resumoLimpo = useMemo(() => limparResumoRelatorio(resultado.resumo ?? ''), [resultado.resumo])
  const resumoExibicao = resumoLimpo || 'Resumo executivo indisponível.'

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  const [previewImpressao, setPreviewImpressao] = useState(false)

  useEffect(() => {
    document.body.classList.toggle('print-preview-active', previewImpressao)
    return () => document.body.classList.remove('print-preview-active')
  }, [previewImpressao])

  const handlePrint = () => {
    const tituloOriginal = document.title
    const novoTitulo = gerarTituloRelatorioParaImpressao()
    document.title = novoTitulo

    const restaurarTitulo = () => {
      document.title = tituloOriginal
      window.removeEventListener('afterprint', restaurarTitulo)
    }

    window.addEventListener('afterprint', restaurarTitulo, { once: true })
    window.print()

    // Fallback para navegadores/ambientes que não disparam afterprint de forma confiável.
    window.setTimeout(restaurarTitulo, 1500)
  }
  const abrirPreviewImpressao = () => setPreviewImpressao(true)
  const fecharPreviewImpressao = () => setPreviewImpressao(false)

  return (
    <>
      {previewImpressao && (
        <div className="no-print screen-print-preview-toolbar">
          <div className="screen-print-preview-toolbar__inner">
            <div className="screen-print-preview-toolbar__actions flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={fecharPreviewImpressao} className="whitespace-nowrap">
                Fechar visualização
              </Button>
              <Button size="sm" onClick={handlePrint} className="bg-gray-900 text-white hover:bg-gray-800 whitespace-nowrap">
                Imprimir / Salvar PDF
              </Button>
            </div>
          </div>
        </div>
      )}

      <section className={`${previewImpressao ? 'screen-print-preview-page' : 'only-print'} print-report text-black`}>
        <header className="border-b border-black pb-4 mb-6">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="text-[9pt] uppercase tracking-[0.15em] text-gray-600 mb-2">
                SGN • Sistema de Gestão Normativa
              </p>
              <h1 className="text-[20pt] font-bold leading-tight">
                Relatório Técnico de Conformidade SST
              </h1>
            </div>
            <div className="text-right text-[9pt]">
              <p><span className="font-semibold">Gerado em:</span> {formatarDataHora(dataGeracao)}</p>
            </div>
          </div>
        </header>

        <section className="avoid-break mb-6">
          <h2 className="text-[13pt] font-semibold uppercase tracking-wide mb-2">Resumo Executivo</h2>
          <div className="grid grid-cols-3 gap-4 mb-3 text-[10pt]">
            <div className="border border-gray-300 rounded p-3">
              <p className="text-[8.5pt] uppercase tracking-wide text-gray-600">Score geral</p>
              <p className="text-[18pt] font-bold leading-none mt-1">{resultado.score}</p>
            </div>
            <div className="border border-gray-300 rounded p-3">
              <p className="text-[8.5pt] uppercase tracking-wide text-gray-600">Nível de risco</p>
              <p className="text-[14pt] font-semibold leading-none mt-2">
                {formatarNivelRisco(resultado.nivelRisco)}
              </p>
            </div>
            <div className="border border-gray-300 rounded p-3">
              <p className="text-[8.5pt] uppercase tracking-wide text-gray-600">Total de gaps</p>
              <p className="text-[18pt] font-bold leading-none mt-1">{resultado.gaps.length}</p>
            </div>
          </div>
          <p className="text-[10.5pt] leading-7 whitespace-pre-line">{resumoExibicao}</p>
        </section>

        <section className="avoid-break mb-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <p className="text-[10pt] font-semibold mb-1">Pontos Fortes</p>
              {resultado.pontosPositivos.length > 0 ? (
                <ul className="list-disc ml-5 text-[10pt] leading-7 space-y-1.5">
                  {resultado.pontosPositivos.map((item, i) => <li key={`pp-${i}`}>{item}</li>)}
                </ul>
              ) : (
                <p className="text-[10pt] text-gray-600">-</p>
              )}
            </div>
            <div className="space-y-2">
              <p className="text-[10pt] font-semibold mb-1">Pontos de Atenção</p>
              {resultado.pontosAtencao.length > 0 ? (
                <ul className="list-disc ml-5 text-[10pt] leading-7 space-y-1.5">
                  {resultado.pontosAtencao.map((item, i) => <li key={`pa-${i}`}>{item}</li>)}
                </ul>
              ) : (
                <p className="text-[10pt] text-gray-600">-</p>
              )}
            </div>
          </div>
        </section>

        <section className="mb-5">
          <h2 className="print-keep-with-next text-[13pt] font-semibold uppercase tracking-wide mb-2">Matriz de Gaps</h2>
          <table className="print-table w-full border-collapse text-[9.5pt]">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left border border-gray-300 p-2">Severidade</th>
                <th className="text-left border border-gray-300 p-2">Categoria</th>
                <th className="text-left border border-gray-300 p-2">Descrição</th>
                <th className="text-left border border-gray-300 p-2">Recomendação</th>
              </tr>
            </thead>
            <tbody>
              {gapsOrdenadosPrint.map((gap, i) => (
                <tr key={gap.id || i} className="align-top">
                  <td className="border border-gray-300 p-2 font-semibold uppercase">{formatarSeveridadeRelatorio(gap.severidade)}</td>
                  <td className="border border-gray-300 p-2">{gap.categoria || '-'}</td>
                  <td className="border border-gray-300 p-2">{gap.descricao}</td>
                  <td className="border border-gray-300 p-2">
                    {gap.recomendacao}
                    {gap.prazoDias != null ? ` (Prazo sugerido: ${gap.prazoDias} dias)` : ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="avoid-break mb-6">
          <h2 className="print-keep-with-next text-[13pt] font-semibold uppercase tracking-wide mb-2">Plano de Ação</h2>
          {resultado.planoAcao && resultado.planoAcao.length > 0 ? (
            <table className="print-table w-full border-collapse text-[9.5pt]">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left border border-gray-300 p-2">Ação</th>
                  <th className="text-left border border-gray-300 p-2">Responsável</th>
                  <th className="text-left border border-gray-300 p-2">Prazo</th>
                  <th className="text-left border border-gray-300 p-2">Evidência/KPI</th>
                </tr>
              </thead>
              <tbody>
                {resultado.planoAcao.map((acao) => (
                  <tr key={acao.id} className="align-top">
                    <td className="border border-gray-300 p-2">{acao.what}</td>
                    <td className="border border-gray-300 p-2">{acao.who}</td>
                    <td className="border border-gray-300 p-2">{acao.prazoDias} dias</td>
                    <td className="border border-gray-300 p-2">{acao.evidenciaConclusao || acao.kpi || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <ol className="list-decimal ml-5 text-[10pt] leading-relaxed">
              {resultado.proximosPassos.map((passo, i) => <li key={`ps-${i}`}>{passo}</li>)}
            </ol>
          )}
        </section>

        <footer className="text-[8.5pt] border-t border-gray-300 pt-3 text-gray-600">
          <p>Relatório técnico emitido localmente no SGN para suporte à auditoria interna SST.</p>
          <p>Fonte: análise de IA baseada no documento enviado e NRs selecionadas no contexto da sessão.</p>
        </footer>
      </section>

      {!previewImpressao && (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="space-y-12 pb-20 no-print"
        >

      {/* DASHBOARD SST */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <div className="lg:col-span-3">
          <ScoreIndicador score={resultado.score} />
        </div>

        <div className="lg:col-span-9">
          <Card className="h-full border border-gray-100 dark:border-white/5 bg-white/@50 dark:bg-gray-950/30 backdrop-blur-2xl rounded-[2rem] shadow-sm overflow-hidden relative">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[10px] font-black uppercase tracking-widest text-gray-400">Resumo da Auditoria</CardTitle>
                <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border font-black text-[10px] uppercase shadow-sm ${CONFIG_RISCO[resultado.nivelRisco || 'medio'].bg} ${CONFIG_RISCO[resultado.nivelRisco || 'medio'].border} ${CONFIG_RISCO[resultado.nivelRisco || 'medio'].text}`}>
                  <Shield className="w-3.5 h-3.5" />
                  {CONFIG_RISCO[resultado.nivelRisco || 'medio'].label}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Documento</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">{resultado.nomeArquivo || 'Relatório de SST'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Data</p>
                  <p className="text-sm font-bold text-gray-600 dark:text-gray-300">{new Date().toLocaleDateString('pt-BR')}</p>
                </div>
                <div className="flex flex-wrap gap-2 pt-2 sm:pt-0 sm:justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onChatOpen}
                    className="rounded-xl font-bold text-[10px] uppercase h-9 border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                  >
                    <MessageSquare className="w-3.5 h-3.5 mr-2" /> Chat
                  </Button>
                  <Button variant="outline" size="sm" onClick={abrirPreviewImpressao} className="rounded-xl font-bold text-[10px] uppercase h-9">
                    <Printer className="w-3.5 h-3.5 mr-2" /> Visualizar impressão
                  </Button>
                  <Button variant="ghost" size="sm" onClick={onNovaAnalise} className="rounded-xl font-bold text-[10px] uppercase h-9 text-gray-400">
                    <RotateCcw className="w-3.5 h-3.5 mr-2" /> Novo
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* SUMÁRIO EXECUTIVO */}
      <motion.div variants={itemVariants}>
        <div className="bg-gray-50/50 dark:bg-gray-900/40 rounded-[2rem] p-8 border border-gray-100 dark:border-white/5">
          <h3 className="text-[9px] font-black text-indigo-500 uppercase tracking-[0.3em] mb-4">Veredito da IA</h3>
          <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-200 leading-relaxed font-bold tracking-tight italic">
            &ldquo;{resumoExibicao}&rdquo;
          </p>
        </div>
      </motion.div>

      {/* PONTOS POSITIVOS E ATENÇÃO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div variants={itemVariants}>
          <div className="p-6 rounded-[2rem] bg-white/50 dark:bg-gray-950/20 border border-gray-100 dark:border-white/5 h-full">
            <div className="flex items-center gap-3 mb-6">
              <CheckCircle className="w-6 h-6 text-emerald-500" />
              <span className="text-base font-black uppercase tracking-tight">Pontos Fortes</span>
            </div>
            <ul className="space-y-3">
              {resultado.pontosPositivos?.map((ponto, i) => (
                <li key={i} className="flex gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  {ponto}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <div className="p-6 rounded-[2rem] bg-white/50 dark:bg-gray-950/20 border border-gray-100 dark:border-white/5 h-full">
            <div className="flex items-center gap-3 mb-6">
              <AlertTriangle className="w-6 h-6 text-amber-500" />
              <span className="text-base font-black uppercase tracking-tight">Oportunidades de Melhoria</span>
            </div>
            <ul className="space-y-3">
              {resultado.pontosAtencao?.map((ponto, i) => (
                <li key={i} className="flex gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  {ponto}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>

      {/* ANÁLISE DE GAPS */}
      <motion.div variants={itemVariants} className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-red-500/10 rounded-3xl rotate-3 shadow-xl shadow-red-500/10">
              <Shield className="w-10 h-10 text-red-500" />
            </div>
            <div>
              <h2 className="text-4xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tighter leading-none">Matriz de Gaps</h2>
              <p className="text-xs font-black text-gray-400 uppercase tracking-[0.4em] mt-2">Mapeamento de Riscos e Exposição</p>
            </div>
          </div>
          <div className="hidden sm:block text-right">
            <span className="text-5xl font-black text-gray-100 dark:text-gray-800 tabular-nums leading-none">{resultado.gaps.length}</span>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest -mt-1">Inconformidades</p>
          </div>
        </div>

        <div className="space-y-6">
          <Accordion type="multiple" defaultValue={defaultAccordionValues} className="space-y-6 border-none">
            {resultado.gaps.length === 0 ? (
              <div className="py-20 text-center space-y-4 rounded-[3rem] border-4 border-dashed border-gray-100 dark:border-gray-900/50 bg-gray-50/50 dark:bg-gray-950/20">
                <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto opacity-50" />
                <p className="text-gray-500 font-black uppercase tracking-[0.3em] text-lg">Nenhum Gap Detectado</p>
              </div>
            ) : (
              (['critica', 'alta', 'media', 'baixa'] as const)
                .filter(sev => gapsPorTipo[sev]?.length > 0)
                .map((sev) => (
                  <AccordionItem key={sev} value={`item-${sev}`} className="border-none">
                    <AccordionTrigger className={`flex w-full items-center justify-between p-8 rounded-[2rem] border-2 hover:no-underline group transition-all duration-500 ${CONFIG_SEVERIDADE[sev].badge} bg-opacity-20 border-opacity-30 hover:bg-opacity-40 hover:scale-[1.01] shadow-xl hover:shadow-2xl`}>
                      <div className="flex items-center gap-6">
                        <div className={`p-4 rounded-3xl ${CONFIG_SEVERIDADE[sev].badge} bg-opacity-30 shadow-inner group-hover:rotate-12 transition-transform`}>
                          <AlertTriangle className="h-8 w-8" />
                        </div>
                        <div className="text-left">
                          <span className="text-2xl font-black uppercase tracking-tighter">Severidade {sev}</span>
                          <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 leading-none mt-1">{gapsPorTipo[sev].length} Itens Identificados</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-8 pb-4 space-y-6 px-4">
                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        {gapsPorTipo[sev].map((gap, i) => (
                          <GapItem key={gap.id || i} gap={gap} />
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))
            )}
          </Accordion>
        </div>
      </motion.div>

      {/* PRÓXIMOS PASSOS / PLANO 5W2H */}
      <motion.div variants={itemVariants} className="space-y-6">
        <div className="flex items-center gap-3">
          <ArrowRight className="w-6 h-6 text-indigo-500" />
          <span className="text-lg font-black uppercase tracking-tighter">Plano de Ação Remediadora</span>
        </div>
        {resultado.planoAcao && resultado.planoAcao.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {resultado.planoAcao.map((acao) => (
              <div key={acao.id} className="p-6 rounded-2xl bg-white/50 dark:bg-gray-950/20 border border-gray-100 dark:border-white/5">
                <div className="text-[10px] font-black text-indigo-500 mb-2 uppercase">{acao.id}</div>
                <p className="text-sm text-gray-900 dark:text-gray-100 font-bold leading-relaxed mb-2">{acao.what}</p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-1">
                  <span className="font-semibold">Responsável:</span> {acao.who}
                </p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-1">
                  <span className="font-semibold">Prazo:</span> {acao.prazoDias} dias
                </p>
                {acao.evidenciaConclusao && (
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-1">
                    <span className="font-semibold">Evidência:</span> {acao.evidenciaConclusao}
                  </p>
                )}
                {acao.kpi && (
                  <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                    KPI: {acao.kpi}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {resultado.proximosPassos?.map((passo, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white/50 dark:bg-gray-950/20 border border-gray-100 dark:border-white/5">
                <div className="text-[10px] font-black text-indigo-500 mb-2 uppercase">Etapa {i + 1}</div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-bold leading-relaxed">{passo}</p>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Ações Mobile/Desktop (no-print) */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8 pb-8 no-print">
        <Button
          onClick={abrirPreviewImpressao}
          size="lg"
          className="h-14 px-10 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:scale-[1.02] transition-all font-black text-base shadow-lg flex items-center gap-3 active:scale-95"
        >
          <Printer className="h-5 w-5" />
          Visualizar para Impressão
        </Button>

        <Button
          onClick={handlePrint}
          size="lg"
          variant="outline"
          className="h-14 px-10 rounded-2xl border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all font-black text-base active:scale-95"
        >
          <Printer className="h-5 w-5 mr-2" />
          Imprimir / Salvar PDF
        </Button>

        <Button
          onClick={onNovaAnalise}
          size="lg"
          variant="outline"
          className="h-14 px-10 rounded-2xl border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all font-black text-base active:scale-95"
        >
          <RotateCcw className="h-5 w-5 mr-2" />
          Novo Diagnóstico
        </Button>
      </div>
        </motion.div>
      )}
    </>
  )
}
