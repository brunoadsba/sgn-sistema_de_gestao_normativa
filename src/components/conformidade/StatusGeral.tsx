'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react'

interface StatusGeralProps {
  score: number
  totalGaps: number
  gapsPendentes: number
  meta?: number
}

export function StatusGeral({ score, totalGaps, gapsPendentes, meta = 90 }: StatusGeralProps) {
  const getStatus = () => {
    if (score >= meta && gapsPendentes === 0) {
      return { 
        label: 'Conforme', 
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: <CheckCircle className="h-4 w-4" />,
        bgColor: 'bg-green-50'
      }
    } else if (score >= meta * 0.8 && gapsPendentes <= 2) {
      return { 
        label: 'Atenção', 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: <AlertTriangle className="h-4 w-4" />,
        bgColor: 'bg-yellow-50'
      }
    } else {
      return { 
        label: 'Crítico', 
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: <AlertTriangle className="h-4 w-4" />,
        bgColor: 'bg-red-50'
      }
    }
  }

  const status = getStatus()

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Índice de Conformidade */}
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <div className="text-4xl font-bold text-gray-900">{score}%</div>
              <div className="text-sm text-gray-500">Meta: {meta}%</div>
              <h3 className="text-lg font-semibold text-gray-900 mt-1">Índice de Conformidade</h3>
            </div>
          </div>

          {/* Pontos Pendentes */}
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-orange-100 rounded-xl">
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
            <div>
              <div className="text-4xl font-bold text-gray-900">{gapsPendentes}</div>
              <div className="text-sm text-gray-500">de {totalGaps} total</div>
              <h3 className="text-lg font-semibold text-gray-900 mt-1">Pontos Pendentes</h3>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center space-x-4">
            <Badge className={`${status.color} border px-4 py-2 text-sm font-medium`}>
              {status.icon}
              <span className="ml-2">{status.label}</span>
            </Badge>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Status Geral</h3>
              <p className="text-sm text-gray-600 max-w-xs">
                {status.label === 'Conforme' && 'Todas as conformidades estão em dia.'}
                {status.label === 'Atenção' && 'Alguns pontos requerem atenção.'}
                {status.label === 'Crítico' && 'Ação imediata necessária.'}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
