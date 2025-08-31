'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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

export function Kpis({ data }: { data: DashboardKpis }) {
  const items = [
    { label: 'Jobs (total)', value: data.totalJobs },
    { label: 'Em processamento', value: data.runningJobs },
    { label: 'Concluídos', value: data.completedJobs },
    { label: 'Falhados', value: data.failedJobs },
    { label: 'Gaps', value: data.totalGaps },
    { label: 'Documentos', value: data.documentos },
    { label: 'Score (%)', value: Math.round(data.complianceScore ?? 0) },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((it) => (
        <Card key={it.label}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">{it.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Number.isFinite(it.value as number) ? it.value : '-'}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
