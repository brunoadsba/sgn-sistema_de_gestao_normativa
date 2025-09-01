import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, CheckCircle, XCircle, Clock } from "lucide-react"
import Link from "next/link"
import { logger } from "@/utils/logger"

interface Norma {
  id: number
  codigo: string
  titulo: string
  orgao_publicador: string
  created_at: string
  data_criacao: string
  data_atualizacao: string
  nr_num: number
}

interface Stats {
  total: number
  ativas: number
  revogadas: number
  recentes: number
}

async function getStats(): Promise<Stats> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/api/normas/stats`, {
      next: { revalidate: 60 }
    })
    
    if (!response.ok) {
      throw new Error('Falha ao carregar estatísticas')
    }
    
    const result = await response.json()
    return result.data
  } catch (error) {
    logger.error({ error }, 'Erro ao buscar estatísticas')
    return {
      total: 0,
      ativas: 0,
      revogadas: 0,
      recentes: 0
    }
  }
}

async function getRecentNormas(): Promise<Norma[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/api/normas?limit=5&sort=created_at&order=desc`, {
      next: { revalidate: 60 }
    })
    
    if (!response.ok) {
      throw new Error('Falha ao carregar normas recentes')
    }
    
    const data = await response.json()
    return data.data || []
  } catch (error) {
    logger.error({ error }, 'Erro ao buscar normas recentes')
    return []
  }
}

// Função para detectar status baseado no código/título
function getNormaStatus(norma: Norma): 'ativa' | 'revogada' {
  const codigo = norma.codigo?.toLowerCase() || ''
  const titulo = norma.titulo?.toLowerCase() || ''
  
  // Se contém "revogada" no código ou título, é revogada
  if (codigo.includes('revogada') || titulo.includes('revogada')) {
    return 'revogada'
  }
  
  // Por padrão, considera ativa
  return 'ativa'
}

export default async function DashboardPage() {
  const [stats, recentNormas] = await Promise.all([
    getStats(),
    getRecentNormas()
  ])

  const metricCards = [
    {
      title: "Total de Normas",
      value: stats.total || 0,
      icon: FileText,
      color: "sgn-primary",
      description: "Normas monitoradas"
    },
    {
      title: "Normas Ativas",
      value: stats.ativas || 0,
      icon: CheckCircle,
      color: "sgn-success",
      description: "Em vigor"
    },
    {
      title: "Normas Revogadas",
      value: stats.revogadas || 0,
      icon: XCircle,
      color: "sgn-danger",
      description: "Descontinuadas"
    },
    {
      title: "Atualizações",
      value: stats.recentes || 0,
      icon: Clock,
      color: "sgn-warning",
      description: "Últimos 30 dias"
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-sgn-md py-sgn-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-sgn-3xl font-sgn-bold text-foreground">
                Dashboard
              </h1>
              <p className="text-sgn-lg text-muted-foreground mt-sgn-xs">
                Sistema de Gestão Normativa - Dados em tempo real
              </p>
            </div>
            <Link href="/normas">
              <Button size="lg" className="shadow-sgn-md">
                <FileText className="mr-sgn-sm h-sgn-sm w-sgn-sm" />
                Ver Todas as Normas
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-sgn-md py-sgn-lg">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-sgn-lg mb-sgn-xl">
          {metricCards.map((metric, index) => {
            const Icon = metric.icon
            return (
              <Card 
                key={index} 
                variant="elevated" 
                className="group hover:shadow-sgn-lg transition-all duration-sgn-normal"
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-sgn-sm">
                  <CardTitle className="text-sgn-sm font-sgn-medium text-muted-foreground">
                    {metric.title}
                  </CardTitle>
                  <Icon className={`h-sgn-lg w-sgn-lg text-${metric.color}-500`} />
                </CardHeader>
                <CardContent>
                  <div className="text-sgn-3xl font-sgn-bold text-foreground mb-sgn-xs">
                    {metric.value}
                  </div>
                  <p className="text-sgn-xs text-muted-foreground">
                    {metric.description}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Recent Normas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-sgn-lg">
          <Card variant="elevated" className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-sgn-sm">
                <Clock className="h-sgn-lg w-sgn-lg text-sgn-primary-500" />
                Normas Recentes
              </CardTitle>
              <CardDescription>
                Últimas normas adicionadas ao sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentNormas.length > 0 ? (
                <div className="space-y-sgn-sm">
                  {recentNormas.map((norma) => {
                    const status = getNormaStatus(norma)
                    return (
                      <div 
                        key={norma.id}
                        className="flex items-center justify-between p-sgn-sm rounded-sgn-md border border-border hover:bg-muted/50 transition-colors duration-sgn-fast"
                      >
                        <div className="flex items-center gap-sgn-sm">
                          <FileText className="h-sgn-sm w-sgn-sm text-muted-foreground" />
                          <div>
                            <p className="text-sgn-sm font-sgn-medium text-foreground">
                              {norma.codigo}
                            </p>
                            <p className="text-sgn-xs text-muted-foreground">
                              {norma.titulo}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-sgn-sm">
                          <Badge 
                            variant={status === 'ativa' ? 'success' : 'destructive'}
                            size="sm"
                          >
                            {status === 'ativa' ? 'Ativa' : 'Revogada'}
                          </Badge>
                          <Link href={`/normas/${norma.id}`}>
                            <Button size="sm" variant="outline">
                              Ver Detalhes
                            </Button>
                          </Link>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-sgn-xl">
                  <FileText className="h-sgn-xl w-sgn-xl text-muted-foreground mx-auto mb-sgn-sm" />
                  <p className="text-sgn-sm text-muted-foreground">
                    Nenhuma norma encontrada
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
