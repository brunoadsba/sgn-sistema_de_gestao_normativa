'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, ArrowLeft, Building2, RefreshCw, TrendingUp, Users, FileText, AlertTriangle } from 'lucide-react'
import { Kpis } from '@/components/conformidade/Kpis'
import { AlertasList } from '@/components/conformidade/AlertasList'

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
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Voltar</span>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Dashboard de Conformidade
              </h1>
              <p className="text-gray-600 mt-1">
                {dashboardData.empresa?.nome || 'Carregando...'} • {dashboardData.empresa?.cnpj || '...'}
              </p>
            </div>
          </div>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>

        {/* Resumo Executivo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building2 className="h-5 w-5" />
              <span>Resumo Executivo</span>
            </CardTitle>
            <CardDescription>
              Visão geral da conformidade da empresa com as normas regulamentadoras
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-600">
                  {Math.round(dashboardData.conformidade.score_medio)}%
                </p>
                <p className="text-sm text-gray-600">Índice de Conformidade</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <FileText className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600">
                  {dashboardData.documentos.total}
                </p>
                <p className="text-sm text-gray-600">Documentos Avaliados</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <AlertTriangle className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-orange-600">
                  {dashboardData.gaps.total}
                </p>
                <p className="text-sm text-gray-600">Oportunidades de Melhoria</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPIs */}
        <Kpis data={{
          totalAnalises: dashboardData.conformidade.total_analises,
          analisesProcessando: dashboardData.processamento.jobs_processando,
          analisesCompletas: dashboardData.processamento.jobs_completos,
          analisesFalharam: dashboardData.processamento.jobs_falharam,
          analisesPendentes: dashboardData.processamento.jobs_pendentes,
          totalLacunas: dashboardData.gaps.total,
          documentos: dashboardData.documentos.total,
          pontuacaoConformidade: dashboardData.conformidade.score_medio,
          ultimaAtualizacao: dashboardData.ultima_atualizacao
        }} />

        {/* Alertas de Conformidade */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5" />
              <span>Alertas de Conformidade</span>
            </CardTitle>
            <CardDescription>
              Notificações importantes sobre conformidade e prazos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AlertasList empresaId={empresaId} />
          </CardContent>
        </Card>

        {/* Resumo de Gaps */}
        <Card>
          <CardHeader>
            <CardTitle>Resumo de Oportunidades de Melhoria</CardTitle>
            <CardDescription>
              Distribuição de gaps por severidade
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <p className="text-2xl font-bold text-red-600">{dashboardData.gaps.distribuicao_severidade.critica}</p>
                <p className="text-sm text-gray-600">Críticos</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <p className="text-2xl font-bold text-orange-600">{dashboardData.gaps.distribuicao_severidade.alta}</p>
                <p className="text-sm text-gray-600">Altos</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">{dashboardData.gaps.distribuicao_severidade.media}</p>
                <p className="text-sm text-gray-600">Médios</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{dashboardData.gaps.distribuicao_severidade.baixa}</p>
                <p className="text-sm text-gray-600">Baixos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status de Processamento */}
        <Card>
          <CardHeader>
            <CardTitle>Status de Processamento</CardTitle>
            <CardDescription>
              Estatísticas de jobs e análises
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{dashboardData.processamento.jobs_completos}</p>
                <p className="text-sm text-gray-600">Completos</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">{dashboardData.processamento.jobs_processando}</p>
                <p className="text-sm text-gray-600">Processando</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-600">{dashboardData.processamento.jobs_pendentes}</p>
                <p className="text-sm text-gray-600">Pendentes</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <p className="text-2xl font-bold text-red-600">{dashboardData.processamento.jobs_falharam}</p>
                <p className="text-sm text-gray-600">Falharam</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}