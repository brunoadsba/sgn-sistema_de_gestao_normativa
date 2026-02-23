'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  CheckCircle, AlertTriangle, Shield,
  ArrowRight, RotateCcw,
  Printer
} from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { AnaliseConformidadeResponse, GapConformidade } from '@/types/ia'
import { motion } from 'framer-motion'
import { MessageSquare } from 'lucide-react'

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
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${config.badge}`}>
              {gap.severidade}
            </span>
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-2 py-0.5 border border-gray-100 dark:border-gray-800 rounded-lg">
              {gap.categoria}
            </span>
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  const handlePrint = () => window.print()

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-12 pb-20 print:space-y-4 print:pb-0"
    >
      {/* CABEÇALHO DO RELATÓRIO (PRINT) */}
      <div className="hidden print:block border-b-4 border-gray-900 pb-6 mb-12">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tighter">Relatório Técnico de Conformidade SST</h1>
            <p className="text-sm text-gray-400 font-bold italic mt-2">Relatório gerado via SGN Artificial Intelligence v4.0 Premium</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">ID Auditoria</p>
            <p className="text-xl font-mono font-bold leading-none">{resultado.jobId?.slice(0, 16).toUpperCase() || '---'}</p>
          </div>
        </div>
      </div>

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
                  <Button variant="outline" size="sm" onClick={handlePrint} className="rounded-xl font-bold text-[10px] uppercase h-9">
                    <Printer className="w-3.5 h-3.5 mr-2" /> Exportar
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
            "{resultado.resumo}"
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

      {/* PRÓXIMOS PASSOS */}
      <motion.div variants={itemVariants} className="space-y-6">
        <div className="flex items-center gap-3">
          <ArrowRight className="w-6 h-6 text-indigo-500" />
          <span className="text-lg font-black uppercase tracking-tighter">Plano de Ação Remediadora</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {resultado.proximosPassos?.map((passo, i) => (
            <div key={i} className="p-6 rounded-2xl bg-white/50 dark:bg-gray-950/20 border border-gray-100 dark:border-white/5">
              <div className="text-[10px] font-black text-indigo-500 mb-2 uppercase">Etapa {i + 1}</div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-bold leading-relaxed">{passo}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* FOOTER DO RELATÓRIO (PRINT) */}
      <div className="hidden print:block border-t-2 border-gray-100 pt-12 mt-24 avoid-break">
        <div className="grid grid-cols-2 gap-20">
          <div className="text-center space-y-4">
            <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.3em]">Responsável Auditor SGN</p>
            <div className="h-px bg-gray-900 w-full mt-20" />
            <p className="text-sm font-black text-gray-900">Assinatura Certificada via IA</p>
          </div>
          <div className="text-center space-y-4">
            <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.3em]">Validação Direção / SESMT</p>
            <div className="h-px bg-gray-900 w-full mt-20" />
            <p className="text-sm font-black text-gray-900">Protocolo de Recebimento</p>
          </div>
        </div>
        <div className="mt-24 text-center space-y-2">
          <p className="text-[8px] text-gray-400 uppercase tracking-[0.5em] opacity-50">SGN Premium Audit System v4.0 • Zero Trust Security • Blockchain Verified</p>
          <p className="text-[10px] text-gray-300 italic">ID Autenticidade: {resultado.jobId || '---'}</p>
        </div>
      </div>

      {/* Ações Mobile/Desktop (no-print) */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8 pb-8 no-print">
        <Button
          onClick={handlePrint}
          size="lg"
          className="h-14 px-10 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:scale-[1.02] transition-all font-black text-base shadow-lg flex items-center gap-3 active:scale-95"
        >
          <Printer className="h-5 w-5" />
          Gerar Relatório
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
  )
}
