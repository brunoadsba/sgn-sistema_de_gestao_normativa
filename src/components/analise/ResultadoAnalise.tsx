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
  baixo:  { bg: 'bg-green-50',  border: 'border-green-200', text: 'text-green-800',  label: 'Risco Baixo' },
  medio:  { bg: 'bg-yellow-50', border: 'border-yellow-200',text: 'text-yellow-800', label: 'Risco Médio' },
  alto:   { bg: 'bg-orange-50', border: 'border-orange-200',text: 'text-orange-800', label: 'Risco Alto' },
  critico:{ bg: 'bg-red-50',    border: 'border-red-200',   text: 'text-red-800',    label: 'Risco Crítico' },
} as const

const CONFIG_SEVERIDADE: Record<string, { badge: string; border: string; icon: string }> = {
  baixa:  { badge: 'bg-green-100 text-green-800',  border: 'border-l-green-400',  icon: 'text-green-500' },
  media:  { badge: 'bg-yellow-100 text-yellow-800',border: 'border-l-yellow-400', icon: 'text-yellow-500' },
  alta:   { badge: 'bg-orange-100 text-orange-800',border: 'border-l-orange-400', icon: 'text-orange-500' },
  critica:{ badge: 'bg-red-100 text-red-800',      border: 'border-l-red-500',    icon: 'text-red-500' },
}

