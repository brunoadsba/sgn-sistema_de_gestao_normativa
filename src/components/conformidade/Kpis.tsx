'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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

export function Kpis({ data }: { data: DashboardKpis }) {
  // Verificação de segurança para dados undefined
  if (!data) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Carregando...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const items = [
    { label: 'Total de Avaliações Realizadas', value: data.totalAnalises ?? 0 },
    { label: 'Em Andamento', value: data.analisesProcessando ?? 0 },
    { label: 'Concluídas', value: data.analisesCompletas ?? 0 },
    { label: 'Não Conformes', value: data.analisesFalharam ?? 0 },
    { label: 'Pendentes', value: data.analisesPendentes ?? 0 },
    { label: 'Oportunidades de Melhoria', value: data.totalLacunas ?? 0 },
    { label: 'Documentos Avaliados', value: data.documentos ?? 0 },
    { label: 'Índice de Conformidade (%)', value: Math.round(data.pontuacaoConformidade ?? 0) },
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
