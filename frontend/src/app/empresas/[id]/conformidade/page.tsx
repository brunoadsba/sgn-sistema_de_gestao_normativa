'use client'
import { use, useEffect, useState } from 'react'
import { DynamicKpis, DynamicGapsTable, DynamicJobsList } from '@/components/dynamic/DynamicComponents'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { LoadingSpinner } from '@/components/loading/LoadingSpinner'
import { usePerformanceMonitoring } from '@/lib/performance'

// Importar tipos dos componentes existentes
import type { GapItem } from '@/components/conformidade/GapsTable'
import type { JobItem } from '@/components/conformidade/JobsList'

// Definir tipo local para KPIs baseado no componente
type DashboardKpis = {
  totalJobs: number
  runningJobs: number
  completedJobs: number
  failedJobs: number
  totalGaps: number
  documentos: number
  complianceScore: number
  lastUpdated?: string
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

  usePerformanceMonitoring('/empresas/[id]/conformidade')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Buscar apenas dashboard (remover analiseResponse não usado)
        const dashboardResponse = await fetch(`/api/conformidade/dashboard/${empresaId}`)

        if (!dashboardResponse.ok) {
          throw new Error('Erro ao carregar dashboard')
        }

        const dashboardResult = await dashboardResponse.json()
        
        if (dashboardResult.success) {
          setDashboardData(dashboardResult.data)
        } else {
          throw new Error(dashboardResult.error || 'Erro desconhecido')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar dados')
      } finally {
        setLoading(false)
      }
    }

    if (empresaId) {
      fetchData()
    }
  }, [empresaId])

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
        <Card>
          <CardContent className="p-6">
            <p className="text-red-600">Erro: {error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard de Conformidade</h1>
      
      {dashboardData && (
        <>
          <div className="mb-8">
            <DynamicKpis data={dashboardData.kpis} />
          </div>
          
          <Separator className="my-8" />
          
          <div className="grid gap-8">
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Gaps de Conformidade</h2>
              </CardHeader>
              <CardContent>
                <DynamicGapsTable gaps={dashboardData.gaps} />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Análises Recentes</h2>
              </CardHeader>
              <CardContent>
                <DynamicJobsList jobs={dashboardData.jobs} />
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}