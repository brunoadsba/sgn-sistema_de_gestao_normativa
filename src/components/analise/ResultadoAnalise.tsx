'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  CheckCircle, AlertTriangle, Shield,
  Clock, ArrowRight, RotateCcw, AlertCircle,
} from 'lucide-react'
import { AnaliseConformidadeResponse, GapConformidade } from '@/types/ia'

interface ResultadoAnaliseProps {
  resultado: AnaliseConformidadeResponse
  onNovaAnalise: () => void
}

const ORDEM_SEVERIDADE: Record<string, number> = {
  critica: 0,
  alta: 1,
  media: 2,
  baixa: 3,
}

const CONFIG_RISCO = {
  baixo:  { bg: 'bg-green-50 dark:bg-green-950/40',  border: 'border-green-200 dark:border-green-800/60', text: 'text-green-800 dark:text-green-400',  label: 'Risco Baixo' },
  medio:  { bg: 'bg-yellow-50 dark:bg-yellow-950/40', border: 'border-yellow-200 dark:border-yellow-800/60', text: 'text-yellow-800 dark:text-yellow-400', label: 'Risco Médio' },
  alto:   { bg: 'bg-orange-50 dark:bg-orange-950/40', border: 'border-orange-200 dark:border-orange-800/60', text: 'text-orange-800 dark:text-orange-400', label: 'Risco Alto' },
  critico:{ bg: 'bg-red-50 dark:bg-red-950/40',    border: 'border-red-200 dark:border-red-800/60',   text: 'text-red-800 dark:text-red-400',    label: 'Risco Crítico' },
} as const