function ScoreIndicador({ score }: { score: number }) {
  const cor =
    score >= 80 ? 'text-green-600'
    : score >= 60 ? 'text-yellow-600'
    : score >= 40 ? 'text-orange-600'
    : 'text-red-600'

  const bgCor =
    score >= 80 ? 'bg-gradient-to-br from-green-50 to-green-100/50 border-green-200 shadow-green-100/50'
    : score >= 60 ? 'bg-gradient-to-br from-yellow-50 to-yellow-100/50 border-yellow-200 shadow-yellow-100/50'
    : score >= 40 ? 'bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-200 shadow-orange-100/50'
    : 'bg-gradient-to-br from-red-50 to-red-100/50 border-red-200 shadow-red-100/50'

  const porcentagem = Math.min(100, Math.max(0, score))
  const circunferencia = 2 * Math.PI * 40
  const offset = circunferencia - (porcentagem / 100) * circunferencia
  const corTraco = score >= 80 ? '#16a34a' : score >= 60 ? '#ca8a04' : score >= 40 ? '#ea580c' : '#dc2626'

  return (
    <div className={`flex flex-col items-center justify-center p-6 rounded-3xl border-2 ${bgCor} min-w-[160px] shadow-lg relative overflow-hidden group`}>
      <div className="absolute inset-0 bg-white/40 group-hover:bg-white/20 transition-colors duration-500"></div>
      <div className="relative w-28 h-28">
        <svg className="w-28 h-28 -rotate-90 drop-shadow-sm" viewBox="0 0 100 100">
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
          <span className={`text-4xl font-black tracking-tighter leading-none ${cor} drop-shadow-sm`}>{score}</span>
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
        <div className="w-px h-full bg-gray-200 mt-2 group-last:hidden"></div>
      </div>
      <div className={`flex-1 pb-6`}>
        <div className="flex items-start justify-between gap-4 mb-3">
          <h4 className="font-semibold text-gray-900 text-base leading-snug">{gap.descricao}</h4>
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap shrink-0 shadow-sm border ${config.badge} ${config.border.replace('border-l-', 'border-')}`}>
            {gap.severidade}
          </span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm mb-3">
          <div className="flex items-start gap-2">
            <Shield className={`h-4 w-4 shrink-0 mt-0.5 ${config.icon}`} />
            <p className="text-sm text-gray-700 leading-relaxed font-medium">{gap.recomendacao}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 text-xs font-medium text-gray-500">
          {gap.categoria && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
              {gap.categoria}
            </span>
          )}
          {gap.prazo && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-lg text-gray-600">
              <Clock className="h-3.5 w-3.5" />
              Prazo: {gap.prazo}
            </span>
          )}
          {gap.normasRelacionadas && gap.normasRelacionadas.length > 0 && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100">
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
      <div className="flex flex-col md:flex-row gap-6 p-8 rounded-3xl border bg-white/70 backdrop-blur-xl shadow-xl shadow-blue-900/5 hover:shadow-blue-900/10 transition-shadow duration-300">
        <ScoreIndicador score={resultado.score} />

        <div className="flex-1 space-y-4 flex flex-col justify-center">
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold border-2 ${riscoConfig.bg} ${riscoConfig.border} ${riscoConfig.text} shadow-sm`}>
              <Shield className="h-4 w-4" />
              {riscoConfig.label}
            </span>

            {resultado.tempoProcessamento > 0 && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 border-2 border-gray-100 bg-gray-50/50 rounded-full px-3 py-1.5">
                <Clock className="h-3.5 w-3.5" />
                {(resultado.tempoProcessamento / 1000).toFixed(1)}s de processamento
              </span>
            )}
          </div>

          <p className="text-gray-700 leading-relaxed text-base font-medium">{resultado.resumo}</p>

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pontos Positivos */}
        {resultado.pontosPositivos?.length > 0 && (
          <Card className="border-green-100 bg-gradient-to-br from-white to-green-50/30 shadow-md shadow-green-100/20">
            <CardHeader className="pb-3 border-b border-green-100/50">
              <CardTitle className="text-base font-bold flex items-center gap-2 text-green-800">
                <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
                Pontos Positivos Identificados
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="space-y-3">
                {resultado.pontosPositivos.map((ponto, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-green-100 text-green-600 text-sm font-bold shrink-0 mt-0.5">
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
          <Card className="border-yellow-100 bg-gradient-to-br from-white to-yellow-50/30 shadow-md shadow-yellow-100/20">
            <CardHeader className="pb-3 border-b border-yellow-100/50">
              <CardTitle className="text-base font-bold flex items-center gap-2 text-yellow-800">
                <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0" />
                Pontos de Atenção Observados
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="space-y-3">
                {resultado.pontosAtencao.map((ponto, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-yellow-100 text-yellow-600 text-sm font-bold shrink-0 mt-0.5">
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
        <Card className="border-red-100 shadow-lg shadow-red-100/20 overflow-hidden">
          <CardHeader className="pb-4 bg-gradient-to-r from-red-50 to-white border-b border-red-100/50">
            <CardTitle className="text-lg font-bold flex items-center gap-3 text-red-900">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
              </div>
              Detalhes das Inconformidades
              <span className="text-sm font-medium px-3 py-1 bg-white border border-red-200 text-red-600 rounded-full shadow-sm ml-auto">
                {gapsOrdenados.length} gaps encontrados
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 bg-gray-50/50">
            <div className="divide-y divide-gray-100">
              {gapsOrdenados.map((gap, i) => (
                <div key={gap.id || i} className="p-6 transition-colors hover:bg-white">
                  <GapItem gap={gap} index={i} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Próximos Passos */}
      {resultado.proximosPassos?.length > 0 && (
        <Card className="border-indigo-100 shadow-lg shadow-indigo-100/20 bg-gradient-to-br from-indigo-50/50 to-white">
          <CardHeader className="pb-4 border-b border-indigo-100/50">
            <CardTitle className="text-lg font-bold flex items-center gap-3 text-indigo-900">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <ArrowRight className="h-5 w-5 text-indigo-600 shrink-0" />
              </div>
              Plano de Ação Recomendado
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-2">
              {resultado.proximosPassos.map((passo, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-white border border-indigo-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 text-white font-bold shrink-0 shadow-inner">
                    {i + 1}
                  </span>
                  <p className="text-gray-700 font-medium leading-relaxed mt-0.5">
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
          className="h-14 px-8 rounded-2xl border-2 border-gray-200 text-gray-700 hover:text-indigo-700 hover:border-indigo-300 hover:bg-indigo-50 font-bold text-base transition-all hover:-translate-y-1 shadow-sm hover:shadow-md"
        >
          <RotateCcw className="h-5 w-5 mr-3" />
          Realizar Nova Análise
        </Button>
      </div>
    </div>
  )
}
