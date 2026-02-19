'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
    score >= 80 ? 'bg-green-50 border-green-200'
    : score >= 60 ? 'bg-yellow-50 border-yellow-200'
    : score >= 40 ? 'bg-orange-50 border-orange-200'
    : 'bg-red-50 border-red-200'

  const porcentagem = Math.min(100, Math.max(0, score))
  const circunferencia = 2 * Math.PI * 36
  const offset = circunferencia - (porcentagem / 100) * circunferencia
  const corTraco = score >= 80 ? '#16a34a' : score >= 60 ? '#ca8a04' : score >= 40 ? '#ea580c' : '#dc2626'

  return (
    <div className={`flex flex-col items-center justify-center p-5 rounded-2xl border-2 ${bgCor} min-w-[140px]`}>
      <div className="relative w-20 h-20">
        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="36" fill="none" stroke="#e5e7eb" strokeWidth="7" />
          <circle
            cx="40" cy="40" r="36"
            fill="none"
            stroke={corTraco}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={circunferencia}
            strokeDashoffset={offset}
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-2xl font-bold leading-none ${cor}`}>{score}</span>
          <span className="text-xs text-gray-400 leading-none mt-0.5">/ 100</span>
        </div>
      </div>
    </div>
  )
}

function GapItem({ gap, index }: { gap: GapConformidade; index: number }) {
  const config = CONFIG_SEVERIDADE[gap.severidade] || CONFIG_SEVERIDADE.media

  return (
    <div className={`p-3.5 border rounded-lg border-l-4 ${config.border} bg-white`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-start gap-2">
          <span className="text-xs font-bold text-gray-400 mt-0.5 w-5 shrink-0">#{index + 1}</span>
          <h4 className="font-medium text-gray-900 text-sm leading-snug">{gap.descricao}</h4>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 ${config.badge}`}>
          {gap.severidade}
        </span>
      </div>

      <p className="text-sm text-gray-600 leading-relaxed ml-7 mb-2">{gap.recomendacao}</p>

      <div className="flex flex-wrap gap-3 ml-7 text-xs text-gray-400">
        {gap.categoria && (
          <span className="inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
            {gap.categoria}
          </span>
        )}
        {gap.prazo && (
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Prazo: {gap.prazo}
          </span>
        )}
        {gap.normasRelacionadas && gap.normasRelacionadas.length > 0 && (
          <span className="inline-flex items-center gap-1">
            <Shield className="h-3 w-3" />
            {gap.normasRelacionadas.join(', ')}
          </span>
        )}
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
    <div className="space-y-5 animate-fadeInUp">
      {/* Score + Cabeçalho */}
      <div className="flex flex-col sm:flex-row gap-4 p-5 rounded-2xl border bg-gray-50">
        <ScoreIndicador score={resultado.score} />

        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold border ${riscoConfig.bg} ${riscoConfig.border} ${riscoConfig.text}`}>
              <Shield className="h-3.5 w-3.5" />
              {riscoConfig.label}
            </span>

            {resultado.tempoProcessamento > 0 && (
              <span className="inline-flex items-center gap-1 text-xs text-gray-400 border rounded-full px-2.5 py-1">
                <Clock className="h-3 w-3" />
                {(resultado.tempoProcessamento / 1000).toFixed(1)}s
              </span>
            )}
          </div>

          <p className="text-gray-700 leading-relaxed text-sm">{resultado.resumo}</p>

          {/* Contagem de gaps por severidade */}
          {resultado.gaps.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {gapsPorSeveridade.critica > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-800 font-medium">
                  {gapsPorSeveridade.critica} crítico{gapsPorSeveridade.critica !== 1 ? 's' : ''}
                </span>
              )}
              {gapsPorSeveridade.alta > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 font-medium">
                  {gapsPorSeveridade.alta} alto{gapsPorSeveridade.alta !== 1 ? 's' : ''}
                </span>
              )}
              {gapsPorSeveridade.media > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 font-medium">
                  {gapsPorSeveridade.media} médio{gapsPorSeveridade.media !== 1 ? 's' : ''}
                </span>
              )}
              {gapsPorSeveridade.baixa > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800 font-medium">
                  {gapsPorSeveridade.baixa} baixo{gapsPorSeveridade.baixa !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Pontos Positivos */}
      {resultado.pontosPositivos?.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
              Pontos Positivos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5">
              {resultado.pontosPositivos.map((ponto, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-green-500 mt-0.5 font-bold shrink-0">+</span>
                  {ponto}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Pontos de Atenção */}
      {resultado.pontosAtencao?.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-500 shrink-0" />
              Pontos de Atenção
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5">
              {resultado.pontosAtencao.map((ponto, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-yellow-500 mt-0.5 font-bold shrink-0">!</span>
                  {ponto}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Gaps — ordenados por severidade */}
      {gapsOrdenados.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500 shrink-0" />
              Gaps de Conformidade ({gapsOrdenados.length})
              <span className="text-xs font-normal text-gray-400 ml-1">— ordenados por severidade</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2.5">
              {gapsOrdenados.map((gap, i) => (
                <GapItem key={gap.id || i} gap={gap} index={i} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Próximos Passos */}
      {resultado.proximosPassos?.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-blue-600 shrink-0" />
              Próximos Passos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2">
              {resultado.proximosPassos.map((passo, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {passo}
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}

      {/* Ação */}
      <div className="flex justify-center pt-2">
        <Button onClick={onNovaAnalise} size="lg" variant="outline">
          <RotateCcw className="h-4 w-4 mr-2" />
          Nova Análise
        </Button>
      </div>
    </div>
  )
}
