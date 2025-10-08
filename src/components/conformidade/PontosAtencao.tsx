'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { InteractiveCard } from '@/components/ui/interactive-card'
import { AlertOctagon, AlertTriangle, AlertCircle, Info, CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface PontosAtencaoProps {
  gaps: {
    total: number
    pendentes: number
    distribuicao_severidade: {
      critica: number
      alta: number
      media: number
      baixa: number
    }
  }
  empresaId: string
}

export function PontosAtencao({ gaps, empresaId }: PontosAtencaoProps) {
  const router = useRouter()
  
  // Filtrar apenas severidades com itens
  const severidadesComItens = [
    { 
      key: 'critica', 
      label: 'Críticos', 
      value: gaps.distribuicao_severidade.critica,
      color: 'red' as const,
      icon: <AlertOctagon className="h-6 w-6" />,
      description: 'Requer ação imediata'
    },
    { 
      key: 'alta', 
      label: 'Altos', 
      value: gaps.distribuicao_severidade.alta,
      color: 'orange' as const,
      icon: <AlertTriangle className="h-6 w-6" />,
      description: 'Resolva no prazo de 30 dias'
    },
    { 
      key: 'media', 
      label: 'Médios', 
      value: gaps.distribuicao_severidade.media,
      color: 'yellow' as const,
      icon: <AlertCircle className="h-6 w-6" />,
      description: 'Resolva no prazo de 90 dias'
    },
    { 
      key: 'baixa', 
      label: 'Baixos', 
      value: gaps.distribuicao_severidade.baixa,
      color: 'blue' as const,
      icon: <Info className="h-6 w-6" />,
      description: 'Resolva no prazo de 180 dias'
    }
  ].filter(severidade => severidade.value > 0)

  // Se não há pontos de atenção, mostrar mensagem positiva
  if (severidadesComItens.length === 0) {
    return (
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-3 text-xl">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <span className="text-gray-900">Pontos de Atenção</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Nenhum ponto de atenção
            </h3>
            <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
              Todos os pontos de conformidade estão em dia e dentro dos padrões estabelecidos.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader className="pb-6">
        <CardTitle className="flex items-center space-x-3 text-xl">
          <div className="p-2 bg-orange-100 rounded-lg">
            <AlertTriangle className="h-6 w-6 text-orange-600" />
          </div>
          <span className="text-gray-900">Pontos de Atenção</span>
        </CardTitle>
        <p className="text-gray-600 mt-2">
          Distribuição por severidade dos pontos que requerem atenção
        </p>
      </CardHeader>
      <CardContent>
        <div className={`grid gap-4 lg:gap-6 ${severidadesComItens.length === 1 ? 'grid-cols-1 max-w-sm mx-auto' : severidadesComItens.length === 2 ? 'grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto' : severidadesComItens.length === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'}`}>
          {severidadesComItens.map((severidade) => (
            <InteractiveCard
              key={severidade.key}
              value={severidade.value}
              label={severidade.label}
              description={severidade.description}
              icon={severidade.icon}
              color={severidade.color}
              onClick={() => router.push(`/empresas/${empresaId}/gaps?severidade=${severidade.key}`)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
