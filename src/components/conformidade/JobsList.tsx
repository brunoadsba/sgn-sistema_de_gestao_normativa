'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

export type JobItem = {
  id: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  progresso?: number
  prioridade?: number
  created_at?: string
}

function statusVariant(s: JobItem['status']) {
  switch (s) {
    case 'completed': return 'default'
    case 'running': return 'secondary'
    case 'pending': return 'outline'
    case 'failed': return 'destructive'
    case 'cancelled': return 'outline'
    default: return 'secondary'
  }
}

export function JobsList({ jobs }: { jobs: JobItem[] }) {
  if (!jobs?.length) {
    return <div className="text-sm text-muted-foreground">Nenhum job encontrado.</div>
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {jobs.map((j) => (
        <Card key={j.id}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center justify-between">
              <span>Job {j.id.slice(0, 8)}</span>
              <Badge variant={statusVariant(j.status)}>{j.status}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Progress value={j.progresso ?? 0} />
            <div className="text-xs text-muted-foreground">
              Prioridade: {j.prioridade ?? '-'} · Criado em: {j.created_at ? new Date(j.created_at).toLocaleString() : '-'}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
