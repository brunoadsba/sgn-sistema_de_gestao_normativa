'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  CheckCircle, AlertTriangle, Shield,
  Clock, ArrowRight, RotateCcw,
} from 'lucide-react'
import { AnaliseConformidadeResponse } from '@/types/ia'

interface ResultadoAnaliseProps {
  resultado: AnaliseConformidadeResponse
  onNovaAnalise: () => void
}

const CORES_RISCO: Record<string, { bg: string; text: string }> = {
  baixo: { bg: 'bg-green-100', text: 'text-green-800' },
  medio: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  alto: { bg: 'bg-orange-100', text: 'text-orange-800' },
  critico: { bg: 'bg-red-100', text: 'text-red-800' },
}

const CORES_SEVERIDADE: Record<string, string> = {
  baixa: 'bg-green-100 text-green-800',
  media: 'bg-yellow-100 text-yellow-800',
  alta: 'bg-orange-100 text-orange-800',
  critica: 'bg-red-100 text-red-800',
}

function ScoreIndicador({ score }: { score: number }) {
  const cor = score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : score >= 40 ? 'text-orange-600' : 'text-red-600'
  const bgCor = score >= 80 ? 'bg-green-50 border-green-200' : score >= 60 ? 'bg-yellow-50 border-yellow-200' : score >= 40 ? 'bg-orange-50 border-orange-200' : 'bg-red-50 border-red-200'

  return (
    <div className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 ${bgCor} min-w-[140px]`}>
      <span className={`text-5xl font-bold ${cor}`}>{score}</span>
      <span className="text-sm text-gray-500 mt-1">de 100</span>
    </div>
  )
}

export function ResultadoAnalise({ resultado, onNovaAnalise }: ResultadoAnaliseProps) {
  const riscoCores = CORES_RISCO[resultado.nivelRisco] || CORES_RISCO.medio

  return (
    <div className="space-y-6 animate-fadeInUp">
      {/* Score + Resumo */}
      <div className="flex flex-col sm:flex-row gap-4">
        <ScoreIndicador score={resultado.score} />

        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={`${riscoCores.bg} ${riscoCores.text} border-0 px-3 py-1`}>
              <Shield className="h-3.5 w-3.5 mr-1" />
              Risco {resultado.nivelRisco}
            </Badge>
            <Badge variant="outline" className="px-3 py-1">
              {resultado.gaps.length} gap{resultado.gaps.length !== 1 ? 's' : ''}
            </Badge>
            {resultado.tempoProcessamento > 0 && (
              <Badge variant="outline" className="px-3 py-1">
                <Clock className="h-3 w-3 mr-1" />
                {(resultado.tempoProcessamento / 1000).toFixed(1)}s
              </Badge>
            )}
          </div>
          <p className="text-gray-700 leading-relaxed">{resultado.resumo}</p>
        </div>
      </div>

      {/* Pontos Positivos */}
      {resultado.pontosPositivos?.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Pontos Positivos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5">
              {resultado.pontosPositivos.map((ponto, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-green-500 mt-0.5 font-bold">+</span>
                  {ponto}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Gaps */}
      {resultado.gaps.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Gaps de Conformidade ({resultado.gaps.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {resultado.gaps.map((gap, i) => (
                <div key={gap.id || i} className="p-3 border rounded-lg">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h4 className="font-medium text-gray-900 text-sm">{gap.descricao}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${CORES_SEVERIDADE[gap.severidade] || ''}`}>
                      {gap.severidade}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{gap.recomendacao}</p>
                  <div className="flex gap-3 text-xs text-gray-500">
                    {gap.categoria && <span>Categoria: {gap.categoria}</span>}
                    {gap.prazo && <span>Prazo: {gap.prazo}</span>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Próximos Passos */}
      {resultado.proximosPassos?.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <ArrowRight className="h-5 w-5 text-blue-600" />
              Próximos Passos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-1.5 list-decimal list-inside">
              {resultado.proximosPassos.map((passo, i) => (
                <li key={i} className="text-sm text-gray-700">{passo}</li>
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
