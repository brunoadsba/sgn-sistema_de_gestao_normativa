'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, AlertTriangle, Clock } from 'lucide-react'
import { fetchWithRetry } from '@/lib/fetch-with-retry'
import { ErrorDisplay } from '@/components/ui/ErrorDisplay'

interface AnaliseResultado {
  score: number
  nivelRisco: string
  gaps: Array<{
    id: string
    descricao: string
    severidade: string
    categoria: string
    recomendacao: string
    prazo: string
  }>
  resumo: string
  conformidadeNR6: {
    ca_valido: boolean
    treinamento_realizado: boolean
    epi_adequado: boolean
    documentacao_completa: boolean
  }
}

export function NR6Cliente() {
  const [documento, setDocumento] = useState('')
  const [tipoDocumento, setTipoDocumento] = useState('')
  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState<AnaliseResultado | null>(null)
  const [error, setError] = useState('')

  const analisarDocumento = async () => {
    if (!documento || !tipoDocumento) {
      setError('Preencha todos os campos obrigatórios')
      return
    }

    setLoading(true)
    setError('')
    setResultado(null)

    try {
      const response = await fetchWithRetry('/api/nr6/analisar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documento,
          tipoDocumento,
        }),
      }, { retries: 3, timeoutMs: 90_000 })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro na análise')
      }

      setResultado(data.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  const getRiscoColor = (risco: string) => {
    switch (risco) {
      case 'baixo': return 'bg-green-500'
      case 'medio': return 'bg-yellow-500'
      case 'alto': return 'bg-orange-500'
      case 'critico': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getSeveridadeIcon = (severidade: string) => {
    switch (severidade) {
      case 'baixa': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'media': return <Clock className="h-4 w-4 text-yellow-500" />
      case 'alta': return <AlertTriangle className="h-4 w-4 text-orange-500" />
      case 'critica': return <XCircle className="h-4 w-4 text-red-500" />
      default: return null
    }
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 max-w-5xl">
      <div className="text-center relative py-6 sm:py-8 mb-8">
        <div className="absolute inset-0 bg-sgn-primary-500/10 blur-[80px] pointer-events-none" />
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground relative">
          NR-6 - Analise de EPIs
        </h1>
        <p className="text-base text-muted-foreground mt-3 relative">
          Analise especializada de conformidade com a NR-6 (Equipamento de Protecao Individual)
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Analisar Documento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Tipo de Documento</label>
              <Select value={tipoDocumento} onValueChange={setTipoDocumento}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ficha_entrega_epi">Ficha de Entrega de EPI</SelectItem>
                  <SelectItem value="treinamento_epi">Treinamento de EPI</SelectItem>
                  <SelectItem value="inspecao_epi">Inspeção de EPI</SelectItem>
                  <SelectItem value="pgr">PGR (Programa de Gerenciamento de Riscos) ⭐ Principal</SelectItem>
                  <SelectItem value="nr1_gro">NR-1 GRO</SelectItem>
                  <SelectItem value="ppra">PPRA (Legado - substituído por PGR)</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Documento</label>
              <Textarea
                value={documento}
                onChange={(e) => setDocumento(e.target.value)}
                placeholder="Cole aqui o conteúdo do documento para análise..."
                rows={8}
              />
            </div>

            {error ? <ErrorDisplay message={error} onRetry={analisarDocumento} compact /> : null}

            <Button
              onClick={analisarDocumento}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Analisando...' : 'Analisar com NR-6'}
            </Button>
          </CardContent>
        </Card>

        {resultado && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Resultado da Análise
                <Badge className={getRiscoColor(resultado.nivelRisco)}>
                  Score: {resultado.score}/100
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="flex items-center gap-2">
                  {resultado.conformidadeNR6.ca_valido ?
                    <CheckCircle className="h-4 w-4 text-green-500" /> :
                    <XCircle className="h-4 w-4 text-red-500" />
                  }
                  <span className="text-sm">CA Válido</span>
                </div>
                <div className="flex items-center gap-2">
                  {resultado.conformidadeNR6.treinamento_realizado ?
                    <CheckCircle className="h-4 w-4 text-green-500" /> :
                    <XCircle className="h-4 w-4 text-red-500" />
                  }
                  <span className="text-sm">Treinamento</span>
                </div>
                <div className="flex items-center gap-2">
                  {resultado.conformidadeNR6.epi_adequado ?
                    <CheckCircle className="h-4 w-4 text-green-500" /> :
                    <XCircle className="h-4 w-4 text-red-500" />
                  }
                  <span className="text-sm">EPI Adequado</span>
                </div>
                <div className="flex items-center gap-2">
                  {resultado.conformidadeNR6.documentacao_completa ?
                    <CheckCircle className="h-4 w-4 text-green-500" /> :
                    <XCircle className="h-4 w-4 text-red-500" />
                  }
                  <span className="text-sm">Documentação</span>
                </div>
              </div>

              <div>
                <h4 className="font-medium">Resumo</h4>
                <p className="text-sm text-muted-foreground">{resultado.resumo}</p>
              </div>

              <div>
                <h4 className="font-medium">Gaps Identificados ({resultado.gaps.length})</h4>
                <div className="space-y-2">
                  {resultado.gaps.map((gap) => (
                    <div key={gap.id} className="border rounded-2xl p-3">
                      <div className="flex items-center gap-2 mb-1">
                        {getSeveridadeIcon(gap.severidade)}
                        <Badge variant="outline">{gap.categoria}</Badge>
                        <span className="text-xs text-muted-foreground">{gap.prazo}</span>
                      </div>
                      <p className="text-sm font-medium">{gap.descricao}</p>
                      <p className="text-xs text-muted-foreground mt-1">{gap.recomendacao}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
