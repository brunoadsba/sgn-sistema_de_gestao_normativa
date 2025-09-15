'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, ArrowLeft, Building2, RefreshCw } from 'lucide-react'
import { AlertasList } from '@/components/conformidade/AlertasList'
import { StatusGeral } from '@/components/conformidade/StatusGeral'
import { PontosAtencao } from '@/components/conformidade/PontosAtencao'
import { EstatisticasEssenciais } from '@/components/conformidade/EstatisticasEssenciais'

interface DashboardData {
  empresa: {
    id: string
    nome: string
    cnpj: string
    setor?: string
    porte?: string
    ativo: boolean
  }
  resumo_executivo: {
    score_geral_medio: number
    total_analises: number
    total_gaps: number
    gaps_criticos_pendentes: number
    taxa_resolucao_gaps: number
    risco_predominante: string
  }
  processamento: {
    total_jobs: number
    jobs_pendentes: number
    jobs_processando: number
    jobs_completos: number
    jobs_falharam: number
    jobs_cancelados: number
    taxa_sucesso_percentual: number
    tempo_medio_processamento_segundos: number
    tempo_medio_formatado: string
  }
  conformidade: {
    total_analises: number
    score_medio: number
    distribuicao_status: {
      conforme: number
      nao_conforme: number
      parcial_conforme: number
    }
    distribuicao_risco: {
      baixo: number
      medio: number
      alto: number
      critico: number
    }
    tendencia_score: Array<{
      data: string
      score: number
      nivel_risco: string
    }>
  }
  gaps: {
    total: number
    resolvidos: number
    pendentes: number
    taxa_resolucao_percentual: number
    distribuicao_severidade: {
      critica: number
      alta: number
      media: number
      baixa: number
    }
    por_categoria: Record<string, number>
  }
  documentos: {
    total: number
    por_tipo: Record<string, number>
  }
}

export default function ConformidadePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: empresaId } = use(params)
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const fetchData = async (retryCount = 0) => {
      try {
        setLoading(true)
        setError(null)
        
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout
        
        const dashboardResponse = await fetch(`/api/conformidade/dashboard/${empresaId}?t=${Date.now()}`, {
          signal: controller.signal,
          cache: 'no-store' // Força busca sempre
        })
        
        clearTimeout(timeoutId)
        
        if (!dashboardResponse.ok) {
          throw new Error(`Erro ${dashboardResponse.status}: ${dashboardResponse.statusText}`)
        }
        
        const response = await dashboardResponse.json()
        if (response.success && response.data) {
          setDashboardData(response.data)
        } else {
          throw new Error(response.error || 'Erro ao carregar dados')
        }
        
      } catch (err) {
        console.error('Erro ao carregar dashboard:', err)
        if (retryCount < 2 && (err instanceof Error && err.name === 'AbortError' || err.message.includes('fetch'))) {
          console.log(`Tentativa ${retryCount + 1} de 3...`)
          setTimeout(() => fetchData(retryCount + 1), 1000 * (retryCount + 1)) // Backoff exponencial
          return
        }
        setError(err instanceof Error ? err.message : 'Erro ao carregar dados')
      } finally {
        setLoading(false)
      }
    }
    
    if (empresaId) {
      fetchData()
    }
  }, [empresaId, refreshKey])

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-blue-600" />
              <p className="text-gray-600">Carregando dashboard de conformidade...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
              <h2 className="text-xl font-semibold text-gray-900">Erro ao carregar dados</h2>
              <p className="text-gray-600 max-w-md">{error}</p>
              <Button onClick={handleRefresh} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Tentar Novamente
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto" />
              <h2 className="text-xl font-semibold text-gray-900">Nenhum dado encontrado</h2>
              <p className="text-gray-600">Não foi possível carregar os dados do dashboard.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 lg:p-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.back()}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Voltar</span>
                </Button>
                <div className="h-6 w-px bg-gray-300"></div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                    Dashboard de Conformidade
                  </h1>
                  <p className="text-gray-600 mt-1 text-sm lg:text-base">
                    {dashboardData.empresa?.nome || 'Carregando...'} • {dashboardData.empresa?.cnpj || '...'}
                  </p>
                </div>
              </div>
              <Button 
                onClick={handleRefresh} 
                variant="outline" 
                size="sm"
                className="self-start lg:self-center"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
            </div>
          </div>

          {/* Status Geral */}
          <StatusGeral 
            score={Math.round(dashboardData.conformidade.score_medio)}
            totalGaps={dashboardData.gaps.total}
            gapsPendentes={dashboardData.gaps.pendentes}
            meta={90}
          />

          {/* Pontos de Atenção */}
          <PontosAtencao 
            gaps={dashboardData.gaps}
            empresaId={empresaId}
          />

          {/* Estatísticas Essenciais */}
          <EstatisticasEssenciais 
            conformidade={dashboardData.conformidade}
            processamento={dashboardData.processamento}
            documentos={dashboardData.documentos}
            empresaId={empresaId}
          />

          {/* Alertas de Conformidade */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-3 text-xl">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <span className="text-gray-900">Alertas de Conformidade</span>
              </CardTitle>
              <CardDescription className="text-gray-600">
                Notificações importantes sobre conformidade e prazos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AlertasList empresaId={empresaId} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}