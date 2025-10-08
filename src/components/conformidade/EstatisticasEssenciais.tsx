'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { InteractiveCard } from '@/components/ui/interactive-card'
import { FileText, CheckCircle, Clock, Zap } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface EstatisticasEssenciaisProps {
  conformidade: {
    total_analises: number
    score_medio: number
  }
  processamento: {
    jobs_completos: number
    jobs_processando: number
    jobs_pendentes: number
    jobs_falharam: number
    taxa_sucesso_percentual: number
    tempo_medio_formatado: string
  }
  documentos: {
    total: number
  }
  empresaId: string
}

export function EstatisticasEssenciais({ 
  conformidade, 
  processamento, 
  documentos, 
  empresaId 
}: EstatisticasEssenciaisProps) {
  const router = useRouter()
  
  // Filtrar apenas estatísticas relevantes (não zero)
  const estatisticas = [
    {
      key: 'analises',
      label: 'Análises',
      value: conformidade.total_analises,
      description: `${processamento.jobs_completos} completas`,
      icon: <CheckCircle className="h-6 w-6" />,
      color: 'green' as const,
      onClick: () => router.push(`/empresas/${empresaId}/analises`)
    },
    {
      key: 'documentos',
      label: 'Documentos',
      value: documentos.total,
      description: 'Avaliados e processados',
      icon: <FileText className="h-6 w-6" />,
      color: 'blue' as const,
      onClick: () => router.push(`/empresas/${empresaId}/documentos`)
    }
  ]

  // Adicionar estatísticas de processamento apenas se relevantes
  if (processamento.jobs_processando > 0) {
    estatisticas.push({
      key: 'processando',
      label: 'Processando',
      value: processamento.jobs_processando,
      description: 'Análises em execução',
      icon: <Zap className="h-6 w-6" />,
      color: 'yellow' as const,
      onClick: () => router.push(`/empresas/${empresaId}/analises?status=running`)
    })
  }

  if (processamento.jobs_pendentes > 0) {
    estatisticas.push({
      key: 'pendentes',
      label: 'Pendentes',
      value: processamento.jobs_pendentes,
      description: 'Aguardando processamento',
      icon: <Clock className="h-6 w-6" />,
      color: 'gray' as const,
      onClick: () => router.push(`/empresas/${empresaId}/analises?status=pending`)
    })
  }

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader className="pb-6">
        <CardTitle className="flex items-center space-x-3 text-xl">
          <div className="p-2 bg-blue-100 rounded-lg">
            <CheckCircle className="h-6 w-6 text-blue-600" />
          </div>
          <span className="text-gray-900">Estatísticas Essenciais</span>
        </CardTitle>
        <p className="text-gray-600 mt-2">
          Métricas de processamento e análise de conformidade
        </p>
      </CardHeader>
      <CardContent>
        <div className={`grid gap-4 lg:gap-6 ${estatisticas.length === 1 ? 'grid-cols-1 max-w-sm mx-auto' : estatisticas.length === 2 ? 'grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto' : estatisticas.length === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'}`}>
          {estatisticas.map((stat) => (
            <InteractiveCard
              key={stat.key}
              value={stat.value}
              label={stat.label}
              description={stat.description}
              icon={stat.icon}
              color={stat.color}
              onClick={stat.onClick}
            />
          ))}
        </div>
        
        {/* Informações adicionais em texto pequeno */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start space-x-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="text-sm font-medium text-gray-900">Taxa de Sucesso</div>
              </div>
              <div className="text-3xl font-bold text-green-600">{processamento.taxa_sucesso_percentual}%</div>
            </div>
            <div className="text-center sm:text-right">
              <div className="flex items-center justify-center sm:justify-end space-x-2 mb-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="text-sm font-medium text-gray-900">Tempo Médio</div>
              </div>
              <div className="text-3xl font-bold text-blue-600">{processamento.tempo_medio_formatado}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
