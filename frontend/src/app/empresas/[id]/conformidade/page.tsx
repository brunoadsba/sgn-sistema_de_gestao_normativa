'use client'
import { use, useEffect, useState } from 'react'
import { Kpis } from '@/components/conformidade/Kpis'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/loading/LoadingSpinner'
import { RefreshCw } from 'lucide-react'
// import { usePerformanceMonitoring } from '@/lib/performance' // Temporariamente desabilitado

// Importar tipos dos componentes existentes
import type { GapItem } from '@/components/conformidade/GapsTable'
import type { JobItem } from '@/components/conformidade/JobsList'

// Definir tipo local para KPIs baseado no componente
type DashboardKpis = {
  totalAnalises: number
  analisesProcessando: number
  analisesCompletas: number
  analisesFalharam: number
  analisesPendentes: number
  totalLacunas: number
  documentos: number
  pontuacaoConformidade: number
  ultimaAtualizacao?: string
}

interface DashboardData {
  kpis: DashboardKpis
  gaps: GapItem[]
  jobs: JobItem[]
}

export default function ConformidadePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: empresaId } = use(params)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  // usePerformanceMonitoring('/empresas/[id]/conformidade') // Temporariamente desabilitado

  useEffect(() => {
    const fetchData = async (retryCount = 0) => {
      try {
        setLoading(true)
        setError(null)
        
        // Buscar apenas dashboard com timeout e retry
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout
        
        const dashboardResponse = await fetch(`/api/conformidade/dashboard/${empresaId}?t=${Date.now()}`, {
          signal: controller.signal,
          cache: 'no-store' // Força busca sempre
        })
        
        clearTimeout(timeoutId)

        if (!dashboardResponse.ok) {
          throw new Error(`Erro ao carregar dashboard: ${dashboardResponse.status}`)
        }

        const dashboardResult = await dashboardResponse.json()
        
        if (dashboardResult.success) {
          const apiData = dashboardResult.data
          
          // Mapear dados da API para o formato esperado pelo componente
          const mappedData: DashboardData = {
            kpis: {
              totalAnalises: apiData.processamento?.total_jobs || 0,
              analisesProcessando: apiData.processamento?.jobs_processando || 0,
              analisesCompletas: apiData.processamento?.jobs_completos || 0,
              analisesFalharam: apiData.processamento?.jobs_falharam || 0,
              analisesPendentes: apiData.processamento?.jobs_pendentes || 0,
              totalLacunas: apiData.gaps?.total || 0,
              documentos: apiData.documentos?.total || 0,
              pontuacaoConformidade: apiData.resumo_executivo?.score_geral_medio || 0,
              ultimaAtualizacao: apiData.ultima_atualizacao
            },
            gaps: [], // TODO: Mapear lacunas quando necessário
            jobs: []  // TODO: Mapear análises quando necessário
          }
          
          setDashboardData(mappedData)
        } else {
          throw new Error(dashboardResult.error || 'Erro desconhecido')
        }
      } catch (err) {
        console.error('Erro ao carregar dashboard:', err)
        
        // Retry logic para falhas de rede
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
      <div className="container mx-auto py-8">
        <LoadingSpinner size="lg" label="Carregando dashboard de conformidade..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">Dashboard de Conformidade</h1>
              <p className="text-muted-foreground">Erro ao carregar dados</p>
            </div>
            <Button 
              onClick={handleRefresh} 
              variant="outline" 
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Tentar Novamente
            </Button>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-red-600 mb-4">Erro: {error}</p>
              <p className="text-muted-foreground text-sm">
                Verifique sua conexão e tente novamente. Se o problema persistir, 
                pode ser um problema temporário do servidor.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard de Conformidade</h1>
            {dashboardData && (
              <div className="flex items-center gap-4 text-muted-foreground">
                <span className="text-lg font-medium">Construtora BR</span>
                <span>•</span>
                <span>Construção Civil</span>
                <span>•</span>
                <span>CNPJ: 98.765.432/0001-10</span>
              </div>
            )}
          </div>
          <Button 
            onClick={handleRefresh} 
            variant="outline" 
            size="sm"
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>
      
      {dashboardData && dashboardData.kpis && (
        <>
          {/* Resumo Executivo */}
          <div className="grid gap-6 mb-8">
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-blue-900 mb-2">Resumo Executivo</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-blue-700">Índice de Conformidade</p>
                        <p className="text-2xl font-bold text-blue-900">{dashboardData.kpis.pontuacaoConformidade}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-blue-700">Total de Oportunidades de Melhoria</p>
                        <p className="text-2xl font-bold text-blue-900">{dashboardData.kpis.totalLacunas}</p>
                      </div>
                      <div>
                        <p className="text-sm text-blue-700">Documentos Avaliados</p>
                        <p className="text-2xl font-bold text-blue-900">{dashboardData.kpis.documentos}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl font-bold text-blue-600">{dashboardData.kpis.pontuacaoConformidade}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mb-8">
            <Kpis data={dashboardData.kpis} />
          </div>
          
          <Separator className="my-8" />
          
          <div className="grid gap-8">
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Oportunidades de Melhoria Identificadas</h2>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground">6 oportunidades de melhoria identificadas</p>
                  <p className="text-sm text-muted-foreground mt-2">1 Não Conforme, 5 Oportunidades de Melhoria</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Avaliações Recentes</h2>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground">4 avaliações executadas</p>
                  <p className="text-sm text-muted-foreground mt-2">2 concluídas, 1 pendente, 1 em andamento</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
      
      {!dashboardData && !loading && !error && (
        <div className="space-y-8">
          {/* Estado Vazio Elegante */}
          <Card className="border-dashed border-2 border-gray-200">
            <CardContent className="p-12 text-center">
              <div className="mx-auto w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Dashboard de Conformidade Vazio
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Esta empresa ainda não possui dados de conformidade. Comece fazendo upload de documentos 
                e executando análises para monitorar o compliance.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Fazer Upload de Documentos
                </Button>
                <Button variant="outline">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Ver Guia de Uso
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Cards de Exemplo (Desabilitados) */}
          <div className="grid gap-6 opacity-50">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="pointer-events-none">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">Carregando...</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">-</div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Oportunidades de Melhoria Identificadas</h2>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">
                  Nenhum gap identificado ainda
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Avaliações Recentes</h2>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">
                  Nenhuma análise executada ainda
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}