const CONFIG_SEVERIDADE: Record<string, { badge: string; border: string; icon: string }> = {
  baixa:  { badge: 'bg-green-100 dark:bg-green-950/60 text-green-800 dark:text-green-400',  border: 'border-l-green-400 dark:border-l-green-700',  icon: 'text-green-500 dark:text-green-400' },
  media:  { badge: 'bg-yellow-100 dark:bg-yellow-950/60 text-yellow-800 dark:text-yellow-400', border: 'border-l-yellow-400 dark:border-l-yellow-700', icon: 'text-yellow-500 dark:text-yellow-400' },
  alta:   { badge: 'bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-400', border: 'border-l-orange-400 dark:border-l-orange-700', icon: 'text-orange-500 dark:text-orange-400' },
  critica:{ badge: 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-400',      border: 'border-l-red-500 dark:border-l-red-700',    icon: 'text-red-500 dark:text-red-400' },
}

function ScoreIndicador({ score }: { score: number }) {
  const cor =
    score >= 80 ? 'text-green-600'
    : score >= 60 ? 'text-yellow-600'
    : score >= 40 ? 'text-orange-600'
    : 'text-red-600'

  const bgCor =
    score >= 80 ? 'bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/60 dark:to-green-900/30 border-green-200 dark:border-green-800/50 shadow-green-100/50'
    : score >= 60 ? 'bg-gradient-to-br from-yellow-50 to-yellow-100/50 dark:from-yellow-950/60 dark:to-yellow-900/30 border-yellow-200 dark:border-yellow-800/50 shadow-yellow-100/50'
    : score >= 40 ? 'bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/60 dark:to-orange-900/30 border-orange-200 dark:border-orange-800/50 shadow-orange-100/50'
    : 'bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/60 dark:to-red-900/30 border-red-200 dark:border-red-800/50 shadow-red-100/50'

  const porcentagem = Math.min(100, Math.max(0, score))
  const circunferencia = 2 * Math.PI * 40
  const offset = circunferencia - (porcentagem / 100) * circunferencia
  const corTraco = score >= 80 ? '#16a34a' : score >= 60 ? '#ca8a04' : score >= 40 ? '#ea580c' : '#dc2626'

  return (
    <div className={`flex flex-col items-center justify-center p-4 sm:p-6 rounded-3xl border-2 ${bgCor} min-w-[132px] sm:min-w-[160px] shadow-lg relative overflow-hidden group`}>
      <div className="absolute inset-0 bg-white/40 group-hover:bg-white/20 transition-colors duration-500"></div>
      <div className="relative w-24 h-24 sm:w-28 sm:h-28">
        <svg className="w-24 h-24 sm:w-28 sm:h-28 -rotate-90 drop-shadow-sm" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="8" />
          <circle
            cx="50" cy="50" r="40"
            fill="none"
            stroke={corTraco}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circunferencia}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
            style={{ filter: `drop-shadow(0 0 4px ${corTraco}40)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center animate-in zoom-in duration-500 delay-300">
          <span className={`text-3xl sm:text-4xl font-black tracking-tighter leading-none ${cor} drop-shadow-sm`}>{score}</span>
          <span className="text-xs font-bold text-gray-500/80 uppercase tracking-widest mt-1">Score</span>
        </div>
      </div>
    </div>
  )
}

function GapItem({ gap, index }: { gap: GapConformidade; index: number }) {
  const config = CONFIG_SEVERIDADE[gap.severidade] || CONFIG_SEVERIDADE.media

  return (
        <div className="flex gap-4 group">
      <div className="flex flex-col items-center mt-1">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-sm border ${config.badge} ${config.border.replace('border-l-', 'border-')}`}>
          {index + 1}
        </div>
        <div className="w-px h-full bg-gray-200 dark:bg-gray-700 mt-2 group-last:hidden"></div>
      </div>
      <div className={`flex-1 pb-6`}>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4 mb-3">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-base leading-snug">{gap.descricao}</h4>
          <span className={`self-start px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap shrink-0 shadow-sm border ${config.badge} ${config.border.replace('border-l-', 'border-')}`}>
            {gap.severidade}
          </span>
        </div>

        <div className="bg-white dark:bg-gray-800/60 rounded-xl p-4 border border-gray-100 dark:border-gray-700/50 shadow-sm mb-3">
          <div className="flex items-start gap-2">
            <Shield className={`h-4 w-4 shrink-0 mt-0.5 ${config.icon}`} />
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium">{gap.recomendacao}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 text-xs font-medium text-gray-500 dark:text-gray-400">
          {gap.categoria && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-600" />
              {gap.categoria}
            </span>
          )}
          {gap.prazo && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-400">
              <Clock className="h-3.5 w-3.5" />
              Prazo: {gap.prazo}
            </span>
          )}
          {gap.normasRelacionadas && gap.normasRelacionadas.length > 0 && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 rounded-lg border border-indigo-100 dark:border-indigo-900/50">
              <Shield className="h-3.5 w-3.5" />
              {gap.normasRelacionadas.join(', ')}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export function ResultadoAnalise({ resultado, onNovaAnalise }: ResultadoAnaliseProps) {
  const riscoConfig = CONFIG_RISCO[resultado.nivelRisco] || CONFIG_RISCO.medio

  const gapsOrdenados = useMemo(
    () => [...resultado.gaps].sort(
      (a, b) => (ORDEM_SEVERIDADE[a.severidade] ?? 4) - (ORDEM_SEVERIDADE[b.severidade] ?? 4)
    ),
    [resultado.gaps]
  )

  const gapsPorSeveridade = useMemo(() => ({
    critica: gapsOrdenados.filter(g => g.severidade === 'critica').length,
    alta:    gapsOrdenados.filter(g => g.severidade === 'alta').length,
    media:   gapsOrdenados.filter(g => g.severidade === 'media').length,
    baixa:   gapsOrdenados.filter(g => g.severidade === 'baixa').length,
  }), [gapsOrdenados])

  return (
    <div className="space-y-6">
      {/* Score + Cabeçalho */}
      <div className="flex flex-col md:flex-row gap-4 sm:gap-6 p-4 sm:p-8 rounded-3xl border border-white/10 dark:border-gray-700/50 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl shadow-xl shadow-blue-900/5 dark:shadow-black/30 hover:shadow-blue-900/10 transition-shadow duration-300">
        <ScoreIndicador score={resultado.score} />

        <div className="flex-1 space-y-4 flex flex-col justify-center">
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold border-2 ${riscoConfig.bg} ${riscoConfig.border} ${riscoConfig.text} shadow-sm`}>
              <Shield className="h-4 w-4" />
              {riscoConfig.label}
            </span>

            {resultado.tempoProcessamento > 0 && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 border-2 border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 rounded-full px-3 py-1.5">
                <Clock className="h-3.5 w-3.5" />
                {(resultado.tempoProcessamento / 1000).toFixed(1)}s de processamento
              </span>
            )}
          </div>

          <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base font-medium">{resultado.resumo}</p>

          {/* Contagem de gaps por severidade */}
          {resultado.gaps.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100/50">
              {gapsPorSeveridade.critica > 0 && (
                <span className="text-sm px-3 py-1 rounded-full bg-red-100 text-red-800 font-bold border border-red-200">
                  {gapsPorSeveridade.critica} crítico{gapsPorSeveridade.critica !== 1 ? 's' : ''}
                </span>
              )}
              {gapsPorSeveridade.alta > 0 && (
                <span className="text-sm px-3 py-1 rounded-full bg-orange-100 text-orange-800 font-bold border border-orange-200">
                  {gapsPorSeveridade.alta} alto{gapsPorSeveridade.alta !== 1 ? 's' : ''}
                </span>
              )}
              {gapsPorSeveridade.media > 0 && (
                <span className="text-sm px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 font-bold border border-yellow-200">
                  {gapsPorSeveridade.media} médio{gapsPorSeveridade.media !== 1 ? 's' : ''}
                </span>
              )}
              {gapsPorSeveridade.baixa > 0 && (
                <span className="text-sm px-3 py-1 rounded-full bg-green-100 text-green-800 font-bold border border-green-200">
                  {gapsPorSeveridade.baixa} baixo{gapsPorSeveridade.baixa !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Pontos Positivos */}
        {resultado.pontosPositivos?.length > 0 && (
          <Card className="border-green-100 dark:border-green-900/40 bg-gradient-to-br from-white to-green-50/30 dark:from-gray-900 dark:to-green-950/20 shadow-md shadow-green-100/20">
            <CardHeader className="pb-3 border-b border-green-100/50 dark:border-green-900/30">
              <CardTitle className="text-base font-bold flex items-center gap-2 text-green-800 dark:text-green-400">
                <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
                Pontos Positivos Identificados
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="space-y-3">
                {resultado.pontosPositivos.map((ponto, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/60 text-green-600 dark:text-green-400 text-sm font-bold shrink-0 mt-0.5">
                      ✓
                    </span>
                    <span className="leading-relaxed font-medium">{ponto}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Pontos de Atenção */}
        {resultado.pontosAtencao?.length > 0 && (
          <Card className="border-yellow-100 dark:border-yellow-900/40 bg-gradient-to-br from-white to-yellow-50/30 dark:from-gray-900 dark:to-yellow-950/20 shadow-md shadow-yellow-100/20">
            <CardHeader className="pb-3 border-b border-yellow-100/50 dark:border-yellow-900/30">
              <CardTitle className="text-base font-bold flex items-center gap-2 text-yellow-800 dark:text-yellow-400">
                <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0" />
                Pontos de Atenção Observados
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="space-y-3">
                {resultado.pontosAtencao.map((ponto, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-yellow-100 dark:bg-yellow-900/60 text-yellow-600 dark:text-yellow-400 text-sm font-bold shrink-0 mt-0.5">
                      !
                    </span>
                    <span className="leading-relaxed font-medium">{ponto}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Gaps — ordenados por severidade */}
      {gapsOrdenados.length > 0 && (
          <Card className="border-red-100 dark:border-red-900/40 shadow-lg shadow-red-100/20 overflow-hidden">
          <CardHeader className="pb-4 bg-gradient-to-r from-red-50 to-white dark:from-red-950/30 dark:to-gray-900/0 border-b border-red-100/50 dark:border-red-900/30">
            <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2 sm:gap-3 text-red-900 dark:text-red-300">
              <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0" />
              </div>
              Detalhes das Inconformidades
              <span className="text-xs sm:text-sm font-medium px-2 sm:px-3 py-1 bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-full shadow-sm ml-auto">
                {gapsOrdenados.length} gaps encontrados
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 bg-gray-50/50 dark:bg-gray-900/30">
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {gapsOrdenados.map((gap, i) => (
                <div key={gap.id || i} className="p-4 sm:p-6 transition-colors hover:bg-white dark:hover:bg-gray-800/30">
                  <GapItem gap={gap} index={i} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Próximos Passos */}
      {resultado.proximosPassos?.length > 0 && (
        <Card className="border-indigo-100 dark:border-indigo-900/40 shadow-lg shadow-indigo-100/20 bg-gradient-to-br from-indigo-50/50 to-white dark:from-indigo-950/20 dark:to-gray-900/0">
          <CardHeader className="pb-4 border-b border-indigo-100/50 dark:border-indigo-900/30">
            <CardTitle className="text-lg font-bold flex items-center gap-3 text-indigo-900 dark:text-indigo-300">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/60 rounded-lg">
                <ArrowRight className="h-5 w-5 text-indigo-600 shrink-0" />
              </div>
              Plano de Ação Recomendado
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-2">
              {resultado.proximosPassos.map((passo, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-gray-800/60 border border-indigo-100 dark:border-indigo-900/40 shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800 transition-all">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 text-white font-bold shrink-0 shadow-inner">
                    {i + 1}
                  </span>
                  <p className="text-gray-700 dark:text-gray-300 font-medium leading-relaxed mt-0.5">
                    {passo}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ação */}
      <div className="flex justify-center pt-8 pb-4">
        <Button 
          onClick={onNovaAnalise} 
          size="lg" 
          variant="outline"
          className="h-14 px-8 rounded-2xl border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:text-indigo-700 dark:hover:text-indigo-400 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 font-bold text-base transition-all hover:-translate-y-1 shadow-sm hover:shadow-md"
        >
          <RotateCcw className="h-5 w-5 mr-3" />
          Realizar Nova Análise
        </Button>
      </div>
    </div>
  )
}
