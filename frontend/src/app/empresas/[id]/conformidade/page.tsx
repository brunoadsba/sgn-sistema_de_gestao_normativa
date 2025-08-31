'use client'

import { use, useEffect, useState } from 'react'
import { Kpis } from '@/components/conformidade/Kpis'
import { GapsTable, type GapItem } from '@/components/conformidade/GapsTable'
import { JobsList, type JobItem } from '@/components/conformidade/JobsList'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

type KpisData = {
  totalJobs: number
  runningJobs: number
  completedJobs: number
  failedJobs: number
  totalGaps: number
  documentos: number
  complianceScore: number
  lastUpdated?: string
}

type DashboardResponse = {
  success: boolean
  data?: { kpis: KpisData; gapsRecentes: GapItem[] }
}

type JobsResponse = {
  success: boolean
  data?: JobItem[]
}

export default function ConformidadeEmpresaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: empresaId } = use(params)
  const [loading, setLoading] = useState(true)
  const [kpis, setKpis] = useState<KpisData | null>(null)
  const [gaps, setGaps] = useState<GapItem[]>([])
  const [jobs, setJobs] = useState<JobItem[]>([])

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true)

        const [dashRes, jobsRes] = await Promise.all([
          fetch(`/api/conformidade/dashboard/${empresaId}`, { cache: 'no-store' }),
          fetch(`/api/conformidade/analisar?empresa_id=${empresaId}`, { cache: 'no-store' }),
        ])

        if (dashRes.ok) {
          const d: DashboardResponse = await dashRes.json()
          if (d?.success && d?.data) {
            setKpis(d.data.kpis)
            setGaps(d.data.gapsRecentes || [])
          }
        }

        if (jobsRes.ok) {
          const j: JobsResponse = await jobsRes.json()
          if (j?.success && Array.isArray(j.data)) {
            setJobs(j.data)
          }
        }
      } finally {
        setLoading(false)
      }
    }

    fetchAll()
  }, [empresaId])

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Conformidade — Empresa</h1>
        <p className="text-muted-foreground">Visão executiva de compliance, gaps e processamento.</p>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-3 bg-muted rounded w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="h-6 bg-muted rounded w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        kpis && <Kpis data={kpis} />
      )}

      <Separator />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <h2 className="text-xl font-semibold">Gaps Recentes</h2>
          <GapsTable gaps={gaps} />
        </div>

        <div className="space-y-3">
          <h2 className="text-xl font-semibold">Jobs Recentes</h2>
          <JobsList jobs={jobs} />
        </div>
      </div>
    </div>
  )
}