'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Clock, CheckCircle, EyeOff } from 'lucide-react'

interface AlertaConformidade {
  id: string
  empresa_id: string
  tipo: 'oportunidade' | 'risco' | 'prazo' | 'conformidade'
  severidade: 'baixa' | 'media' | 'alta' | 'critica'
  titulo: string
  descricao: string
  acao_requerida: string
  prazo: string | null
  status: 'ativo' | 'resolvido' | 'ignorado'
  created_at: string
  resolved_at: string | null
}

interface AlertasListProps {
  empresaId: string
  limit?: number
  showActions?: boolean
}

export function AlertasList({ empresaId, limit = 5, showActions = true }: AlertasListProps) {
  const [alertas, setAlertas] = useState<AlertaConformidade[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAlertas = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(`/api/alertas?empresa_id=${empresaId}&status=ativo&limit=${limit}`)
        
        if (!response.ok) {
          throw new Error('Erro ao carregar alertas')
        }

        const result = await response.json()
        
        if (result.success) {
          setAlertas(result.data)
        } else {
          throw new Error(result.error || 'Erro desconhecido')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar alertas')
      } finally {
        setLoading(false)
      }
    }

    if (empresaId) {
      fetchAlertas()
    }
  }, [empresaId, limit])

  const getSeveridadeVariant = (severidade: string) => {
    switch (severidade) {
      case 'critica': return 'destructive'
      case 'alta': return 'destructive'
      case 'media': return 'default'
      case 'baixa': return 'secondary'
      default: return 'secondary'
    }
  }

  const getSeveridadeIcon = (severidade: string) => {
    switch (severidade) {
      case 'critica': return <AlertTriangle className="h-4 w-4" />
      case 'alta': return <AlertTriangle className="h-4 w-4" />
      case 'media': return <Clock className="h-4 w-4" />
      case 'baixa': return <Clock className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'oportunidade': return 'Oportunidade'
      case 'risco': return 'Risco'
      case 'prazo': return 'Prazo'
      case 'conformidade': return 'Conformidade'
      default: return tipo
    }
  }

  const getSeveridadeLabel = (severidade: string) => {
    switch (severidade) {
      case 'critica': return 'Crítica'
      case 'alta': return 'Alta'
      case 'media': return 'Média'
      case 'baixa': return 'Baixa'
      default: return severidade
    }
  }

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatarPrazo = (prazo: string | null) => {
    if (!prazo) return null
    
    const dataPrazo = new Date(prazo)
    const hoje = new Date()
    const diffTime = dataPrazo.getTime() - hoje.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) {
      return { texto: `Vencido há ${Math.abs(diffDays)} dias`, urgente: true }
    } else if (diffDays === 0) {
      return { texto: 'Vence hoje', urgente: true }
    } else if (diffDays <= 3) {
      return { texto: `Vence em ${diffDays} dias`, urgente: true }
    } else {
      return { texto: `Vence em ${diffDays} dias`, urgente: false }
    }
  }

  const handleMarcarResolvido = async (alertaId: string) => {
    try {
      const response = await fetch(`/api/alertas/${alertaId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'resolvido' })
      })

      if (response.ok) {
        // Atualizar lista local
        setAlertas(prev => prev.filter(alerta => alerta.id !== alertaId))
      }
    } catch (err) {
      console.error('Erro ao marcar alerta como resolvido:', err)
    }
  }

  const handleIgnorar = async (alertaId: string) => {
    try {
      const response = await fetch(`/api/alertas/${alertaId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'ignorado' })
      })

      if (response.ok) {
        // Atualizar lista local
        setAlertas(prev => prev.filter(alerta => alerta.id !== alertaId))
      }
    } catch (err) {
      console.error('Erro ao ignorar alerta:', err)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Alertas de Conformidade
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Alertas de Conformidade
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 text-sm">Erro: {error}</p>
        </CardContent>
      </Card>
    )
  }

  if (alertas.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Alertas de Conformidade
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
            <p className="text-muted-foreground">Nenhum alerta ativo</p>
            <p className="text-sm text-muted-foreground">Todas as conformidades estão em dia!</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Alertas de Conformidade
          <Badge variant="secondary">{alertas.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {alertas.map((alerta) => {
            const prazoInfo = formatarPrazo(alerta.prazo)
            
            return (
              <div key={alerta.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getSeveridadeIcon(alerta.severidade)}
                      <h4 className="font-medium">{alerta.titulo}</h4>
                      <Badge variant={getSeveridadeVariant(alerta.severidade)}>
                        {getSeveridadeLabel(alerta.severidade)}
                      </Badge>
                      <Badge variant="outline">
                        {getTipoLabel(alerta.tipo)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {alerta.descricao}
                    </p>
                    <p className="text-sm font-medium">
                      Ação requerida: {alerta.acao_requerida}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <span className="text-muted-foreground">
                      Criado em: {formatarData(alerta.created_at)}
                    </span>
                    {prazoInfo && (
                      <span className={`flex items-center gap-1 ${
                        prazoInfo.urgente ? 'text-red-600 font-medium' : 'text-muted-foreground'
                      }`}>
                        <Clock className="h-3 w-3" />
                        {prazoInfo.texto}
                      </span>
                    )}
                  </div>
                  
                  {showActions && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMarcarResolvido(alerta.id)}
                        className="flex items-center gap-1"
                      >
                        <CheckCircle className="h-3 w-3" />
                        Resolver
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleIgnorar(alerta.id)}
                        className="flex items-center gap-1"
                      >
                        <EyeOff className="h-3 w-3" />
                        Ignorar
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
