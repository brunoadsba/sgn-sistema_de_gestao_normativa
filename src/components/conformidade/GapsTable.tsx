'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export type GapItem = {
  id: string
  normaCodigo?: string
  descricao: string
  severidade: 'baixa' | 'media' | 'alta' | 'critica'
  recomendacao?: string
}

function severityVariant(sev: GapItem['severidade']) {
  switch (sev) {
    case 'critica': return 'destructive'
    case 'alta': return 'default'
    case 'media': return 'secondary'
    case 'baixa': return 'outline'
    default: return 'secondary'
  }
}

export function GapsTable({ gaps }: { gaps: GapItem[] }) {
  if (!gaps?.length) {
    return <div className="text-sm text-muted-foreground">Nenhum gap identificado.</div>
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Norma</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Severidade</TableHead>
            <TableHead>Recomendação</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {gaps.map((g) => (
            <TableRow key={g.id}>
              <TableCell className="font-medium">{g.normaCodigo || '-'}</TableCell>
              <TableCell>{g.descricao}</TableCell>
              <TableCell>
                <Badge variant={severityVariant(g.severidade)}>{g.severidade}</Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">{g.recomendacao || '-'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
